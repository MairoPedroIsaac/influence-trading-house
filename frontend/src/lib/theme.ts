import { useSyncExternalStore } from 'react'

// Dashboard theme (dark or light), saved in this browser.
export type Theme = 'dark' | 'light'

const KEY = 'ith_theme'
const listeners = new Set<() => void>()

function read(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // storage blocked: theme still changes for this visit
  }
  current = theme
  listeners.forEach((l) => l())
}

let current: Theme = read()

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
