import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getRefreshToken, refreshAccess, setTokens } from '../lib/api'
import { AuthContext, type RegisterInput, type User } from './context'

type Tokens = { access: string; refresh: string }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On first load, use the saved refresh token to restore the session.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (await refreshAccess()) {
          const me = await api<User>('/auth/me/')
          if (active) setUser(me)
        }
      } catch {
        setTokens(null, null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const startSession = useCallback(async (tokens: Tokens) => {
    setTokens(tokens.access, tokens.refresh)
    const me = await api<User>('/auth/me/')
    setUser(me)
    return me
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await api<Tokens>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      return startSession(tokens)
    },
    [startSession],
  )

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const tokens = await api<Tokens>('/auth/google/', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      })
      return startSession(tokens)
    },
    [startSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      await api('/auth/register/', { method: 'POST', body: JSON.stringify(input) })
      return login(input.email.toLowerCase(), input.password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    try {
      // Tell the server to kill the refresh token, so it can never be reused.
      if (refresh) await api('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }, false)
    } catch {
      // Even if the server call fails, log out on this device.
    }
    setTokens(null, null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, register, logout, setUser }),
    [user, loading, login, loginWithGoogle, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
