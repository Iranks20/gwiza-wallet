import { apiClient, ApiError } from './client'

export type UserAccountDto = {
  user_account_id: number
  user_name: string
  email_address: string
  full_name: string
  password?: string | null
  access_level?: number
  auth_type?: 'email' | 'google'
  user_account_status?: 'new' | 'active' | 'inactive' | 'suspended'
  mfa_enabled?: boolean
  mfa_secret_enc?: string | null
  mfa_temp_secret_enc?: string | null
  mfa_backup_hashes?: string | null
  mfa_enrolled_at?: string | null
  date_created?: string
  last_login_at?: string | null
  last_update_at?: string | null
  last_update_to?: string | null
  last_update_by?: string | null
}

export type UserAccount = {
  id: number
  userName: string
  email: string
  fullName: string
  accessLevel: number
  authType: 'email' | 'google'
  status: 'new' | 'active' | 'inactive' | 'suspended'
  mfaEnabled: boolean
  dateCreated: string | null
  lastLoginAt: string | null
}

function dtoToUser(d: UserAccountDto): UserAccount {
  return {
    id: d.user_account_id,
    userName: d.user_name,
    email: d.email_address,
    fullName: d.full_name,
    accessLevel: d.access_level ?? 1,
    authType: (d.auth_type ?? 'email') as 'email' | 'google',
    status: (d.user_account_status ?? 'new') as UserAccount['status'],
    mfaEnabled: d.mfa_enabled ?? false,
    dateCreated: d.date_created ?? null,
    lastLoginAt: d.last_login_at ?? null,
  }
}

function extractList(res: { data?: unknown }): UserAccountDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as UserAccountDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: UserAccountDto[] }).data))
    return (d as { data: UserAccountDto[] }).data
  if (d && typeof d === 'object' && 'user_account_id' in d) return [d as UserAccountDto]
  return []
}

export const useraccountsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: UserAccount[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<UserAccountDto[] | { data: UserAccountDto[] }>('/useraccounts/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractList(res).map(dtoToUser)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<UserAccount | null> {
    try {
      const res = await apiClient.get<UserAccountDto>(`/useraccounts/id/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToUser(d as UserAccountDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async getByEmail(email: string): Promise<UserAccount | null> {
    try {
      const res = await apiClient.get<UserAccountDto>(`/useraccounts/email/${encodeURIComponent(email)}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToUser(d as UserAccountDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async listByStatus(
    status: UserAccount['status'],
    params?: { page?: number; limit?: number }
  ): Promise<{ items: UserAccount[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<UserAccountDto[] | { data: UserAccountDto[] }>(
      `/useraccounts/status/${status}`,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      }
    )
    const items = extractList(res).map(dtoToUser)
    return { items, pagination: res.pagination }
  },

  async update(
    id: number,
    data: Partial<{ accessLevel: number; status: UserAccount['status'] }>
  ): Promise<UserAccount | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.accessLevel !== undefined) body.access_level = data.accessLevel
      if (data.status !== undefined) body.user_account_status = data.status
      const res = await apiClient.put<UserAccountDto>(`/useraccounts/id/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToUser(d as UserAccountDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}

