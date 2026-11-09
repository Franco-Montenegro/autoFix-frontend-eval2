import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import { ApiError } from '../../api/ApiError'
import { createVehicle } from '../../api/vehicles'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useNotify } from '../../components/notifications/useNotify'
import type { EngineType, VehicleType } from '../../types/enums'
import type { CreateVehicleRequest } from '../../types/vehicle'
import { ENGINE_TYPE_LABELS, toOptions, VEHICLE_TYPE_LABELS } from '../../utils/labels'

interface FormValues {
  licensePlate: string
  brand: string
  model: string
  vehicleType: VehicleType | ''
  manufactureYear: string
  engineType: EngineType | ''
  seats: string
}

type FieldName = keyof FormValues
type FormErrors = Partial<Record<FieldName, string>>

const EMPTY_FORM: FormValues = {
  licensePlate: '',
  brand: '',
  model: '',
  vehicleType: '',
  manufactureYear: '',
  engineType: '',
  seats: '',
}

const PLATE_PATTERN = /^[A-Za-z]{4}[0-9]{2}$/
const REQUIRED_MESSAGE = 'Campo obligatorio'

/** Validación básica en el navegador; la que vale es la del backend. */
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  for (const field of Object.keys(values) as FieldName[]) {
    if (values[field].trim() === '') {
      errors[field] = REQUIRED_MESSAGE
    }
  }
  if (!errors.licensePlate && !PLATE_PATTERN.test(values.licensePlate.trim())) {
    errors.licensePlate = 'Debe tener 4 letras y 2 números (ej. ABCD12)'
  }
  return errors
}

function toRequest(values: FormValues): CreateVehicleRequest {
  return {
    licensePlate: values.licensePlate.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    vehicleType: values.vehicleType as VehicleType,
    manufactureYear: Number(values.manufactureYear),
    engineType: values.engineType as EngineType,
    seats: Number(values.seats),
  }
}

/** Diálogo de registro de un vehículo. Se monta al abrirse, así que parte siempre vacío. */
export function VehicleFormDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [clientErrors, setClientErrors] = useState<FormErrors>({})

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: async (vehicle) => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      notify(`Vehículo ${vehicle.licensePlate} registrado`)
      onClose()
    },
  })

  const apiError = mutation.error instanceof ApiError ? mutation.error : null

  function fieldError(field: FieldName): string | undefined {
    return clientErrors[field] ?? apiError?.fieldError(field)
  }

  function handleChange(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setClientErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validate(values)
    setClientErrors(errors)
    if (Object.keys(errors).length === 0) {
      mutation.mutate(toRequest(values))
    }
  }

  function textFieldProps(field: FieldName, label: string) {
    const error = fieldError(field)
    return {
      label,
      value: values[field],
      onChange: (event: { target: { value: string } }) => handleChange(field, event.target.value),
      error: error !== undefined,
      helperText: error,
      required: true,
      fullWidth: true,
    }
  }

  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>Registrar vehículo</DialogTitle>
        <DialogContent>
          {mutation.error && (
            <Box sx={{ mb: 2 }}>
              <ErrorAlert error={mutation.error} />
            </Box>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              {...textFieldProps('licensePlate', 'Patente')}
              autoFocus
              slotProps={{ htmlInput: { maxLength: 6, style: { textTransform: 'uppercase' } } }}
            />
            <TextField {...textFieldProps('brand', 'Marca')} slotProps={{ htmlInput: { maxLength: 50 } }} />
            <TextField {...textFieldProps('model', 'Modelo')} slotProps={{ htmlInput: { maxLength: 50 } }} />
            <TextField {...textFieldProps('vehicleType', 'Tipo de vehículo')} select>
              {toOptions(VEHICLE_TYPE_LABELS).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField {...textFieldProps('manufactureYear', 'Año de fabricación')} type="number" />
            <TextField {...textFieldProps('engineType', 'Tipo de motor')} select>
              {toOptions(ENGINE_TYPE_LABELS).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField {...textFieldProps('seats', 'Número de asientos')} type="number" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Registrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
