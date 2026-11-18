import { createContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
export type Toast = { id: number; kind: ToastKind; title: string; text?: string }

export type ToastApi = {
  success: (title: string, text?: string) => void
  error: (title: string, text?: string) => void
  info: (title: string, text?: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
