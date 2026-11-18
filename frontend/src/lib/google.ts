// Google OAuth client ID from frontend/.env (VITE_GOOGLE_CLIENT_ID).
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
export const googleEnabled = Boolean(GOOGLE_CLIENT_ID)
