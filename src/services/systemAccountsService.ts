import { systemaccountsApi } from '@/api/systemaccounts'

export type { SystemAccount } from '@/api/systemaccounts'

export async function listSystemAccounts(filters?: { countryId?: number; status?: string }) {
  const { items } = await systemaccountsApi.list({
    countryId: filters?.countryId,
    limit: 500,
  })
  if (filters?.status && filters.status !== 'all') return items.filter(a => a.status === filters.status)
  return items
}

export async function getSystemAccountById(id: number) {
  return systemaccountsApi.getById(id)
}

export async function createSystemAccount(data: { name: string; description: string; countryId: number; currency: string; status: string }) {
  return systemaccountsApi.create(data)
}

export async function updateSystemAccount(id: number, data: Partial<Parameters<typeof systemaccountsApi.update>[1]>) {
  return systemaccountsApi.update(id, data)
}
