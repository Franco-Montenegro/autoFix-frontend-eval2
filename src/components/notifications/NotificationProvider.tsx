import { useCallback, useState, type ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { NotificationContext } from './NotificationContext'

interface Notification {
  key: number
  message: string
}

/** Muestra avisos breves de éxito (ej. "Vehículo registrado") en la parte inferior. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [open, setOpen] = useState(false)

  const notify = useCallback((message: string) => {
    setNotification({ key: Date.now(), message })
    setOpen(true)
  }, [])

  return (
    <NotificationContext value={notify}>
      {children}
      <Snackbar
        key={notification?.key}
        open={open}
        autoHideDuration={4000}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') {
            setOpen(false)
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setOpen(false)}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext>
  )
}
