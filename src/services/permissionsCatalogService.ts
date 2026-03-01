import { profilepermissionsApi } from '@/api/profilepermissions'
import type { ProfilePermission } from '@/api/profilepermissions'

export type PermissionCatalogItem = ProfilePermission

export async function listPermissionsCatalog(filters?: { scope?: string; tag?: string; status?: string }): Promise<PermissionCatalogItem[]> {
  const { items } = await profilepermissionsApi.list({ limit: 500 })
  let out = items
  if (filters?.scope && filters.scope !== 'all') out = out.filter((p) => p.scope === filters.scope)
  if (filters?.tag && filters.tag !== 'all') out = out.filter((p) => p.tag === filters.tag)
  if (filters?.status && filters.status !== 'all') out = out.filter((p) => p.status === filters.status)
  return out
}

export async function getPermissionCatalogById(id: number): Promise<PermissionCatalogItem | null> {
  return profilepermissionsApi.getById(id)
}

export async function createPermissionCatalog(data: Omit<PermissionCatalogItem, 'id'>): Promise<PermissionCatalogItem> {
  return profilepermissionsApi.create({
    code: data.code,
    scope: data.scope,
    tag: data.tag,
    description: data.description,
    status: data.status,
  })
}

export async function updatePermissionCatalog(id: number, data: Partial<PermissionCatalogItem>): Promise<PermissionCatalogItem | null> {
  return profilepermissionsApi.update(id, data)
}

export async function removePermissionCatalog(id: number): Promise<boolean> {
  return profilepermissionsApi.delete(id)
}
