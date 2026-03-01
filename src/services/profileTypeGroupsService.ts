/** Profile Type Groups service – replace with real API when ready */
export interface ProfileTypeGroup {
  id: number
  name: string
  country: string
  profileType: string
  isDefault: boolean
  status: string
}

const mock: ProfileTypeGroup[] = [
  { id: 1, name: 'Retail - Default', country: 'Kenya', profileType: 'Personal', isDefault: true, status: 'active' },
  { id: 2, name: 'Agents - Tier 1', country: 'Kenya', profileType: 'Agent', isDefault: false, status: 'active' },
  { id: 3, name: 'Merchants - Standard', country: 'Kenya', profileType: 'Merchant', isDefault: false, status: 'active' },
  { id: 4, name: 'Agents - Tier 2', country: 'Nigeria', profileType: 'Agent', isDefault: false, status: 'active' },
  { id: 5, name: 'Retail - Default', country: 'Nigeria', profileType: 'Personal', isDefault: true, status: 'active' },
  { id: 6, name: 'Merchants - High Value', country: 'Rwanda', profileType: 'Merchant', isDefault: false, status: 'inactive' },
  { id: 7, name: 'Retail - Default', country: 'Ghana', profileType: 'Personal', isDefault: true, status: 'active' },
  { id: 8, name: 'Business - SME', country: 'South Africa', profileType: 'Business', isDefault: false, status: 'active' },
  { id: 9, name: 'Ops - Supervisors', country: 'United Kingdom', profileType: 'Personal', isDefault: false, status: 'active' },
]

export async function listProfileTypeGroups(filters?: { country?: string; status?: string; profileType?: string }): Promise<ProfileTypeGroup[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(g => g.country === filters.country)
  if (filters?.status && filters.status !== 'all') out = out.filter(g => g.status === filters.status)
  if (filters?.profileType) out = out.filter(g => g.profileType === filters.profileType)
  return out
}

export async function getProfileTypeGroupById(id: number): Promise<ProfileTypeGroup | null> {
  return mock.find(g => g.id === id) ?? null
}

export async function createProfileTypeGroup(data: Omit<ProfileTypeGroup, 'id'>): Promise<ProfileTypeGroup> {
  const next = { ...data, id: Math.max(0, ...mock.map(g => g.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateProfileTypeGroup(id: number, data: Partial<ProfileTypeGroup>): Promise<ProfileTypeGroup | null> {
  const i = mock.findIndex(g => g.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeProfileTypeGroup(id: number): Promise<boolean> {
  const i = mock.findIndex(g => g.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
