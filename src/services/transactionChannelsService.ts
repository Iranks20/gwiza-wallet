/** Transaction Channels service – replace with real API when ready */
export interface TransactionChannel {
  id: number
  country: string
  currency: string
  type: string
  code: string
  name: string
  status: string
}

const mock: TransactionChannel[] = [
  { id: 1, country: 'Kenya', currency: 'KES', type: 'MOBILE_MONEY', code: 'MPESA', name: 'M-Pesa', status: 'active' },
  { id: 2, country: 'Kenya', currency: 'KES', type: 'USSD', code: 'USSD', name: 'USSD', status: 'active' },
  { id: 3, country: 'Nigeria', currency: 'NGN', type: 'BANK_TRANSFER', code: 'BANK', name: 'Bank Transfer', status: 'active' },
  { id: 4, country: 'Nigeria', currency: 'NGN', type: 'MOBILE_MONEY', code: 'MTN', name: 'MTN MoMo', status: 'active' },
  { id: 5, country: 'Ghana', currency: 'GHS', type: 'MOBILE_MONEY', code: 'MTN', name: 'MTN Mobile Money', status: 'active' },
  { id: 6, country: 'South Africa', currency: 'ZAR', type: 'BANK_TRANSFER', code: 'EFT', name: 'EFT', status: 'active' },
  { id: 7, country: 'Rwanda', currency: 'RWF', type: 'MOBILE_MONEY', code: 'MTN', name: 'MTN', status: 'active' },
  { id: 8, country: 'United Kingdom', currency: 'GBP', type: 'CARD', code: 'CARD', name: 'Card Payment', status: 'active' },
]

export async function listTransactionChannels(filters?: { country?: string; currency?: string; type?: string; status?: string }): Promise<TransactionChannel[]> {
  let out = [...mock]
  if (filters?.country) out = out.filter(c => c.country === filters.country)
  if (filters?.currency) out = out.filter(c => c.currency === filters.currency)
  if (filters?.type) out = out.filter(c => c.type === filters.type)
  if (filters?.status && filters.status !== 'all') out = out.filter(c => c.status === filters.status)
  return out
}

export async function getTransactionChannelById(id: number): Promise<TransactionChannel | null> {
  return mock.find(c => c.id === id) ?? null
}

export async function createTransactionChannel(data: Omit<TransactionChannel, 'id'>): Promise<TransactionChannel> {
  const next = { ...data, id: Math.max(0, ...mock.map(c => c.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateTransactionChannel(id: number, data: Partial<TransactionChannel>): Promise<TransactionChannel | null> {
  const i = mock.findIndex(c => c.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeTransactionChannel(id: number): Promise<boolean> {
  const i = mock.findIndex(c => c.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
