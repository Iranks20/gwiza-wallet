import { txnfeesApi } from '@/api/txnfees'

export type { TxnFee } from '@/api/txnfees'

export async function listTransactionFees(filters?: { ruleId?: number; status?: string }) {
  const { items } = await txnfeesApi.list({
    txnRuleId: filters?.ruleId,
    limit: 500,
  })
  let out = items
  if (filters?.status && filters.status !== 'all') out = out.filter(f => f.status === filters.status)
  return out
}

export async function getTransactionFeeById(id: number) {
  return txnfeesApi.getById(id)
}

export async function createTransactionFee(data: {
  txnRuleId: number
  amountLower: number
  amountUpper: number
  feeType: string
  transactionFee: number
  status?: string
}) {
  return txnfeesApi.create(data)
}

export async function updateTransactionFee(id: number, data: Partial<{
  txnRuleId: number
  amountLower: number
  amountUpper: number
  feeType: string
  transactionFee: number
  status: string
}>) {
  return txnfeesApi.update(id, data)
}
