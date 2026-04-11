import { apiClient, ApiError } from './client'

export type UserAccessRightDto = {
  menu_id: number
  menu_label?: string | null
  route_path?: string | null
  menu_scope?: string | null
  parent_key?: string | null
  sort_order?: number | null
  menu_key?: string | null
  is_group?: boolean | null
  css?: string | null
  on_menu?: string | null
}

export type UserAccessRight = {
  menuId: number
  menuLabel: string
  routePath: string | null
  menuScope: string | null
  parentKey: string | null
  sortOrder: number | null
  menuKey: string
  isGroup: boolean
  css: string | null
  onMenu: string
}

function dtoToRight(d: UserAccessRightDto): UserAccessRight {
  return {
    menuId: d.menu_id,
    menuLabel: d.menu_label ?? '',
    routePath: d.route_path ?? null,
    menuScope: d.menu_scope ?? null,
    parentKey: d.parent_key ?? null,
    sortOrder: d.sort_order ?? null,
    menuKey: String(d.menu_key ?? '').trim(),
    isGroup: d.is_group === true,
    css: d.css ?? null,
    onMenu: d.on_menu === 'No' ? 'No' : 'Yes',
  }
}

function extractListData(res: { data?: unknown }): UserAccessRightDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as UserAccessRightDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: UserAccessRightDto[] }).data))
    return (d as { data: UserAccessRightDto[] }).data
  if (d && typeof d === 'object' && 'menu_id' in d) return [d as UserAccessRightDto]
  return []
}

export const useraccessrightsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: UserAccessRight[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<UserAccessRightDto[] | { data: UserAccessRightDto[] }>('/useraccessrights/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res)
      .map(dtoToRight)
      .filter((r) => r.menuKey.length > 0)
    return { items, pagination: res.pagination }
  },

  async getByMenuId(menuId: number): Promise<UserAccessRight | null> {
    try {
      const res = await apiClient.get<UserAccessRightDto>(`/useraccessrights/${menuId}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToRight(d as UserAccessRightDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: {
    menuLabel: string
    routePath: string | null
    menuScope: string | null
    menuKey: string
    onMenu: 'Yes' | 'No'
    parentKey?: string | null
    sortOrder?: number | null
    isGroup?: boolean
    css?: string | null
  }): Promise<UserAccessRight> {
    const menuKey = (data.menuKey ?? '').trim()
    const menuLabel = (data.menuLabel ?? '').trim()
    if (!menuKey) throw new ApiError('menu_key is required', 400)
    if (!menuLabel) throw new ApiError('menu_label is required', 400)
    const body: Record<string, unknown> = {
      menu_label: menuLabel,
      route_path: data.routePath ?? '',
      menu_scope: data.menuScope ?? '',
      menu_key: menuKey,
      on_menu: data.onMenu,
      parent_key: data.parentKey ?? null,
      sort_order: data.sortOrder ?? null,
      is_group: data.isGroup ?? false,
      css: data.css ?? null,
    }
    const res = await apiClient.post<UserAccessRightDto>('/useraccessrights/', body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToRight(d as UserAccessRightDto)
  },

  async update(
    menuId: number,
    data: Partial<{
      menuLabel: string
      routePath: string | null
      menuScope: string | null
      menuKey: string
      onMenu: 'Yes' | 'No'
      parentKey: string | null
      sortOrder: number | null
      isGroup: boolean
      css: string | null
    }>
  ): Promise<UserAccessRight | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.menuLabel !== undefined) body.menu_label = data.menuLabel.trim()
      if (data.routePath !== undefined) body.route_path = data.routePath
      if (data.menuScope !== undefined) body.menu_scope = data.menuScope
      if (data.menuKey !== undefined) body.menu_key = data.menuKey.trim()
      if (data.onMenu !== undefined) body.on_menu = data.onMenu
      if (data.parentKey !== undefined) body.parent_key = data.parentKey
      if (data.sortOrder !== undefined) body.sort_order = data.sortOrder
      if (data.isGroup !== undefined) body.is_group = data.isGroup
      if (data.css !== undefined) body.css = data.css
      const res = await apiClient.put<UserAccessRightDto>(`/useraccessrights/${menuId}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToRight(d as UserAccessRightDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
