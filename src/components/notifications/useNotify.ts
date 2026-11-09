import { use } from 'react'
import { NotificationContext, type NotifyFn } from './NotificationContext'

export function useNotify(): NotifyFn {
  const notify = use(NotificationContext)
  if (!notify) {
    throw new Error('useNotify debe usarse dentro de NotificationProvider')
  }
  return notify
}
