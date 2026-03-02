import { apiClient, ApiError } from './client'

export type ProfileTypeGroupDto = {
  profile_type_group_id: number
  profile_type_id: number
  profile_type_group_name: string
  kyc_tier_id: number
  profile_type_group_country: number
  profile_type_group_currency: string
  is_default: boolean
  profile_type_group_is_active: boolean
  date_created?: string
  last_update_at?: string | null
  last_update_to?: string | null
  last_update_by?: string | null
}

export type ProfileTypeGroup = {
  id: number
  profileTypeId: number
  name: string
  kycTierId: number
  countryId: number
  currency: string
  isDefault: boolean
  status: string
  dateCreated?: string
}

function dtoToGroup(d: ProfileTypeGroupDto): ProfileTypeGroup {
  return {
    id: d.profile_type_group_id,
    profileTypeId: d.profile_type_id,
    name: d.profile_type_group_name,
    kycTierId: d.kyc_tier_id,
    countryId: d.profile_type_group_country,
    currency: d.profile_type_group_currency,
    isDefault: d.is_default,
    status: d.profile_type_group_is_active ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function groupToBody(data: {
  profileTypeId: number
  name: string
  kycTierId: number
  countryId: number
  currency: string
  isDefault: boolean
  status: string
}): Record<string, unknown> {
  const name = (data.name ?? '').trim()
  if (name.length < 1 || name.length > 255) throw new ApiError('Group name must be 1–255 characters', 400)
  if (data.profileTypeId < 1) throw new ApiError('Profile type is required', 400)
  if (data.kycTierId < 1) throw new ApiError('KYC tier is required', 400)
  if (data.countryId < 1) throw new ApiError('Country is required', 400)
  const currency = (data.currency ?? '').trim().toUpperCase().slice(0, 4)
  if (currency.length < 3) throw new ApiError('Currency must be 3–4 characters', 400)
  return {
    profile_type_id: data.profileTypeId,
    profile_type_group_name: name,
    kyc_tier_id: data.kycTierId,
    profile_type_group_country: data.countryId,
    profile_type_group_currency: currency,
    is_default: data.isDefault,
    profile_type_group_is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): ProfileTypeGroupDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as ProfileTypeGroupDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: ProfileTypeGroupDto[] }).data))
    return (d as { data: ProfileTypeGroupDto[] }).data
  if (d && typeof d === 'object' && 'profile_type_group_id' in d) return [d as ProfileTypeGroupDto]
  return []
}

export const profiletypegroupsApi = {
  async list(params?: { page?: number; limit?: number; countryId?: number }): Promise<{ items: ProfileTypeGroup[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { countryId, ...rest } = params ?? {}
    let res: Awaited<ReturnType<typeof apiClient.get<ProfileTypeGroupDto[] | { data: ProfileTypeGroupDto[] }>>>
    if (countryId != null && countryId > 0) {
      res = await apiClient.get<ProfileTypeGroupDto[] | { data: ProfileTypeGroupDto[] }>(
        `/profiletypegroups/country/${countryId}`,
        { page: rest.page ?? 1, limit: rest.limit ?? 100 }
      )
    } else {
      res = await apiClient.get<ProfileTypeGroupDto[] | { data: ProfileTypeGroupDto[] }>('/profiletypegroups/', {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    }
    const items = extractListData(res).map(dtoToGroup)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<ProfileTypeGroup | null> {
    try {
      const res = await apiClient.get<ProfileTypeGroupDto>(`/profiletypegroups/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('profile_type_group_id' in d)) return null
      return dtoToGroup(d as ProfileTypeGroupDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Parameters<typeof groupToBody>[0]): Promise<ProfileTypeGroup> {
    const res = await apiClient.post<ProfileTypeGroupDto>('/profiletypegroups/', groupToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create profile type group did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToGroup(d)
  },

  async update(id: number, data: Partial<Parameters<typeof groupToBody>[0]>): Promise<ProfileTypeGroup | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged = {
        profileTypeId: data.profileTypeId ?? existing.profileTypeId,
        name: data.name ?? existing.name,
        kycTierId: data.kycTierId ?? existing.kycTierId,
        countryId: data.countryId ?? existing.countryId,
        currency: data.currency ?? existing.currency,
        isDefault: data.isDefault ?? existing.isDefault,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<ProfileTypeGroupDto>(`/profiletypegroups/${id}`, groupToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToGroup(d as ProfileTypeGroupDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
