import { profiletypesApi } from '@/api/profiletypes'

export type { ProfileType } from '@/api/profiletypes'
export { PROFILE_TYPE_ENUM, PROFILE_AUTH_ENUM, LOGIN_RESET_ENUM, LIMIT_MESSAGE_ENUM } from '@/api/profiletypes'

export async function listProfileTypes(filters?: { status?: string }) {
  const { items } = await profiletypesApi.list({ limit: 500 })
  if (filters?.status && filters.status !== 'all') return items.filter(p => p.status === filters.status)
  return items
}

export async function getProfileTypeById(id: number) {
  return profiletypesApi.getById(id)
}

export async function createProfileType(data: {
  name: string
  code: string
  profileAuthType: string
  loginCounterMaxAllowedNo: number
  loginCounterResetFreq: string
  limitMessage: string
  status: string
}) {
  return profiletypesApi.create(data)
}

export async function updateProfileType(id: number, data: Partial<Parameters<typeof profiletypesApi.update>[1]>) {
  return profiletypesApi.update(id, data)
}
