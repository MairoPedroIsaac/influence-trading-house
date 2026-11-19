import { createContext } from 'react'

export type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  date_joined: string
  has_password: boolean // false for Google-only accounts
  avatar_url: string | null // profile photo link, or null for initials
}

export type RegisterInput = {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export type AuthState = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: (credential: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthState | null>(null)
