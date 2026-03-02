import { kyctiersApi } from '@/api/kyctiers'

export type { KycTier } from '@/api/kyctiers'

export async function listKycTiers(filters?: { status?: string }): Promise<Awaited<ReturnType<typeof kyctiersApi.list>>['items']> {
  const { items } = await kyctiersApi.list({ limit: 500 })
  if (filters?.status && filters.status !== 'all') return items.filter(t => t.status === filters.status)
  return items
}

export async function getKycTierById(id: number) {
  return kyctiersApi.getById(id)
}

export async function createKycTier(data: { name: string; description: string; status: string }) {
  return kyctiersApi.create(data)
}

export async function updateKycTier(id: number, data: Partial<{ name: string; description: string; status: string }>) {
  return kyctiersApi.update(id, data)
}
