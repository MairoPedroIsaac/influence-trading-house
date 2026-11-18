// Small API client for the Django backend.
// - Access token lives in memory only (gone on page refresh, safer).
// - Refresh token is kept in localStorage so you stay logged in.
//   TODO before production: move the refresh token to an httpOnly cookie.

const BASE = '/api/v1'
const REFRESH_KEY = 'ith_refresh'

let accessToken: string | null = null

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string | null, refresh?: string | null) {
  accessToken = access
  if (refresh === null) localStorage.removeItem(REFRESH_KEY)
  else if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, data: unknown) {
    super(firstMessage(data) ?? `Request failed (${status})`)
    this.status = status
    this.data = data
  }
}

// Turns Django/DRF error JSON into one readable sentence.
function firstMessage(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return firstMessage(data[0])
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (obj.detail) return firstMessage(obj.detail)
    for (const [key, value] of Object.entries(obj)) {
      const msg = firstMessage(value)
      if (msg) return key === 'non_field_errors' ? msg : `${label(key)}: ${msg}`
    }
  }
  return null
}

function label(key: string) {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

// If several calls need a refresh at the same time, they share one request.
let refreshing: Promise<boolean> | null = null

function refreshAccess(): Promise<boolean> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function doRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  const res = await fetch(`${BASE}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) {
    setTokens(null, null)
    return false
  }
  const data = await res.json()
  // Backend rotates refresh tokens, so save the new one if sent.
  setTokens(data.access, data.refresh ?? undefined)
  return true
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Access token expired or missing: try a refresh once, then repeat.
  if (res.status === 401 && retry && (await refreshAccess())) {
    return api<T>(path, options, false)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new ApiError(res.status, data)
  return data as T
}

export { refreshAccess }
