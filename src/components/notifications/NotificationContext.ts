import { createContext } from 'react'

export type NotifyFn = (message: string) => void

export const NotificationContext = createContext<NotifyFn | null>(null)
