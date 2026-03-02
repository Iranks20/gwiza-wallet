import { profiletypegroupsApi } from '@/api/profiletypegroups'

export type { ProfileTypeGroup } from '@/api/profiletypegroups'

export async function listProfileTypeGroups(filters?: { countryId?: number; status?: string }) {
  const { items } = await profiletypegroupsApi.list({
    countryId: filters?.countryId,
    limit: 500,
  })
  if (filters?.status && filters.status !== 'all') return items.filter(g => g.status === filters.status)
  return items
}

export async function getProfileTypeGroupById(id: number) {
  return profiletypegroupsApi.getById(id)
}

export async function createProfileTypeGroup(data: {
  profileTypeId: number
  name: string
  kycTierId: number
  countryId: number
  currency: string
  isDefault: boolean
  status: string
}) {
  return profiletypegroupsApi.create(data)
}

export async function updateProfileTypeGroup(id: number, data: Partial<Parameters<typeof profiletypegroupsApi.update>[1]>) {
  return profiletypegroupsApi.update(id, data)
}
