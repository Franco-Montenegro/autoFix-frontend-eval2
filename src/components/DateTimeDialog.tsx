import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { ApiError } from '../api/ApiError'
import { inputToApiDateTime, nowForInput } from '../utils/dateTime'
import { ErrorAlert } from './ErrorAlert'

interface DateTimeDialogProps {
  title: string
  label: string
  submitLabel: string
  isPending: boolean
  /** Error de la última confirmación; `errors[]` del campo `dateTime` se muestra en el campo. */
  error: unknown
  /** Recibe la fecha y hora en el formato de la API. */
  onSubmit: (dateTime: string) => void
  onClose: () => void
}

/** Diálogo para registrar una fecha y hora (ej. salida o retiro). Parte con la hora actual. */
export function DateTimeDialog({
  title,
  label,
  submitLabel,
  isPending,
  error,
  onSubmit,
  onClose,
}: DateTimeDialogProps) {
  const [value, setValue] = useState(nowForInput)
  const [required, setRequired] = useState(false)

  const fieldError = required
    ? 'Campo obligatorio'
    : error instanceof ApiError
      ? error.fieldError('dateTime')
      : undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (value === '') {
      setRequired(true)
      return
    }
    onSubmit(inputToApiDateTime(value))
  }

  return (
    <Dialog open onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {error !== null && (
            <Box sx={{ mb: 2 }}>
              <ErrorAlert error={error} />
            </Box>
          )}
          <TextField
            label={label}
            type="datetime-local"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setRequired(false)
            }}
            error={fieldError !== undefined}
            helperText={fieldError}
            required
            fullWidth
            sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isPending}>
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
