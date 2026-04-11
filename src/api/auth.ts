import { parseMenuOptions, type MenuOption } from '@/services/googleAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://gwiza-wallet.up.railway.app/'


function buildUrl(path: string): string {
  return `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export type MfaCompleteLoginResponse = {
  user: {
    user_account_id: string | number
    email_address: string
    full_name: string
    user_account_status: string
    access_level: number
    mfa_enabled: boolean
    [key: string]: unknown
  }
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  menuOptions: MenuOption[]
}

export const authApi = {
  /** Complete login after 2FA verification. No auth header needed. */
  async mfaCompleteLogin(
    mfaChallengeToken: string,
    code: string
  ): Promise<MfaCompleteLoginResponse> {
    const res = await fetch(buildUrl('/auth/mfa-login/complete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mfa_challenge_token: mfaChallengeToken, code }),
    })
    const text = await res.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      throw new Error(res.ok ? 'Invalid JSON' : `Request failed: ${res.status}`)
    }
    if (!res.ok) {
      const err = data as { resp_msg?: string; error?: string }
      throw new Error(err?.resp_msg ?? err?.error ?? `Request failed: ${res.status}`)
    }
    const envelope = data as { success?: boolean; data?: Record<string, unknown> }
    const payload =
      envelope?.data && envelope.success ? envelope.data : (data as Record<string, unknown>)
    if (!payload?.user || !payload?.access_token) {
      throw new Error('Invalid response from auth server')
    }
    const menuOptions = parseMenuOptions(payload.menu_options)
    return {
      user: payload.user as MfaCompleteLoginResponse['user'],
      access_token: String(payload.access_token),
      token_type: String(payload.token_type ?? 'Bearer'),
      expires_in: Number(payload.expires_in ?? 0),
      scope: String(payload.scope ?? ''),
      menuOptions,
    }
  },
}
