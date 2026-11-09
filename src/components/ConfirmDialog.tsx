import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { ErrorAlert } from './ErrorAlert'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  isPending: boolean
  /** Error de la última confirmación, que se muestra en el diálogo. */
  error: unknown
  onConfirm: () => void
  onClose: () => void
}

/** Pide confirmación antes de una acción (ej. quitar un bono). */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isPending,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error !== null && (
          <Box sx={{ mb: 2 }}>
            <ErrorAlert error={error} />
          </Box>
        )}
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} loading={isPending}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
