import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import { ApiError } from '../../api/ApiError'
import { createRepairType, updateRepairType } from '../../api/repairTypes'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useNotify } from '../../components/notifications/useNotify'
import type { RepairType, RepairTypeRequest } from '../../types/repairType'

type FieldName = keyof RepairTypeRequest
type FormValues = Record<FieldName, string>
type FormErrors = Partial<Record<FieldName, string>>

const PRICE_FIELDS: { field: Exclude<FieldName, 'name'>; label: string }[] = [
  { field: 'priceGasoline', label: 'Precio gasolina' },
  { field: 'priceDiesel', label: 'Precio diésel' },
  { field: 'priceHybrid', label: 'Precio híbrido' },
  { field: 'priceElectric', label: 'Precio eléctrico' },
]

function toValues(repairType?: RepairType): FormValues {
  return {
    name: repairType?.name ?? '',
    priceGasoline: repairType ? String(repairType.priceGasoline) : '',
    priceDiesel: repairType ? String(repairType.priceDiesel) : '',
    priceHybrid: repairType ? String(repairType.priceHybrid) : '',
    priceElectric: repairType ? String(repairType.priceElectric) : '',
  }
}

/** Validación básica en el navegador; la que vale es la del backend. */
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  for (const field of Object.keys(values) as FieldName[]) {
    if (values[field].trim() === '') {
      errors[field] = 'Campo obligatorio'
    }
  }
  return errors
}

interface RepairTypeFormDialogProps {
  /** Reparación a modificar; si no se indica, se crea una nueva. */
  repairType?: RepairType
  onClose: () => void
}

/** Diálogo para agregar una reparación al catálogo o cambiar su nombre y precios (HU2). */
export function RepairTypeFormDialog({ repairType, onClose }: RepairTypeFormDialogProps) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [values, setValues] = useState<FormValues>(() => toValues(repairType))
  const [clientErrors, setClientErrors] = useState<FormErrors>({})
  const editing = repairType !== undefined

  const mutation = useMutation({
    mutationFn: (request: RepairTypeRequest) =>
      editing ? updateRepairType(repairType.id, request) : createRepairType(request),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['repair-types'] })
      notify(editing ? `Reparación "${saved.name}" actualizada` : `Reparación "${saved.name}" agregada`)
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
      mutation.mutate({
        name: values.name.trim(),
        priceGasoline: Number(values.priceGasoline),
        priceDiesel: Number(values.priceDiesel),
        priceHybrid: Number(values.priceHybrid),
        priceElectric: Number(values.priceElectric),
      })
    }
  }

  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{editing ? 'Modificar reparación' : 'Agregar reparación'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Un precio 0 significa que la reparación no aplica a ese tipo de motor.
            {editing && ' Los cambios de precio no alteran las reparaciones ya registradas.'}
          </DialogContentText>
          {mutation.error && (
            <Box sx={{ mb: 2 }}>
              <ErrorAlert error={mutation.error} />
            </Box>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Nombre"
              value={values.name}
              onChange={(event) => handleChange('name', event.target.value)}
              error={fieldError('name') !== undefined}
              helperText={fieldError('name')}
              required
              autoFocus
              sx={{ gridColumn: { sm: '1 / -1' } }}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {PRICE_FIELDS.map(({ field, label }) => (
              <TextField
                key={field}
                label={label}
                type="number"
                value={values[field]}
                onChange={(event) => handleChange(field, event.target.value)}
                error={fieldError(field) !== undefined}
                helperText={fieldError(field)}
                required
                slotProps={{ htmlInput: { min: 0, step: 1000 } }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            {editing ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
