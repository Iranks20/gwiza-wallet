import { apiClient, ApiError } from './client'

export type UserAccessLevelDto = {
  access_level_id: number
  access_level_name: string
  access_level_desc?: string | null
  access_level_allowed_permissions?: string | null
  access_level_status?: string
  access_level_creator_id?: number | null
}

export type UserAccessLevel = {
  id: number
  name: string
  description: string
  allowedPermissions: string
  status: string
  accessLevelCreatorId?: number | null
}

function dtoToLevel(d: UserAccessLevelDto): UserAccessLevel {
  return {
    id: d.access_level_id,
    name: d.access_level_name,
    description: d.access_level_desc ?? '',
    allowedPermissions: d.access_level_allowed_permissions ?? '',
    status: d.access_level_status ?? 'active',
    accessLevelCreatorId: d.access_level_creator_id ?? null,
  }
}

function extractListData(res: { data?: unknown }): UserAccessLevelDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as UserAccessLevelDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: UserAccessLevelDto[] }).data))
    return (d as { data: UserAccessLevelDto[] }).data
  if (d && typeof d === 'object' && 'access_level_id' in d) return [d as UserAccessLevelDto]
  return []
}

export const useraccesslevelsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: UserAccessLevel[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<UserAccessLevelDto[] | { data: UserAccessLevelDto[] }>('/useraccesslevels/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToLevel)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<UserAccessLevel | null> {
    try {
      const res = await apiClient.get<UserAccessLevelDto>(`/useraccesslevels/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToLevel(d as UserAccessLevelDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: {
    name: string
    description?: string
    allowedPermissions?: string
    status?: string
    accessLevelCreatorId?: number | null
  }): Promise<UserAccessLevel> {
    const name = (data.name ?? '').trim()
    if (!name) throw new ApiError('Access level name is required', 400)
    const body: Record<string, unknown> = {
      access_level_name: name,
      access_level_desc: data.description?.trim() || null,
      access_level_allowed_permissions: data.allowedPermissions?.trim() || null,
      access_level_status: data.status ?? 'active',
    }
    if (data.accessLevelCreatorId !== undefined && data.accessLevelCreatorId !== null && data.accessLevelCreatorId > 0) {
      body.access_level_creator_id = data.accessLevelCreatorId
    } else {
      body.access_level_creator_id = 0
    }
    const res = await apiClient.post<UserAccessLevelDto>('/useraccesslevels/', body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToLevel(d as UserAccessLevelDto)
  },

  async update(
    id: number,
    data: Partial<{ name: string; description: string; allowedPermissions: string; status: string; accessLevelCreatorId?: number | null }>
  ): Promise<UserAccessLevel | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.access_level_name = data.name.trim()
      if (data.description !== undefined) body.access_level_desc = data.description.trim() || null
      if (data.allowedPermissions !== undefined) body.access_level_allowed_permissions = data.allowedPermissions.trim() || null
      if (data.status !== undefined) body.access_level_status = data.status
      if (data.accessLevelCreatorId !== undefined) {
        body.access_level_creator_id = data.accessLevelCreatorId ?? 0
      }
      const res = await apiClient.put<UserAccessLevelDto>(`/useraccesslevels/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToLevel(d as UserAccessLevelDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
