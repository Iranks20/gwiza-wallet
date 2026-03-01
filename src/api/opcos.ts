/**
 * Countries (OPCOs) API – /opcos/
 * List, get, create, update. No DELETE in API.
 */

import { apiClient, ApiError } from './client'

/** Domain shape used by the app (no circular dep on services). */
export type Country = {
  id: number
  name: string
  alpha2: string
  alpha3: string
  numeric: string
  currency: string
  status: string
  dial: string
  flag?: string
}

export type OpcoDto = {
  country_id: number
  country_name: string
  alpha2_code: string
  alpha3_code: string
  calling_code: string
  flag: string | null
  currency: string
  country_is_active: boolean
}

function dtoToCountry(d: OpcoDto): Country {
  return {
    id: d.country_id,
    name: d.country_name,
    alpha2: d.alpha2_code,
    alpha3: d.alpha3_code,
    numeric: '', // API does not expose numeric; keep for UI compatibility
    currency: d.currency,
    status: d.country_is_active ? 'active' : 'inactive',
    dial: d.calling_code,
    flag: d.flag ?? undefined,
  }
}

function isUriLike(s: string): boolean {
  const t = s.trim()
  return t.length > 0 && (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:'))
}

/** Build create body with only keys allowed by API (additionalProperties: false). Omit flag when empty to avoid backend 174. */
function countryToCreateDto(data: Omit<Country, 'id'>): Record<string, unknown> {
  const alpha2 = String(data.alpha2 ?? '').trim().toUpperCase().slice(0, 2)
  const alpha3 = String(data.alpha3 ?? '').trim().toUpperCase().slice(0, 3)
  const currency = String(data.currency ?? '').trim().toUpperCase().slice(0, 4)
  const flagUrl = data.flag && isUriLike(data.flag) ? data.flag.trim() : null
  const body: Record<string, unknown> = {
    country_name: data.name,
    alpha2_code: alpha2,
    calling_code: data.dial,
    alpha3_code: alpha3,
    currency,
    country_is_active: data.status === 'active',
  }
  if (flagUrl) body.flag = flagUrl
  return body
}

function countryToUpdateDto(data: Partial<Country>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (data.name !== undefined) out.country_name = data.name
  if (data.alpha2 !== undefined) out.alpha2_code = String(data.alpha2).trim().toUpperCase().slice(0, 2)
  if (data.alpha3 !== undefined) out.alpha3_code = String(data.alpha3).trim().toUpperCase().slice(0, 3)
  if (data.dial !== undefined) out.calling_code = data.dial
  if (data.flag !== undefined && data.flag && isUriLike(data.flag)) out.flag = data.flag.trim()
  if (data.currency !== undefined) out.currency = String(data.currency).trim().toUpperCase().slice(0, 4)
  if (data.status !== undefined) out.country_is_active = data.status === 'active'
  return out
}

function extractListData(res: { data?: unknown }): OpcoDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as OpcoDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: OpcoDto[] }).data))
    return (d as { data: OpcoDto[] }).data
  if (d && typeof d === 'object' && 'country_id' in d) return [d as OpcoDto]
  return []
}

export const opcosApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{ items: Country[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<OpcoDto[] | { data: OpcoDto[] }>('/opcos/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToCountry)
    return { items, pagination: res.pagination }
  },

  async getById(countryId: number): Promise<Country | null> {
    try {
      const res = await apiClient.get<OpcoDto>(`/opcos/${countryId}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('country_id' in d)) return null
      return dtoToCountry(d as OpcoDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Omit<Country, 'id'>): Promise<Country> {
    const res = await apiClient.post<OpcoDto>('/opcos/', countryToCreateDto(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create country did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToCountry(d)
  },

  async update(countryId: number, data: Partial<Country>): Promise<Country | null> {
    try {
      const res = await apiClient.put<OpcoDto>(`/opcos/${countryId}`, countryToUpdateDto(data))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToCountry(d)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
