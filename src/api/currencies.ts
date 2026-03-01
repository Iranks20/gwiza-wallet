/**
 * Currencies API – /currencies/
 */

import { apiClient, ApiError } from './client'

export type CurrencyDto = {
  currency_code: string
  name: string
}

/** App-facing currency (API only has code + name; UI may show defaults for symbol, decimals, country, status). */
export type Currency = {
  code: string
  name: string
  symbol: string
  decimals: number
  country: string
  status: string
}

function dtoToCurrency(d: CurrencyDto): Currency {
  return {
    code: d.currency_code,
    name: d.name,
    symbol: d.currency_code,
    decimals: 2,
    country: '',
    status: 'active',
  }
}

function extractListData(res: { data?: unknown }): CurrencyDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as CurrencyDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: CurrencyDto[] }).data))
    return (d as { data: CurrencyDto[] }).data
  if (d && typeof d === 'object' && 'currency_code' in d) return [d as CurrencyDto]
  return []
}

export const currenciesApi = {
  async list(): Promise<{ items: Currency[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    // No query params: backend validates querystring/limit as integer and rejects string values.
    // Rely on server defaults for pagination.
    const res = await apiClient.get<CurrencyDto[] | { data: CurrencyDto[] }>('/currencies/')
    const items = extractListData(res).map(dtoToCurrency)
    return { items, pagination: res.pagination }
  },

  async getByCode(currencyCode: string): Promise<Currency | null> {
    try {
      const res = await apiClient.get<CurrencyDto>(`/currencies/${encodeURIComponent(currencyCode)}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToCurrency(d as CurrencyDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: { code: string; name: string }): Promise<Currency> {
    const res = await apiClient.post<CurrencyDto>('/currencies/', {
      currency_code: data.code,
      name: data.name,
    })
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create currency did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToCurrency(d as CurrencyDto)
  },

  async update(currencyCode: string, data: { name?: string }): Promise<Currency | null> {
    try {
      const res = await apiClient.put<CurrencyDto>(`/currencies/${encodeURIComponent(currencyCode)}`, {
        name: data.name,
      })
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToCurrency(d as CurrencyDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async delete(currencyCode: string): Promise<boolean> {
    try {
      await apiClient.delete(`/currencies/${encodeURIComponent(currencyCode)}`)
      return true
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return false
      throw e
    }
  },
}
