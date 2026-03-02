import { apiClient, ApiError } from './client'

export type SystemAccountDto = {
  account_id: number
  account_name: string
  account_description: string
  account_country_id: number
  account_currency: string
  account_wallet_id?: number
  is_active: boolean
  date_created?: string
  last_update_at?: string | null
  last_update_to?: string | null
  last_update_by?: string | null
}

export type SystemAccount = {
  id: number
  name: string
  description: string
  countryId: number
  currency: string
  walletId?: number
  status: string
  dateCreated?: string
}

function dtoToAccount(d: SystemAccountDto): SystemAccount {
  return {
    id: d.account_id,
    name: d.account_name,
    description: d.account_description,
    countryId: d.account_country_id,
    currency: d.account_currency,
    walletId: d.account_wallet_id,
    status: d.is_active ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function accountToBody(data: { name: string; description: string; countryId: number; currency: string; status: string }): Record<string, unknown> {
  const name = (data.name ?? '').trim()
  const description = (data.description ?? '').trim()
  if (name.length > 255) throw new ApiError('Account name must be at most 255 characters', 400)
  if (description.length > 255) throw new ApiError('Account description must be at most 255 characters', 400)
  if (data.countryId < 1) throw new ApiError('Country is required', 400)
  const currency = (data.currency ?? '').trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) throw new ApiError('Currency must be 3 uppercase letters', 400)
  return {
    account_name: name,
    account_description: description,
    account_country_id: data.countryId,
    account_currency: currency,
    is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): SystemAccountDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as SystemAccountDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: SystemAccountDto[] }).data))
    return (d as { data: SystemAccountDto[] }).data
  if (d && typeof d === 'object' && 'account_id' in d) return [d as SystemAccountDto]
  return []
}

export const systemaccountsApi = {
  async list(params?: { page?: number; limit?: number; countryId?: number }): Promise<{ items: SystemAccount[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { countryId, ...rest } = params ?? {}
    let res: Awaited<ReturnType<typeof apiClient.get<SystemAccountDto[] | { data: SystemAccountDto[] }>>>
    if (countryId != null && countryId > 0) {
      res = await apiClient.get<SystemAccountDto[] | { data: SystemAccountDto[] }>(`/systemaccounts/country/${countryId}`, {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    } else {
      res = await apiClient.get<SystemAccountDto[] | { data: SystemAccountDto[] }>('/systemaccounts/', {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    }
    const items = extractListData(res).map(dtoToAccount)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<SystemAccount | null> {
    try {
      const res = await apiClient.get<SystemAccountDto>(`/systemaccounts/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('account_id' in d)) return null
      return dtoToAccount(d as SystemAccountDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Parameters<typeof accountToBody>[0]): Promise<SystemAccount> {
    const res = await apiClient.post<SystemAccountDto>('/systemaccounts/', accountToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create system account did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToAccount(d)
  },

  async update(id: number, data: Partial<Parameters<typeof accountToBody>[0]>): Promise<SystemAccount | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged = {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        countryId: data.countryId ?? existing.countryId,
        currency: data.currency ?? existing.currency,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<SystemAccountDto>(`/systemaccounts/${id}`, accountToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToAccount(d as SystemAccountDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
