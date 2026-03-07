const {
  VITE_API_BASE_URL,
  VITE_GOOGLE_CLIENT_ID,
  VITE_GOOGLE_AUTH_BASE_URL,
  VITE_APP_NAME,
  VITE_APP_VERSION,
  VITE_NODE_ENV,
  VITE_ENABLE_DEV_TOOLS,
  VITE_ENABLE_CONSOLE_LOGS,
  VITE_ENABLE_GOOGLE_AUTH,
  VITE_ENABLE_ADMIN_PANEL,
  VITE_DEBUG_MODE,
} = import.meta.env

export const API_CONFIG = {
  BASE_URL: VITE_API_BASE_URL ?? 'https://gwiza-wallet.up.railway.app/',
  ENDPOINTS: {
    AUTH: '/auth',
  },
} as const

export const GOOGLE_CONFIG = {
  CLIENT_ID: VITE_GOOGLE_CLIENT_ID ?? '',
  SCOPES: ['openid', 'email', 'profile'],
} as const

export const GOOGLE_AUTH_CONFIG = {
  BASE_URL: VITE_GOOGLE_AUTH_BASE_URL,
} as const

function toBool(v: string | boolean | undefined): boolean {
  if (typeof v === 'boolean') return v
  if (!v) return false
  return String(v).toLowerCase() === 'true'
}

export const FEATURE_FLAGS = {
  ENABLE_GOOGLE_AUTH: toBool(VITE_ENABLE_GOOGLE_AUTH),
  ENABLE_ADMIN_PANEL: toBool(VITE_ENABLE_ADMIN_PANEL),
  ENABLE_DEV_TOOLS: toBool(VITE_ENABLE_DEV_TOOLS),
  ENABLE_CONSOLE_LOGS: toBool(VITE_ENABLE_CONSOLE_LOGS),
  DEBUG_MODE: toBool(VITE_DEBUG_MODE),
} as const

export const APP_CONFIG = {
  NAME: VITE_APP_NAME ?? 'Wallet Admin',
  VERSION: VITE_APP_VERSION ?? '0.0.0',
  NODE_ENV: VITE_NODE_ENV ?? 'development',
} as const

