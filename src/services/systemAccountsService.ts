/** System Accounts service – replace with real API when ready */
export interface SystemAccount {
  id: number
  country: string
  currency: string
  walletId: string
  name: string
  type: string
  status: string
}

const mock: SystemAccount[] = [
  { id: 1, country: 'Kenya', currency: 'KES', walletId: 'WLT-SYS-001', name: 'Fees Ledger Account', type: 'FEES', status: 'active' },
  { id: 2, country: 'Kenya', currency: 'KES', walletId: 'WLT-SYS-002', name: 'Settlement KE', type: 'SETTLEMENT', status: 'active' },
  { id: 3, country: 'Nigeria', currency: 'NGN', walletId: 'WLT-SYS-003', name: 'Settlement Account', type: 'SETTLEMENT', status: 'active' },
  { id: 4, country: 'Nigeria', currency: 'NGN', walletId: 'WLT-SYS-004', name: 'Fees Collection NG', type: 'FEES', status: 'active' },
  { id: 5, country: 'Ghana', currency: 'GHS', walletId: 'WLT-SYS-005', name: 'Fees Collection GH', type: 'FEES', status: 'active' },
  { id: 6, country: 'South Africa', currency: 'ZAR', walletId: 'WLT-SYS-006', name: 'Float Account ZA', type: 'FLOAT', status: 'active' },
  { id: 7, country: 'United Kingdom', currency: 'GBP', walletId: 'WLT-SYS-007', name: 'Fees Ledger UK', type: 'FEES', status: 'active' },
]

export async function listSystemAccounts(filters?: { country?: string; currency?: string; status?: string; walletIdSearch?: string }): Promise<SystemAccount[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(a => a.country === filters.country)
  if (filters?.currency) out = out.filter(a => a.currency === filters.currency)
  if (filters?.status && filters.status !== 'all') out = out.filter(a => a.status === filters.status)
  if (filters?.walletIdSearch) {
    const q = filters.walletIdSearch.toLowerCase()
    out = out.filter(a => a.walletId.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
  }
  return out
}

export async function getSystemAccountById(id: number): Promise<SystemAccount | null> {
  return mock.find(a => a.id === id) ?? null
}

export async function createSystemAccount(data: Omit<SystemAccount, 'id'>): Promise<SystemAccount> {
  const next = { ...data, id: Math.max(0, ...mock.map(a => a.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateSystemAccount(id: number, data: Partial<SystemAccount>): Promise<SystemAccount | null> {
  const i = mock.findIndex(a => a.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeSystemAccount(id: number): Promise<boolean> {
  const i = mock.findIndex(a => a.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
