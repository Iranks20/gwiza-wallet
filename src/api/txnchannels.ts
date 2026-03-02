import { apiClient, ApiError } from './client'

const TXN_CHANNEL_TYPE_ENUM = ['mobile', 'agent', 'teller', 'atm', 'switch', 'card'] as const

export type TxnChannelDto = {
  txn_channel_id: number
  txn_channel_type: string
  txn_channel_name: string
  txn_channel_display_name: string
  txn_channel_country_id: number
  txn_channel_currency: string
  txn_channel_is_active: boolean
}

export type TxnChannel = {
  id: number
  type: string
  name: string
  displayName: string
  countryId: number
  currency: string
  status: string
}

export { TXN_CHANNEL_TYPE_ENUM }

function dtoToChannel(d: TxnChannelDto): TxnChannel {
  return {
    id: d.txn_channel_id,
    type: d.txn_channel_type,
    name: d.txn_channel_name,
    displayName: d.txn_channel_display_name,
    countryId: d.txn_channel_country_id,
    currency: d.txn_channel_currency,
    status: d.txn_channel_is_active ? 'active' : 'inactive',
  }
}

function channelToBody(data: { type: string; name: string; displayName: string; countryId: number; currency: string; status?: string }): Record<string, unknown> {
  const name = (data.name ?? '').trim()
  const displayName = (data.displayName ?? '').trim()
  if (name.length < 1 || name.length > 255) throw new ApiError('Channel name must be 1–255 characters', 400)
  if (displayName.length < 1 || displayName.length > 255) throw new ApiError('Display name must be 1–255 characters', 400)
  if (!TXN_CHANNEL_TYPE_ENUM.includes(data.type as (typeof TXN_CHANNEL_TYPE_ENUM)[number])) throw new ApiError('Invalid channel type', 400)
  if (data.countryId < 1) throw new ApiError('Country is required', 400)
  const currency = (data.currency ?? '').trim().toUpperCase().slice(0, 4)
  if (currency.length < 3) throw new ApiError('Currency must be 3–4 characters', 400)
  return {
    txn_channel_type: data.type,
    txn_channel_name: name,
    txn_channel_display_name: displayName,
    txn_channel_country_id: data.countryId,
    txn_channel_currency: currency,
    txn_channel_is_active: data.status !== 'inactive',
  }
}

function extractListData(res: { data?: unknown }): TxnChannelDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnChannelDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnChannelDto[] }).data))
    return (d as { data: TxnChannelDto[] }).data
  if (d && typeof d === 'object' && 'txn_channel_id' in d) return [d as TxnChannelDto]
  return []
}

export const txnchannelsApi = {
  async list(params?: { page?: number; limit?: number; countryId?: number }): Promise<{ items: TxnChannel[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { countryId, ...rest } = params ?? {}
    let res: Awaited<ReturnType<typeof apiClient.get<TxnChannelDto[] | { data: TxnChannelDto[] }>>>
    if (countryId != null && countryId > 0) {
      res = await apiClient.get<TxnChannelDto[] | { data: TxnChannelDto[] }>(`/txnchannels/country/${countryId}`, {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    } else {
      res = await apiClient.get<TxnChannelDto[] | { data: TxnChannelDto[] }>('/txnchannels/', {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    }
    const items = extractListData(res).map(dtoToChannel)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<TxnChannel | null> {
    try {
      const res = await apiClient.get<TxnChannelDto>(`/txnchannels/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('txn_channel_id' in d)) return null
      return dtoToChannel(d as TxnChannelDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Parameters<typeof channelToBody>[0]): Promise<TxnChannel> {
    const res = await apiClient.post<TxnChannelDto>('/txnchannels/', channelToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create transaction channel did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToChannel(d)
  },

  async update(id: number, data: Partial<Parameters<typeof channelToBody>[0]>): Promise<TxnChannel | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged = {
        type: data.type ?? existing.type,
        name: data.name ?? existing.name,
        displayName: data.displayName ?? existing.displayName,
        countryId: data.countryId ?? existing.countryId,
        currency: data.currency ?? existing.currency,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<TxnChannelDto>(`/txnchannels/${id}`, channelToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToChannel(d as TxnChannelDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
