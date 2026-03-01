/**
 * Profile Permissions API – /profilepermissions/
 */

import { apiClient, ApiError } from './client'

export type ProfilePermissionDto = {
  permission_id: number
  permission_name: string
  permission_scope: string
  permission_tag: string
  permission_is_active: boolean
}

/** App-facing type (code = permission_name in API). */
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
    const res = await apiClient.post<ProfilePermissionDto>('/profilepermissions/', {
      permission_name: data.code,
      permission_scope: data.scope,
      permission_tag: data.tag,
      permission_is_active: data.status === 'active',
    })
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToPermission(d as ProfilePermissionDto)
  },

  async update(id: number, data: Partial<{ code: string; scope: string; tag: string; description: string; status: string }>): Promise<ProfilePermission | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.code !== undefined) body.permission_name = data.code
      if (data.scope !== undefined) body.permission_scope = data.scope
      if (data.tag !== undefined) body.permission_tag = data.tag
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
