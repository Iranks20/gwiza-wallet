import { apiClient, ApiError } from './client'

const PROFILE_TYPE_ENUM = ['personal', 'corporate', 'agent', 'merchant', 'system'] as const
const PROFILE_AUTH_ENUM = ['pin', 'password', 'pin_and_pass'] as const
const LOGIN_RESET_ENUM = ['daily', 'weekly', 'monthly', 'annually', 'never'] as const
const LIMIT_MESSAGE_ENUM = ['none', 'exceeded'] as const

export type ProfileTypeDto = {
  profile_type_id: number
  profile_type_name: string
  profile_type: string
  profile_auth_type: string
  login_counter_max_allowed_no: number
  login_counter_reset_freq: string
  limit_message: string
  profile_type_is_active: boolean
  date_created?: string
  last_update_at?: string | null
  last_update_to?: string | null
  last_update_by?: string | null
}

export type ProfileType = {
  id: number
  name: string
  code: string
  profileAuthType: string
  loginCounterMaxAllowedNo: number
  loginCounterResetFreq: string
  limitMessage: string
  status: string
  dateCreated?: string
}

export { PROFILE_TYPE_ENUM, PROFILE_AUTH_ENUM, LOGIN_RESET_ENUM, LIMIT_MESSAGE_ENUM }

function dtoToProfileType(d: ProfileTypeDto): ProfileType {
  return {
    id: d.profile_type_id,
    name: d.profile_type_name,
    code: d.profile_type,
    profileAuthType: d.profile_auth_type,
    loginCounterMaxAllowedNo: d.login_counter_max_allowed_no,
    loginCounterResetFreq: d.login_counter_reset_freq,
    limitMessage: d.limit_message,
    status: d.profile_type_is_active ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function profileTypeToBody(data: {
  name: string
  code: string
  profileAuthType: string
  loginCounterMaxAllowedNo: number
  loginCounterResetFreq: string
  limitMessage: string
  status: string
}): Record<string, unknown> {
  const name = (data.name ?? '').trim()
  if (name.length < 5 || name.length > 255) throw new ApiError('Profile type name must be 5–255 characters', 400)
  if (!PROFILE_TYPE_ENUM.includes(data.code as (typeof PROFILE_TYPE_ENUM)[number])) throw new ApiError('Invalid profile type', 400)
  if (!PROFILE_AUTH_ENUM.includes(data.profileAuthType as (typeof PROFILE_AUTH_ENUM)[number])) throw new ApiError('Invalid profile auth type', 400)
  if (!LOGIN_RESET_ENUM.includes(data.loginCounterResetFreq as (typeof LOGIN_RESET_ENUM)[number])) throw new ApiError('Invalid login counter reset freq', 400)
  if (!LIMIT_MESSAGE_ENUM.includes(data.limitMessage as (typeof LIMIT_MESSAGE_ENUM)[number])) throw new ApiError('Invalid limit message', 400)
  const n = Number(data.loginCounterMaxAllowedNo)
  if (!Number.isInteger(n) || n < 0) throw new ApiError('Login counter max must be a non-negative integer', 400)
  return {
    profile_type_name: name,
    profile_type: data.code,
    profile_auth_type: data.profileAuthType,
    login_counter_max_allowed_no: n,
    login_counter_reset_freq: data.loginCounterResetFreq,
    limit_message: data.limitMessage,
    profile_type_is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): ProfileTypeDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as ProfileTypeDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: ProfileTypeDto[] }).data))
    return (d as { data: ProfileTypeDto[] }).data
  if (d && typeof d === 'object' && 'profile_type_id' in d) return [d as ProfileTypeDto]
  return []
}

export const profiletypesApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{ items: ProfileType[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<ProfileTypeDto[] | { data: ProfileTypeDto[] }>('/profiletypes/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToProfileType)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<ProfileType | null> {
    try {
      const res = await apiClient.get<ProfileTypeDto>(`/profiletypes/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('profile_type_id' in d)) return null
      return dtoToProfileType(d as ProfileTypeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Parameters<typeof profileTypeToBody>[0]): Promise<ProfileType> {
    const res = await apiClient.post<ProfileTypeDto>('/profiletypes/', profileTypeToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create profile type did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToProfileType(d)
  },

  async update(id: number, data: Partial<Parameters<typeof profileTypeToBody>[0]>): Promise<ProfileType | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged = {
        name: data.name ?? existing.name,
        code: data.code ?? existing.code,
        profileAuthType: data.profileAuthType ?? existing.profileAuthType,
        loginCounterMaxAllowedNo: data.loginCounterMaxAllowedNo ?? existing.loginCounterMaxAllowedNo,
        loginCounterResetFreq: data.loginCounterResetFreq ?? existing.loginCounterResetFreq,
        limitMessage: data.limitMessage ?? existing.limitMessage,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<ProfileTypeDto>(`/profiletypes/${id}`, profileTypeToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToProfileType(d as ProfileTypeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
