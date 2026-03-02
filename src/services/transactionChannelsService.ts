import { txnchannelsApi } from '@/api/txnchannels'

export type { TxnChannel } from '@/api/txnchannels'
export { TXN_CHANNEL_TYPE_ENUM } from '@/api/txnchannels'

export async function listTransactionChannels(filters?: { countryId?: number; status?: string }) {
  const { items } = await txnchannelsApi.list({
    countryId: filters?.countryId,
    limit: 500,
  })
  if (filters?.status && filters.status !== 'all') return items.filter(c => c.status === filters.status)
  return items
}

export async function getTransactionChannelById(id: number) {
  return txnchannelsApi.getById(id)
}

export async function createTransactionChannel(data: { type: string; name: string; displayName: string; countryId: number; currency: string; status?: string }) {
  return txnchannelsApi.create(data)
}

export async function updateTransactionChannel(id: number, data: Partial<Parameters<typeof txnchannelsApi.update>[1]>) {
  return txnchannelsApi.update(id, data)
}
