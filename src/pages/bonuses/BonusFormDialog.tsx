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
import { createBonus } from '../../api/bonuses'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useNotify } from '../../components/notifications/useNotify'
import { BONUS_BRANDS, type BonusBrand, type CreateBonusRequest } from '../../types/bonus'
import { MONTH_OPTIONS } from '../../utils/dateTime'

interface FormValues {
  brand: BonusBrand | ''
  year: string
  month: string
  quantity: string
  amount: string
}

type FieldName = keyof FormValues
type FormErrors = Partial<Record<FieldName, string>>

interface BonusFormDialogProps {
  initialYear: number
  initialMonth: number
  onClose: () => void
}

function toRequest(values: FormValues): CreateBonusRequest {
  return {
    brand: values.brand as BonusBrand,
    year: Number(values.year),
    month: Number(values.month),
    quantity: Number(values.quantity),
    amount: Number(values.amount),
  }
}

/** Registro del cupo mensual de bonos de una marca. Se monta al abrirse. */
export function BonusFormDialog({ initialYear, initialMonth, onClose }: BonusFormDialogProps) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [values, setValues] = useState<FormValues>({
    brand: '',
    year: String(initialYear),
    month: String(initialMonth),
    quantity: '',
    amount: '',
  })
  const [clientErrors, setClientErrors] = useState<FormErrors>({})

  const mutation = useMutation({
    mutationFn: createBonus,
    onSuccess: async (bonus) => {
      await queryClient.invalidateQueries({ queryKey: ['bonuses'] })
      notify(`Cupo de ${bonus.brand} para ${bonus.month}/${bonus.year} registrado`)
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
    // Validación básica en el navegador (obligatorios); la que vale es la del backend.
    const errors: FormErrors = {}
    for (const field of Object.keys(values) as FieldName[]) {
      if (values[field].trim() === '') {
        errors[field] = 'Campo obligatorio'
      }
    }
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
        <DialogTitle>Registrar cupo de bonos</DialogTitle>
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
            <TextField {...textFieldProps('brand', 'Marca')} select autoFocus>
              {BONUS_BRANDS.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </TextField>
            <Box />
            <TextField {...textFieldProps('year', 'Año')} type="number" />
            <TextField {...textFieldProps('month', 'Mes')} select>
              {MONTH_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...textFieldProps('quantity', 'Cantidad de bonos')}
              type="number"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              {...textFieldProps('amount', 'Monto de cada bono ($)')}
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
            />
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
