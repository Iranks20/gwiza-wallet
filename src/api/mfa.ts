import { apiClient } from './client'

export type MfaEnrollStartResponse = {
  qr_data_url?: string
  manual_key?: string
}

export type MfaStatusResponse = {
  mfa_enabled?: boolean
  user_account_id?: string
}

function toUserId(id: string | number): number {
  const n = typeof id === 'number' ? id : parseInt(String(id), 10)
  return Number.isNaN(n) ? 0 : n
}

export const mfaApi = {
  /** Start 2FA enrollment, get QR code */
  async enrollStart(userAccountId: string | number): Promise<MfaEnrollStartResponse> {
    const id = toUserId(userAccountId)
    const res = await apiClient.post<MfaEnrollStartResponse>('/useraccounts/mfa-enroll/start', {
      user_account_id: id,
    })
    return (res.data ?? {}) as MfaEnrollStartResponse
  },

  /** Finish enrollment with TOTP code. Requires token (manual_key) and user_account_id. */
  async enrollVerify(
    userAccountId: string | number,
    token: string,
    code: string
  ): Promise<{ success?: boolean; backup_codes?: string[] }> {
    const id = toUserId(userAccountId)
    const res = await apiClient.post<{ success?: boolean; backup_codes?: string[] | string }>(
      '/useraccounts/mfa-enroll/verify',
      { user_account_id: id, token, code }
    )
    const data = (res.data ?? {}) as { success?: boolean; backup_codes?: string[] | string }
    const backupCodes = data.backup_codes
      ? Array.isArray(data.backup_codes)
        ? data.backup_codes
        : String(data.backup_codes).split(',').map((s) => s.trim()).filter(Boolean)
      : []
    return { ...data, backup_codes: backupCodes }
  },

  /** Turn off 2FA */
  async disable(code: string): Promise<{ success?: boolean }> {
    const res = await apiClient.post<{ success?: boolean }>('/useraccounts/mfa/disable', {
      code,
    })
    return (res.data ?? {}) as { success?: boolean }
  },

  /** Verify a 2FA code (e.g. in-app) */
  async verify(code: string): Promise<{ success?: boolean }> {
    const res = await apiClient.post<{ success?: boolean }>('/useraccounts/mfa/verify', {
      code,
    })
    return (res.data ?? {}) as { success?: boolean }
  },

  /** Check if 2FA is enabled */
  async status(userAccountId: string | number): Promise<MfaStatusResponse> {
    const id = toUserId(userAccountId)
    const res = await apiClient.get<MfaStatusResponse>(`/useraccounts/mfa/status/${id}`)
    return (res.data ?? {}) as MfaStatusResponse
  },
}
