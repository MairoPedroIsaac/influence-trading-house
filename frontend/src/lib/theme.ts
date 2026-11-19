import { useSyncExternalStore } from 'react'

// Dashboard theme, saved in this browser.
// "system" follows the phone or laptop setting (dark or light) automatically.
export type ThemeChoice = 'dark' | 'light' | 'system'
export type Theme = 'dark' | 'light'

const KEY = 'ith_theme'
const listeners = new Set<() => void>()
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)') : null

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'system' ? v : 'dark'
  } catch {
    return 'dark'
  }
}

let choice: ThemeChoice = readChoice()

function notify() {
  listeners.forEach((l) => l())
}

// When the device switches between dark and light, update screens using "system".
media?.addEventListener('change', notify)

export function setTheme(next: ThemeChoice) {
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // storage blocked: still change it for this visit
  }
  choice = next
  notify()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

// What the user picked: dark, light or system.
export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, () => choice)
}

// The theme actually shown right now: dark or light.
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () =>
    choice === 'system' ? (media?.matches ? 'light' : 'dark') : choice,
  )
}
