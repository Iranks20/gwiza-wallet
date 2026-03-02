import { profiletypegrouppermissionsApi } from '@/api/profiletypegrouppermissions'

export type { ProfileTypeGroupPermission } from '@/api/profiletypegrouppermissions'

export async function listGroupPermissions(filters?: { groupId?: number }) {
  const { items } = await profiletypegrouppermissionsApi.list({
    profileTypeGroupId: filters?.groupId,
    limit: 500,
  })
  return items
}

export async function getGroupPermissionById(id: number) {
  return profiletypegrouppermissionsApi.getById(id)
}

export async function createGroupPermission(data: { profileTypeGroupId: number; permissionScope: string; status?: string }) {
  return profiletypegrouppermissionsApi.create(data)
}

export async function updateGroupPermission(id: number, data: Partial<{ permissionScope: string; status: string }>) {
  return profiletypegrouppermissionsApi.update(id, data)
}

export async function removeGroupPermission(id: number) {
  return profiletypegrouppermissionsApi.delete(id)
}
