import { apiClient, ApiError } from './client'

export type TxnRegisterDto = {
  transaction_id: number
  transaction_date?: string
  src_wallet_id: number
  dest_wallet_id?: number
  src_wallet_linked_msisdn?: string
  dest_wallet_linked_msisdn?: string
  operation_type_tag?: string
  transaction_type?: string
  txn_rule_id?: number
  currency_code?: string
  transaction_amount?: number | string
  transaction_fee?: number | string
  total_transaction_amount?: number | string
  src_wallet_balance?: number | string
  dest_wallet_balance?: number | string
  transaction_status?: string
  notes?: string | null
  approved_by?: string | null
  txn_channel_id?: number
  txn_channel_name?: string
  reference?: string
  // Legacy/alternative field names that might appear in some responses
  fee_amount?: number | string
  txn_status?: string
  [key: string]: unknown
}

export type TxnRegisterEntry = {
  transactionId: number
  transactionDate: string | null
  srcWalletId: number
  destWalletId: number | null
  srcWalletLinkedMsisdn: string
  destWalletLinkedMsisdn: string
  operationTypeTag: string
  transactionType: string
  txnRuleId: number | null
  transactionAmount: number
  currencyCode: string
  feeAmount: number
  txnStatus: string
  txnChannelName: string
  reference: string
  notes: string | null
  approvedBy: string | null
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function dtoToEntry(d: TxnRegisterDto): TxnRegisterEntry {
  return {
    transactionId: toNum(d.transaction_id),
    transactionDate: d.transaction_date ?? null,
    srcWalletId: toNum(d.src_wallet_id),
    destWalletId: d.dest_wallet_id != null ? toNum(d.dest_wallet_id) : null,
    srcWalletLinkedMsisdn: String(d.src_wallet_linked_msisdn ?? ''),
    destWalletLinkedMsisdn: String(d.dest_wallet_linked_msisdn ?? ''),
    operationTypeTag: String(d.operation_type_tag ?? ''),
    transactionType: String(d.transaction_type ?? ''),
    txnRuleId: d.txn_rule_id != null ? toNum(d.txn_rule_id) : null,
    transactionAmount: toNum(d.transaction_amount),
    currencyCode: String(d.currency_code ?? ''),
    feeAmount: toNum(d.transaction_fee ?? d.fee_amount),
    txnStatus: String(d.transaction_status ?? d.txn_status ?? 'completed'),
    txnChannelName: String(d.txn_channel_name ?? ''),
    reference: String(d.reference ?? ''),
    notes: d.notes ?? null,
    approvedBy: d.approved_by ?? null,
  }
}

export type CreateTxnRegisterBody = {
  transaction_date?: string
  transaction_id?: number
  src_wallet_id: number
  src_wallet_linked_msisdn?: string
  dest_wallet_linked_msisdn?: string
  dest_wallet_id?: number
  operation_type_tag: string
  transaction_type: string
  txn_rule_id?: number
  currency_code: string
  transaction_amount: number
  transaction_fee: number
  total_transaction_amount: number
  narration?: string | null
  src_wallet_balance: number
  dest_wallet_balance: number
  external_txn_id?: string | null
  txn_channel_id: number
  txn_channel_ref?: string | null
  notes?: string | null
  initiated_by: string
  on_behalf_of: string
  approved_by?: string | null
  transaction_status?: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled'
}

export type UpdateTxnRegisterBody = {
  notes?: string | null
  transaction_status?: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled'
  approved_by?: string | null
}

function extractListData(res: { data?: unknown }): TxnRegisterDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnRegisterDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnRegisterDto[] }).data))
    return (d as { data: TxnRegisterDto[] }).data
  if (d && typeof d === 'object' && 'transaction_id' in d) return [d as TxnRegisterDto]
  return []
}

export const txnregisterApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: TxnRegisterEntry[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<TxnRegisterDto[]>('/txnregister/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async getById(txnId: number): Promise<TxnRegisterEntry | null> {
    try {
      const res = await apiClient.get<TxnRegisterDto>(`/txnregister/${txnId}`)
      const d = res.data
      if (!d || typeof d !== 'object' || typeof (d as TxnRegisterDto).transaction_id === 'undefined') return null
      return dtoToEntry(d as TxnRegisterDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async listByWallet(
    walletId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnRegisterEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnRegisterDto[]>(`/txnregister/wallet/${walletId}`, {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByWalletAndDateRange(
    walletId: number,
    startDate: string,
    endDate: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnRegisterEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnRegisterDto[]>(
      `/txnregister/wallet/${walletId}/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`,
      { page: params?.page ?? 1, limit: params?.limit ?? 20 }
    )
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async create(body: CreateTxnRegisterBody): Promise<TxnRegisterEntry> {
    const res = await apiClient.post<TxnRegisterDto>('/txnregister/', body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create transaction returned no data', 0)
    return dtoToEntry(d as TxnRegisterDto)
  },

  async update(txnId: number, body: UpdateTxnRegisterBody): Promise<TxnRegisterEntry> {
    const res = await apiClient.put<TxnRegisterDto>(`/txnregister/${txnId}`, body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Update transaction returned no data', 0)
    return dtoToEntry(d as TxnRegisterDto)
  },
}
