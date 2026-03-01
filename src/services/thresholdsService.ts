/** Thresholds service – replace with real API when ready */
export interface Threshold {
  id: number
  groupName: string
  kycTier: string
  country: string
  currency: string
  minAmount: string
  maxAmount: string
  status: string
}

const mock: Threshold[] = [
  { id: 1, groupName: 'Retail - Default', kycTier: 'Basic', country: 'Kenya', currency: 'KES', minAmount: '0', maxAmount: '50000', status: 'active' },
  { id: 2, groupName: 'Retail - Default', kycTier: 'Silver', country: 'Kenya', currency: 'KES', minAmount: '50001', maxAmount: '500000', status: 'active' },
  { id: 3, groupName: 'Retail - Default', kycTier: 'Gold', country: 'Kenya', currency: 'KES', minAmount: '0', maxAmount: '2000000', status: 'active' },
  { id: 4, groupName: 'Agents - Tier 1', kycTier: 'Basic', country: 'Kenya', currency: 'KES', minAmount: '0', maxAmount: '1000000', status: 'active' },
  { id: 5, groupName: 'Agents - Tier 2', kycTier: 'Silver', country: 'Nigeria', currency: 'NGN', minAmount: '1000', maxAmount: '10000000', status: 'active' },
  { id: 6, groupName: 'Retail - Default', kycTier: 'Gold', country: 'Nigeria', currency: 'NGN', minAmount: '0', maxAmount: '5000000', status: 'active' },
  { id: 7, groupName: 'Merchants - Standard', kycTier: 'Gold', country: 'Kenya', currency: 'KES', minAmount: '0', maxAmount: '10000000', status: 'active' },
  { id: 8, groupName: 'Retail - Default', kycTier: 'Basic', country: 'Ghana', currency: 'GHS', minAmount: '0', maxAmount: '100000', status: 'active' },
  { id: 9, groupName: 'Business - SME', kycTier: 'Premium', country: 'South Africa', currency: 'ZAR', minAmount: '0', maxAmount: '5000000', status: 'active' },
  // United Kingdom – Ops - Supervisors (group 9)
  { id: 10, groupName: 'Ops - Supervisors', kycTier: 'Tier 1', country: 'United Kingdom', currency: 'GBP', minAmount: '0', maxAmount: '5000', status: 'active' },
  { id: 11, groupName: 'Ops - Supervisors', kycTier: 'Tier 1', country: 'United Kingdom', currency: 'GBP', minAmount: '5001', maxAmount: '50000', status: 'active' },
  { id: 12, groupName: 'Ops - Supervisors', kycTier: 'Tier 1', country: 'United Kingdom', currency: 'GBP', minAmount: '50001', maxAmount: '250000', status: 'active' },
  { id: 13, groupName: 'Ops - Supervisors', kycTier: 'Tier 1', country: 'United Kingdom', currency: 'EUR', minAmount: '0', maxAmount: '10000', status: 'active' },
  // Rwanda – Merchants - High Value (group 6)
  { id: 14, groupName: 'Merchants - High Value', kycTier: 'Basic', country: 'Rwanda', currency: 'RWF', minAmount: '0', maxAmount: '5000000', status: 'inactive' },
  { id: 15, groupName: 'Merchants - High Value', kycTier: 'Basic', country: 'Rwanda', currency: 'RWF', minAmount: '5000001', maxAmount: '50000000', status: 'inactive' },
]

export async function listThresholds(filters?: { group?: string; kycTier?: string; country?: string; currency?: string; status?: string }): Promise<Threshold[]> {
  let out = [...mock]
  if (filters?.group) out = out.filter(t => t.groupName === filters.group)
  if (filters?.kycTier) out = out.filter(t => t.kycTier === filters.kycTier)
  if (filters?.country) out = out.filter(t => t.country === filters.country)
  if (filters?.currency) out = out.filter(t => t.currency === filters.currency)
  if (filters?.status && filters.status !== 'all') out = out.filter(t => t.status === filters.status)
  return out
}

export async function getThresholdById(id: number): Promise<Threshold | null> {
  return mock.find(t => t.id === id) ?? null
}

export async function createThreshold(data: Omit<Threshold, 'id'>): Promise<Threshold> {
  const next = { ...data, id: Math.max(0, ...mock.map(t => t.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateThreshold(id: number, data: Partial<Threshold>): Promise<Threshold | null> {
  const i = mock.findIndex(t => t.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeThreshold(id: number): Promise<boolean> {
  const i = mock.findIndex(t => t.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
