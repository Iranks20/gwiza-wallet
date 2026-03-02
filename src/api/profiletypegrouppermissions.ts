import { apiClient, ApiError } from './client'

export type ProfileTypeGroupPermissionDto = {
  assignment_id: number
  profile_type_group_id: number
  permission_scope: string
  assignment_is_active: boolean
  date_created?: string
}

export type ProfileTypeGroupPermission = {
  id: number
  profileTypeGroupId: number
  permissionScope: string
  status: string
  dateCreated?: string
}

function dtoToPermission(d: ProfileTypeGroupPermissionDto): ProfileTypeGroupPermission {
  return {
    id: d.assignment_id,
    profileTypeGroupId: d.profile_type_group_id,
    permissionScope: d.permission_scope,
    status: d.assignment_is_active ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function extractListData(res: { data?: unknown }): ProfileTypeGroupPermissionDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as ProfileTypeGroupPermissionDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: ProfileTypeGroupPermissionDto[] }).data))
    return (d as { data: ProfileTypeGroupPermissionDto[] }).data
  if (d && typeof d === 'object' && 'assignment_id' in d) return [d as ProfileTypeGroupPermissionDto]
  return []
}

export const profiletypegrouppermissionsApi = {
  async list(params?: { page?: number; limit?: number; profileTypeGroupId?: number }): Promise<{ items: ProfileTypeGroupPermission[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { profileTypeGroupId, ...rest } = params ?? {}
    let res: Awaited<ReturnType<typeof apiClient.get<ProfileTypeGroupPermissionDto[] | { data: ProfileTypeGroupPermissionDto[] }>>>
    if (profileTypeGroupId != null && profileTypeGroupId > 0) {
      res = await apiClient.get<ProfileTypeGroupPermissionDto[] | { data: ProfileTypeGroupPermissionDto[] }>(
        `/profiletypegrouppermissions/profiletypegroup/${profileTypeGroupId}`,
        { page: rest.page ?? 1, limit: rest.limit ?? 100 }
      )
    } else {
      res = await apiClient.get<ProfileTypeGroupPermissionDto[] | { data: ProfileTypeGroupPermissionDto[] }>('/profiletypegrouppermissions/', {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    }
    const items = extractListData(res).map(dtoToPermission)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<ProfileTypeGroupPermission | null> {
    try {
      const res = await apiClient.get<ProfileTypeGroupPermissionDto>(`/profiletypegrouppermissions/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('assignment_id' in d)) return null
      return dtoToPermission(d as ProfileTypeGroupPermissionDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: { profileTypeGroupId: number; permissionScope: string; status?: string }): Promise<ProfileTypeGroupPermission> {
    const scope = (data.permissionScope ?? '').trim()
    if (scope.length < 1) throw new ApiError('Permission scope is required', 400)
    if (data.profileTypeGroupId < 1) throw new ApiError('Profile type group is required', 400)
    const res = await apiClient.post<ProfileTypeGroupPermissionDto>('/profiletypegrouppermissions/', {
      profile_type_group_id: data.profileTypeGroupId,
      permission_scope: scope,
      assignment_is_active: data.status !== 'inactive',
    })
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToPermission(d)
  },

  async update(id: number, data: Partial<{ permissionScope: string; status: string }>): Promise<ProfileTypeGroupPermission | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.permissionScope !== undefined) body.permission_scope = data.permissionScope.trim()
      if (data.status !== undefined) body.assignment_is_active = data.status === 'active'
      if (Object.keys(body).length === 0) return this.getById(id)
      const res = await apiClient.put<ProfileTypeGroupPermissionDto>(`/profiletypegrouppermissions/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToPermission(d as ProfileTypeGroupPermissionDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/profiletypegrouppermissions/${id}`)
      return true
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return false
      throw e
    }
  },
}
