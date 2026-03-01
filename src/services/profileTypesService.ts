/** Profile Types service – replace with real API when ready */
export interface ProfileType {
  id: number
  country: string
  name: string
  code: string
  description: string
  status: string
}

const mock: ProfileType[] = [
  { id: 1, country: 'Kenya', name: 'Personal', code: 'PERSONAL', description: 'Individual consumer wallet', status: 'active' },
  { id: 2, country: 'Kenya', name: 'Agent', code: 'AGENT', description: 'Cash-in/out agent profile', status: 'active' },
  { id: 3, country: 'Kenya', name: 'Merchant', code: 'MERCHANT', description: 'Billers and merchants', status: 'active' },
  { id: 4, country: 'Nigeria', name: 'Personal', code: 'PERSONAL', description: 'Individual wallet', status: 'active' },
  { id: 5, country: 'Nigeria', name: 'Merchant', code: 'MERCHANT', description: 'Merchant profile', status: 'inactive' },
  { id: 6, country: 'Nigeria', name: 'Agent', code: 'AGENT', description: 'Agent network', status: 'active' },
  { id: 7, country: 'Ghana', name: 'Personal', code: 'PERSONAL', description: 'Retail wallet', status: 'active' },
  { id: 8, country: 'South Africa', name: 'Business', code: 'BUSINESS', description: 'SME and corporate', status: 'active' },
  { id: 9, country: 'United Kingdom', name: 'Personal', code: 'PERSONAL', description: 'Consumer account', status: 'active' },
  { id: 10, country: 'Rwanda', name: 'Agent', code: 'AGENT', description: 'Agent profile', status: 'active' },
]

export async function listProfileTypes(filters?: { country?: string; status?: string }): Promise<ProfileType[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(p => p.country === filters.country)
  if (filters?.status && filters.status !== 'all') out = out.filter(p => p.status === filters.status)
  return out
}

export async function getProfileTypeById(id: number): Promise<ProfileType | null> {
  return mock.find(p => p.id === id) ?? null
}

export async function createProfileType(data: Omit<ProfileType, 'id'>): Promise<ProfileType> {
  const next = { ...data, id: Math.max(0, ...mock.map(p => p.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateProfileType(id: number, data: Partial<ProfileType>): Promise<ProfileType | null> {
  const i = mock.findIndex(p => p.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeProfileType(id: number): Promise<boolean> {
  const i = mock.findIndex(p => p.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
