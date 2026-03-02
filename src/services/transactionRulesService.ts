import { txnrulesApi } from '@/api/txnrules'

export type { TxnRule } from '@/api/txnrules'

export async function listTransactionRules(filters?: { profileTypeGroupId?: number; countryId?: number; status?: string }) {
  const { items } = await txnrulesApi.list({
    profileTypeGroupId: filters?.profileTypeGroupId,
    countryId: filters?.countryId,
    status: filters?.status,
    limit: 500,
  })
  return items
}

export async function getTransactionRuleById(id: number) {
  return txnrulesApi.getById(id)
}

export async function createTransactionRule(data: Omit<import('@/api/txnrules').TxnRule, 'id'>) {
  return txnrulesApi.create(data)
}

export async function updateTransactionRule(id: number, data: Partial<Omit<import('@/api/txnrules').TxnRule, 'id'>>) {
  return txnrulesApi.update(id, data)
}
