/** Transaction Fees service – replace with real API when ready */
export interface TransactionFee {
  id: number
  ruleId: number
  feeType: string
  minAmount: string
  maxAmount: string
  feeValue: string
  currency: string
  status: string
}

const mock: TransactionFee[] = [
  { id: 1, ruleId: 1, feeType: 'percentage', minAmount: '0', maxAmount: '10000', feeValue: '1.5', currency: 'KES', status: 'active' },
  { id: 2, ruleId: 1, feeType: 'fixed', minAmount: '10001', maxAmount: '100000', feeValue: '150', currency: 'KES', status: 'active' },
  { id: 3, ruleId: 1, feeType: 'percentage', minAmount: '100001', maxAmount: '500000', feeValue: '1', currency: 'KES', status: 'active' },
  { id: 4, ruleId: 2, feeType: 'percentage', minAmount: '0', maxAmount: '100000', feeValue: '0.5', currency: 'KES', status: 'active' },
  { id: 5, ruleId: 4, feeType: 'fixed', minAmount: '0', maxAmount: '5000000', feeValue: '100', currency: 'NGN', status: 'active' },
  { id: 6, ruleId: 5, feeType: 'percentage', minAmount: '0', maxAmount: '200000', feeValue: '2', currency: 'NGN', status: 'active' },
  { id: 7, ruleId: 6, feeType: 'fixed', minAmount: '0', maxAmount: '10000', feeValue: '2', currency: 'GHS', status: 'active' },
  { id: 8, ruleId: 8, feeType: 'percentage', minAmount: '0', maxAmount: '50000', feeValue: '0.3', currency: 'GBP', status: 'active' },
]

export async function listTransactionFees(filters?: { ruleId?: number; feeType?: string; status?: string }): Promise<TransactionFee[]> {
  let out = [...mock]
  if (filters?.ruleId != null) out = out.filter(f => f.ruleId === filters.ruleId)
  if (filters?.feeType) out = out.filter(f => f.feeType === filters.feeType)
  if (filters?.status && filters.status !== 'all') out = out.filter(f => f.status === filters.status)
  return out
}

export async function getTransactionFeeById(id: number): Promise<TransactionFee | null> {
  return mock.find(f => f.id === id) ?? null
}

export async function createTransactionFee(data: Omit<TransactionFee, 'id'>): Promise<TransactionFee> {
  const next = { ...data, id: Math.max(0, ...mock.map(f => f.id)) + 1 }
  mock.push(next)
  return next
}

export async function updateTransactionFee(id: number, data: Partial<TransactionFee>): Promise<TransactionFee | null> {
  const i = mock.findIndex(f => f.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeTransactionFee(id: number): Promise<boolean> {
  const i = mock.findIndex(f => f.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
