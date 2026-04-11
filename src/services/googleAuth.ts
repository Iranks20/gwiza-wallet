import { API_CONFIG } from '@/config/environment'

export type UserProfileType = 'opco' | 'global'

export type MenuOption = {
  id?: number
  menuLabel: string
  routePath: string | null
  parentKey: string | null
  sortOrder: number
  menuKey: string
  isGroup: boolean
  onMenu?: string | null
  css?: string | null
  menuScope?: string | null
}

type MenuOptionDto = {
  id?: number
  menu_id?: number
  menu_label?: string
  route_path?: string | null
  parent_key?: string | null
  sort_order?: number
  menu_key?: string
  is_group?: boolean
  on_menu?: string | null
  css?: string | null
  menu_scope?: string | null
}

function dtoToMenuOption(dto: MenuOptionDto): MenuOption | null {
  const menuKey = String(dto.menu_key ?? '').trim()
  const menuLabel = String(dto.menu_label ?? '').trim()
  if (!menuKey || !menuLabel) return null
  const sortOrderRaw = dto.sort_order
  const sortOrder =
    typeof sortOrderRaw === 'number' && Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0
  return {
    id: dto.menu_id ?? dto.id,
    menuLabel,
    routePath: dto.route_path ?? null,
    parentKey: dto.parent_key ?? null,
    sortOrder,
    menuKey,
    isGroup: dto.is_group === true,
    onMenu: dto.on_menu ?? null,
    css: dto.css ?? null,
    menuScope: dto.menu_scope ?? null,
  }
}

export function parseMenuOptions(value: unknown): MenuOption[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    const items: MenuOption[] = []
    value.forEach((v) => {
      if (!v || typeof v !== 'object') return
      const opt = dtoToMenuOption(v as MenuOptionDto)
      if (opt) items.push(opt)
    })
    return items.sort((a, b) => a.sortOrder - b.sortOrder)
  }
  if (typeof value !== 'object') return []
  const rec = value as Record<string, unknown>
  const items: MenuOption[] = []
  Object.values(rec).forEach((v) => {
    if (!v || typeof v !== 'object') return
    const opt = dtoToMenuOption(v as MenuOptionDto)
    if (opt) items.push(opt)
  })
  return items.sort((a, b) => a.sortOrder - b.sortOrder)
}

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
  menu_options?: unknown
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export type GoogleAuthResult = {
  user: GoogleBackendAuthPayload['user']
  menuOptions?: MenuOption[]
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
    menuOptions: parseMenuOptions((payload as { menu_options?: unknown })?.menu_options),
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
