import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { ApiError } from '../../api/ApiError'
import { createRepairOrder, repairOrderQueryKey } from '../../api/repairOrders'
import { getRepairTypes } from '../../api/repairTypes'
import { getVehicles, vehicleRepairOrdersQueryKey } from '../../api/vehicles'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { RepairPrice } from '../../components/RepairPrice'
import { useNotify } from '../../components/notifications/useNotify'
import type { RepairType } from '../../types/repairType'
import type { VehicleResponse } from '../../types/vehicle'
import { inputToApiDateTime, nowForInput } from '../../utils/dateTime'
import { ENGINE_TYPE_LABELS, VEHICLE_TYPE_LABELS } from '../../utils/labels'
import { priceForEngine } from '../../utils/repairTypes'

type FieldName = 'licensePlate' | 'entryDateTime' | 'mileage' | 'items'
type FormErrors = Partial<Record<FieldName, string>>

const REQUIRED_MESSAGE = 'Campo obligatorio'

interface RepairOrderFormProps {
  vehicles: VehicleResponse[]
  repairTypes: RepairType[]
  initialPlate: string
}

function RepairOrderForm({ vehicles, repairTypes, initialPlate }: RepairOrderFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notify = useNotify()

  const [vehicle, setVehicle] = useState<VehicleResponse | null>(
    () => vehicles.find((item) => item.licensePlate === initialPlate) ?? null,
  )
  const [entryDateTime, setEntryDateTime] = useState(nowForInput)
  const [mileage, setMileage] = useState('')
  /** Reparaciones marcadas, cada una con su fecha y hora (valor de un input datetime-local). */
  const [repairDates, setRepairDates] = useState<Record<number, string>>({})
  const [clientErrors, setClientErrors] = useState<FormErrors>({})
  const selectedIds = Object.keys(repairDates).map(Number).sort((a, b) => a - b)

  const mutation = useMutation({
    mutationFn: createRepairOrder,
    onSuccess: async (order) => {
      queryClient.setQueryData(repairOrderQueryKey(order.id), order)
      await queryClient.invalidateQueries({
        queryKey: vehicleRepairOrdersQueryKey(order.licensePlate),
      })
      notify(`Ingreso N.º ${order.id} registrado`)
      void navigate(`/repair-orders/${order.id}`)
    },
  })

  const apiError = mutation.error instanceof ApiError ? mutation.error : null

  function fieldError(field: FieldName): string | undefined {
    return clientErrors[field] ?? apiError?.fieldError(field)
  }

  function clearError(field: FieldName) {
    setClientErrors((current) => ({ ...current, [field]: undefined }))
  }

  /** Al marcar una reparación se propone la fecha de ingreso; el usuario puede cambiarla. */
  function toggleRepair(id: number, checked: boolean) {
    setRepairDates((current) => {
      const next = { ...current }
      if (checked) {
        next[id] = entryDateTime
      } else {
        delete next[id]
      }
      return next
    })
    clearError('items')
  }

  /** Las reparaciones que aún tenían la fecha de ingreso anterior siguen a la nueva. */
  function changeEntryDateTime(value: string) {
    setRepairDates((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, date]) => [id, date === entryDateTime ? value : date]),
      ),
    )
    setEntryDateTime(value)
    clearError('entryDateTime')
  }

  /** Validación básica en el navegador; la que vale es la del backend. */
  function validate(): FormErrors {
    const errors: FormErrors = {}
    if (!vehicle) errors.licensePlate = REQUIRED_MESSAGE
    if (entryDateTime === '') errors.entryDateTime = REQUIRED_MESSAGE
    if (mileage.trim() === '') errors.mileage = REQUIRED_MESSAGE
    if (selectedIds.length === 0) errors.items = 'Seleccione al menos una reparación'
    else if (selectedIds.some((id) => repairDates[id] === '')) {
      errors.items = 'Indique la fecha y hora de cada reparación'
    }
    return errors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validate()
    setClientErrors(errors)
    if (Object.keys(errors).length > 0 || !vehicle) {
      return
    }
    mutation.mutate({
      licensePlate: vehicle.licensePlate,
      entryDateTime: inputToApiDateTime(entryDateTime),
      mileage: Number(mileage),
      items: selectedIds.map((id) => ({
        repairTypeId: id,
        repairDateTime: inputToApiDateTime(repairDates[id]),
      })),
    })
  }

  // La API informa los errores de cada reparación como "items[1].repairDateTime".
  const repairsError =
    fieldError('items') ??
    apiError?.errors.find((error) => error.field.startsWith('items['))?.message

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      {mutation.error && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert error={mutation.error} />
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Autocomplete
            options={vehicles}
            value={vehicle}
            onChange={(_event, value) => {
              setVehicle(value)
              // El precio depende del motor: al cambiar de vehículo se parte de cero.
              setRepairDates({})
              clearError('licensePlate')
            }}
            getOptionLabel={(option) => `${option.licensePlate} — ${option.brand} ${option.model}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No hay vehículos con esa patente"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vehículo (patente)"
                required
                error={fieldError('licensePlate') !== undefined}
                helperText={fieldError('licensePlate')}
              />
            )}
          />
          <TextField
            label="Fecha y hora de ingreso"
            type="datetime-local"
            value={entryDateTime}
            onChange={(event) => changeEntryDateTime(event.target.value)}
            required
            error={fieldError('entryDateTime') !== undefined}
            helperText={fieldError('entryDateTime')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Kilometraje"
            type="number"
            value={mileage}
            onChange={(event) => {
              setMileage(event.target.value)
              clearError('mileage')
            }}
            required
            error={fieldError('mileage') !== undefined}
            helperText={fieldError('mileage')}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Box>
        {vehicle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {VEHICLE_TYPE_LABELS[vehicle.vehicleType]} · {vehicle.manufactureYear} · Motor{' '}
            {ENGINE_TYPE_LABELS[vehicle.engineType].toLowerCase()}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl
          component="fieldset"
          error={repairsError !== undefined}
          disabled={!vehicle}
          fullWidth
        >
          <FormLabel component="legend" required>
            Reparaciones
          </FormLabel>
          {!vehicle && (
            <FormHelperText sx={{ mx: 0 }}>
              Seleccione un vehículo para ver los precios según su motor.
            </FormHelperText>
          )}
          <FormHelperText sx={{ mx: 0 }}>
            Cada reparación parte con la fecha de ingreso; puede cambiarla si se hizo otro día.
          </FormHelperText>
          <FormGroup sx={{ mt: 1 }}>
            {repairTypes.map((repair) => {
              const price = vehicle ? priceForEngine(repair, vehicle.engineType) : null
              const notApplicable = price === 0
              const selected = repair.id in repairDates
              return (
                <Box
                  key={repair.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 48 }}
                >
                  <FormControlLabel
                    disabled={!vehicle || notApplicable}
                    control={
                      <Checkbox
                        checked={selected}
                        onChange={(event) => toggleRepair(repair.id, event.target.checked)}
                      />
                    }
                    sx={{ mr: 0, flexGrow: 1, '& .MuiFormControlLabel-label': { flexGrow: 1 } }}
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <span>{repair.name}</span>
                        {price !== null && <RepairPrice price={price} />}
                      </Box>
                    }
                  />
                  {selected && (
                    <TextField
                      type="datetime-local"
                      size="small"
                      aria-label={`Fecha y hora de ${repair.name}`}
                      value={repairDates[repair.id]}
                      onChange={(event) => {
                        const value = event.target.value
                        setRepairDates((current) => ({ ...current, [repair.id]: value }))
                        clearError('items')
                      }}
                      slotProps={{ htmlInput: { min: entryDateTime } }}
                    />
                  )}
                </Box>
              )
            })}
          </FormGroup>
          {repairsError && <FormHelperText sx={{ mx: 0 }}>{repairsError}</FormHelperText>}
        </FormControl>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={() => void navigate(-1)} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" loading={mutation.isPending}>
          Registrar ingreso
        </Button>
      </Box>
    </Box>
  )
}

export function NewRepairOrderPage() {
  const [searchParams] = useSearchParams()
  const initialPlate = (searchParams.get('plate') ?? '').trim().toUpperCase()
  const vehiclesQuery = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles })
  const repairTypesQuery = useQuery({ queryKey: ['repair-types'], queryFn: getRepairTypes })

  return (
    <>
      <PageHeader title="Nuevo ingreso al taller" />
      {(vehiclesQuery.isPending || repairTypesQuery.isPending) && <Loading />}
      {vehiclesQuery.error && <ErrorAlert error={vehiclesQuery.error} />}
      {repairTypesQuery.error && <ErrorAlert error={repairTypesQuery.error} />}
      {vehiclesQuery.data && repairTypesQuery.data && (
        <RepairOrderForm
          // Se reinicia el formulario si se navega a otra patente preseleccionada.
          key={initialPlate}
          vehicles={vehiclesQuery.data}
          repairTypes={repairTypesQuery.data}
          initialPlate={initialPlate}
        />
      )}
    </>
  )
}
