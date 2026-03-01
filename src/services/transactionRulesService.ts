/** Transaction Rules service – replace with real API when ready */
export interface TransactionRule {
  id: number
  country: string
  name: string
  srcCountry: string
  dstCountry: string
  opType: string
  channel: string
  group: string
  min: string
  max: string
  action: string
  priority: number
  active: string
}

const mock: TransactionRule[] = [
  { id: 1, country: 'Kenya', name: 'P2P Domestic', srcCountry: 'Kenya', dstCountry: 'Kenya', opType: 'P2P', channel: 'MOBILE_MONEY', group: 'Retail - Default', min: '10', max: '100000', action: 'allow', priority: 10, active: 'active' },
  { id: 2, country: 'Kenya', name: 'P2P High Value', srcCountry: 'Kenya', dstCountry: 'Kenya', opType: 'P2P', channel: 'MOBILE_MONEY', group: 'Retail - Default', min: '100001', max: '500000', action: 'allow', priority: 8, active: 'active' },
  { id: 3, country: 'Kenya', name: 'Agent Cash-In', srcCountry: 'Kenya', dstCountry: 'Kenya', opType: 'CASH_IN', channel: 'MOBILE_MONEY', group: 'Agents - Tier 1', min: '0', max: '500000', action: 'allow', priority: 5, active: 'active' },
  { id: 4, country: 'Nigeria', name: 'High Value Review', srcCountry: 'Nigeria', dstCountry: 'Nigeria', opType: 'P2P', channel: 'BANK_TRANSFER', group: 'Agents - Tier 2', min: '500000', max: '5000000', action: 'deny', priority: 1, active: 'active' },
  { id: 5, country: 'Nigeria', name: 'P2P Domestic', srcCountry: 'Nigeria', dstCountry: 'Nigeria', opType: 'P2P', channel: 'MOBILE_MONEY', group: 'Retail - Default', min: '100', max: '200000', action: 'allow', priority: 10, active: 'active' },
  { id: 6, country: 'Ghana', name: 'Bill Payment', srcCountry: 'Ghana', dstCountry: 'Ghana', opType: 'BILL_PAYMENT', channel: 'MOBILE_MONEY', group: 'Retail - Default', min: '0', max: '10000', action: 'allow', priority: 10, active: 'active' },
  { id: 7, country: 'South Africa', name: 'EFT Transfer', srcCountry: 'South Africa', dstCountry: 'South Africa', opType: 'P2P', channel: 'BANK_TRANSFER', group: 'Business - SME', min: '1000', max: '1000000', action: 'allow', priority: 5, active: 'active' },
  { id: 8, country: 'United Kingdom', name: 'Card P2P', srcCountry: 'United Kingdom', dstCountry: 'United Kingdom', opType: 'P2P', channel: 'CARD', group: 'Ops - Supervisors', min: '0', max: '50000', action: 'allow', priority: 10, active: 'active' },
]

export async function listTransactionRules(filters?: { country?: string; status?: string; operationType?: string; channel?: string }): Promise<TransactionRule[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(r => r.country === filters.country)
  if (filters?.status && filters.status !== 'all') out = out.filter(r => r.active === filters.status)
  if (filters?.operationType) out = out.filter(r => r.opType === filters.operationType)
  if (filters?.channel) out = out.filter(r => r.channel === filters.channel)
  return out
}

export async function getTransactionRuleById(id: number): Promise<TransactionRule | null> {
  return mock.find(r => r.id === id) ?? null
}

export async function createTransactionRule(data: Omit<TransactionRule, 'id'>): Promise<TransactionRule> {
  const next = { ...data, id: Math.max(0, ...mock.map(r => r.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateTransactionRule(id: number, data: Partial<TransactionRule>): Promise<TransactionRule | null> {
  const i = mock.findIndex(r => r.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeTransactionRule(id: number): Promise<boolean> {
  const i = mock.findIndex(r => r.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
