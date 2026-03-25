import { API_CONFIG } from '@/config/environment'

export type UserProfileType = 'opco' | 'global'

export type GoogleBackendAuthPayload = {
  user: {
    user_account_id: string | number
    email_address: string
    full_name: string
    user_account_status: string
    access_level: number
    mfa_enabled: boolean
    country_id?: number
    user_profile_type?: UserProfileType
  }
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export type GoogleAuthResult = {
  user: GoogleBackendAuthPayload['user']
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

const AUTH_STORAGE_KEY = 'gwiza_auth'

export function setAuthFromResult(result: GoogleAuthResult): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }
}

export function updateStoredUser(updates: Partial<GoogleAuthResult['user']>): void {
  try {
    const current = getStoredAuth()
    if (!current?.user) return
    const updated = { ...current, user: { ...current.user, ...updates } }
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export function getStoredAuth(): GoogleAuthResult | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as GoogleAuthResult
    if (!data?.user || !data?.access_token) return null
    return data
  } catch {
    return null
  }
}

export function clearStoredAuth(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore
  }
}

function parseVerifyResponse(data: unknown): GoogleAuthResult {
  const envelope = data as { success?: boolean; data?: GoogleBackendAuthPayload }
  const payload = envelope?.data && envelope.success ? envelope.data : (data as GoogleBackendAuthPayload)
  if (!payload || typeof payload !== 'object' || !payload.user || !payload.access_token) {
    throw new Error('Invalid response from auth server')
  }
  const status = String(payload.user.user_account_status || '').toLowerCase()
  if (status !== 'active') {
    const msg =
      status === 'new'
        ? 'Your account is pending activation. Please contact support.'
        : 'Your account is not active. Please contact support.'
    throw new Error(msg)
  }
  return {
    user: payload.user,
    access_token: payload.access_token,
    token_type: payload.token_type ?? 'Bearer',
    expires_in: payload.expires_in ?? 0,
    scope: payload.scope ?? '',
  }
}

export type GoogleLoginMfaRequired = {
  requires2FA: true
  mfaChallengeToken: string
  user: GoogleBackendAuthPayload['user']
}

export type GoogleLoginResult = GoogleAuthResult | GoogleLoginMfaRequired

export async function verifyIdTokenWithBackend(idToken: string): Promise<GoogleLoginResult> {
  const base = API_CONFIG.BASE_URL
  const url = `${String(base).replace(/\/$/, '')}/auth/google-login`
  const body = { auth_token: idToken }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(res.ok ? 'Invalid JSON from auth server' : `Request failed: ${res.status}`)
  }
  if (!res.ok) {
    const err = data as { resp_msg?: string; error?: string }
    throw new Error(err?.resp_msg ?? err?.error ?? `Request failed: ${res.status}`)
  }
  const envelope = data as {
    success?: boolean
    data?: {
      mfa_required?: boolean
      mfa_challenge_token?: string
      access_token?: string
      user?: Record<string, unknown> & { mfa_challenge_token?: string; mfa_required?: boolean }
    }
  }
  const inner = envelope?.data
  const userRaw = inner?.user
  const user = userRaw as GoogleBackendAuthPayload['user'] | undefined

  if (user && userRaw) {
    const mfaEnabled = user.mfa_enabled === true
    const mfaRequired =
      inner?.mfa_required === true || (userRaw as { mfa_required?: boolean })?.mfa_required === true
    const challengeToken =
      inner?.mfa_challenge_token ??
      (userRaw as { mfa_challenge_token?: string })?.mfa_challenge_token ??
      (mfaEnabled ? inner?.access_token : undefined)

    if ((mfaRequired || mfaEnabled) && challengeToken) {
      const { mfa_challenge_token: _ct, mfa_required: _mr, ...cleanUser } =
        userRaw as Record<string, unknown>
      return {
        requires2FA: true,
        mfaChallengeToken: challengeToken,
        user: cleanUser as GoogleBackendAuthPayload['user'],
      }
    }
  }
  return parseVerifyResponse(data)
}
