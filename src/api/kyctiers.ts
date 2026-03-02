import { apiClient, ApiError } from './client'

export type KycTierDto = {
  kyc_tier_id: number
  kyc_tier_name: string
  kyc_tier_description: string
  kyc_tier_is_active: boolean
  date_created?: string
  last_update_at?: string | null
  last_update_to?: string | null
  last_update_by?: string | null
}

export type KycTier = {
  id: number
  name: string
  description: string
  status: string
  dateCreated?: string
}

function dtoToTier(d: KycTierDto): KycTier {
  return {
    id: d.kyc_tier_id,
    name: d.kyc_tier_name,
    description: d.kyc_tier_description,
    status: d.kyc_tier_is_active ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function tierToBody(data: { name: string; description: string; status: string }): Record<string, unknown> {
  const name = (data.name ?? '').trim()
  const description = (data.description ?? '').trim()
  if (name.length < 5 || name.length > 255) throw new ApiError('Tier name must be 5–255 characters', 400)
  if (description.length < 5 || description.length > 255) throw new ApiError('Tier description must be 5–255 characters', 400)
  return {
    kyc_tier_name: name,
    kyc_tier_description: description,
    kyc_tier_is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): KycTierDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as KycTierDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: KycTierDto[] }).data))
    return (d as { data: KycTierDto[] }).data
  if (d && typeof d === 'object' && 'kyc_tier_id' in d) return [d as KycTierDto]
  return []
}

export const kyctiersApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{ items: KycTier[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<KycTierDto[] | { data: KycTierDto[] }>('/kyctiers/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToTier)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<KycTier | null> {
    try {
      const res = await apiClient.get<KycTierDto>(`/kyctiers/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('kyc_tier_id' in d)) return null
      return dtoToTier(d as KycTierDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: { name: string; description: string; status: string }): Promise<KycTier> {
    const res = await apiClient.post<KycTierDto>('/kyctiers/', tierToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create KYC tier did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToTier(d)
  },

  async update(id: number, data: Partial<{ name: string; description: string; status: string }>): Promise<KycTier | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.kyc_tier_name = data.name.trim()
      if (data.description !== undefined) body.kyc_tier_description = data.description.trim()
      if (data.status !== undefined) body.kyc_tier_is_active = data.status === 'active'
      if (Object.keys(body).length === 0) return this.getById(id)
      const res = await apiClient.put<KycTierDto>(`/kyctiers/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToTier(d as KycTierDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
