import { apiClient, ApiError } from './client'

export type ProfilePermissionDto = {
  permission_id: number
  permission_name: string
  permission_scope: string
  permission_tag: string
  permission_is_active: boolean
}

export type ProfilePermission = {
  id: number
  code: string
  scope: string
  tag: string
  description: string
  status: string
}

function dtoToPermission(d: ProfilePermissionDto): ProfilePermission {
  return {
    id: d.permission_id,
    code: d.permission_name,
    scope: d.permission_scope,
    tag: d.permission_tag,
    description: d.permission_name,
    status: d.permission_is_active ? 'active' : 'inactive',
  }
}

function extractListData(res: { data?: unknown }): ProfilePermissionDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as ProfilePermissionDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: ProfilePermissionDto[] }).data))
    return (d as { data: ProfilePermissionDto[] }).data
  if (d && typeof d === 'object' && 'permission_id' in d) return [d as ProfilePermissionDto]
  return []
}

export const profilepermissionsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{ items: ProfilePermission[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<ProfilePermissionDto[] | { data: ProfilePermissionDto[] }>('/profilepermissions/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToPermission)
    return { items, pagination: res.pagination }
  },

  /** Get profile permissions by scope (GET /profilepermissions/scope/{permission_scope}) */
  async listByScope(scope: string): Promise<ProfilePermission[]> {
    const res = await apiClient.get<ProfilePermissionDto[] | { data: ProfilePermissionDto[] }>(
      `/profilepermissions/scope/${encodeURIComponent(scope)}`
    )
    return extractListData(res).map(dtoToPermission)
  },

  /** Get profile permissions by tag (GET /profilepermissions/tag/{permission_tag}) */
  async listByTag(tag: string): Promise<ProfilePermission[]> {
    const res = await apiClient.get<ProfilePermissionDto[] | { data: ProfilePermissionDto[] }>(
      `/profilepermissions/tag/${encodeURIComponent(tag)}`
    )
    return extractListData(res).map(dtoToPermission)
  },

  async getById(id: number): Promise<ProfilePermission | null> {
    try {
      const res = await apiClient.get<ProfilePermissionDto>(`/profilepermissions/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToPermission(d as ProfilePermissionDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: { code: string; scope: string; tag: string; description?: string; status: string }): Promise<ProfilePermission> {
    const name = (data.code ?? '').trim()
    const scope = (data.scope ?? '').trim()
    const tag = (data.tag ?? '').trim()
    if (name.length < 5 || scope.length < 5 || tag.length < 5) {
      throw new ApiError('Code, Scope and Tag must be at least 5 characters', 400)
    }
    const res = await apiClient.post<ProfilePermissionDto>('/profilepermissions/', {
      permission_name: name,
      permission_scope: scope,
      permission_tag: tag,
      permission_is_active: data.status === 'active',
    })
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToPermission(d as ProfilePermissionDto)
  },

  async update(id: number, data: Partial<{ code: string; scope: string; tag: string; description: string; status: string }>): Promise<ProfilePermission | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.code !== undefined) {
        const name = data.code.trim()
        if (name.length >= 5) body.permission_name = name
      }
      if (data.scope !== undefined) {
        const scope = data.scope.trim()
        if (scope.length >= 5) body.permission_scope = scope
      }
      if (data.tag !== undefined) {
        const tag = data.tag.trim()
        if (tag.length >= 5) body.permission_tag = tag
      }
      if (data.status !== undefined) body.permission_is_active = data.status === 'active'
      const res = await apiClient.put<ProfilePermissionDto>(`/profilepermissions/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToPermission(d as ProfilePermissionDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/profilepermissions/${id}`)
      return true
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return false
      throw e
    }
  },
}
