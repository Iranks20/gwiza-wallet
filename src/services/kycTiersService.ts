/** KYC Tiers service – replace with real API when ready */
export interface KycTier {
  id: number
  country: string
  name: string
  level: number
  description: string
  status: string
}

const mock: KycTier[] = [
  { id: 1, country: 'Kenya', name: 'Basic', level: 1, description: 'Minimal KYC for low limits', status: 'active' },
  { id: 2, country: 'Kenya', name: 'Silver', level: 2, description: 'ID verification required', status: 'active' },
  { id: 3, country: 'Kenya', name: 'Gold', level: 3, description: 'Full KYC with address verification', status: 'active' },
  { id: 4, country: 'Nigeria', name: 'Basic', level: 1, description: 'Entry KYC tier', status: 'active' },
  { id: 5, country: 'Nigeria', name: 'Silver', level: 2, description: 'Enhanced KYC with ID verification', status: 'inactive' },
  { id: 6, country: 'Nigeria', name: 'Gold', level: 3, description: 'Full verification for high limits', status: 'active' },
  { id: 7, country: 'Ghana', name: 'Basic', level: 1, description: 'Starter tier', status: 'active' },
  { id: 8, country: 'South Africa', name: 'Basic', level: 1, description: 'Low-value wallet tier', status: 'active' },
  { id: 9, country: 'South Africa', name: 'Premium', level: 3, description: 'Full KYC for business', status: 'active' },
  { id: 10, country: 'United Kingdom', name: 'Tier 1', level: 1, description: 'Simplified due diligence', status: 'active' },
  { id: 11, country: 'Rwanda', name: 'Basic', level: 1, description: 'Mobile money tier', status: 'active' },
]

export async function listKycTiers(filters?: { country?: string; status?: string }): Promise<KycTier[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(t => t.country === filters.country)
  if (filters?.status && filters.status !== 'all') out = out.filter(t => t.status === filters.status)
  return out
}

export async function getKycTierById(id: number): Promise<KycTier | null> {
  return mock.find(t => t.id === id) ?? null
}

export async function createKycTier(data: Omit<KycTier, 'id'>): Promise<KycTier> {
  const next = { ...data, id: Math.max(0, ...mock.map(t => t.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateKycTier(id: number, data: Partial<KycTier>): Promise<KycTier | null> {
  const i = mock.findIndex(t => t.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeKycTier(id: number): Promise<boolean> {
  const i = mock.findIndex(t => t.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
