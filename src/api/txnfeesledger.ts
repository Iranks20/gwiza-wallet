import { apiClient, ApiError } from './client'

export type TxnFeesLedgerDto = {
  entry_date?: string
  entry_id: number
  transaction_id?: number
  currency_code: string
  fee_amount: number | string
  entry_status?: 'completed' | 'pending' | 'reversed' | 'failed'
  txn_rule_id?: number
  charged_wallet_id: number
  credited_wallet_id: number
}

export type TxnFeesLedgerEntry = {
  id: number
  entryDate: string | null
  txnId: number | null
  currencyCode: string
  feeAmount: number
  status: 'completed' | 'pending' | 'reversed' | 'failed'
  txnRuleId: number | null
  chargedWalletId: number
  creditedWalletId: number
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function dtoToEntry(d: TxnFeesLedgerDto): TxnFeesLedgerEntry {
  return {
    id: toNum(d.entry_id),
    entryDate: d.entry_date ?? null,
    txnId: d.transaction_id != null ? toNum(d.transaction_id) : null,
    currencyCode: String(d.currency_code ?? ''),
    feeAmount: toNum(d.fee_amount),
    status: (d.entry_status as TxnFeesLedgerEntry['status']) ?? 'completed',
    txnRuleId: d.txn_rule_id != null ? toNum(d.txn_rule_id) : null,
    chargedWalletId: toNum(d.charged_wallet_id),
    creditedWalletId: toNum(d.credited_wallet_id),
  }
}

function extractListData(res: { data?: unknown }): TxnFeesLedgerDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnFeesLedgerDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnFeesLedgerDto[] }).data))
    return (d as { data: TxnFeesLedgerDto[] }).data
  if (d && typeof d === 'object' && 'entry_id' in d) return [d as TxnFeesLedgerDto]
  return []
}

export const txnfeesledgerApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: TxnFeesLedgerEntry[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>('/txnfeesledger/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByTxnId(
    txnId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(`/txnfeesledger/txn/${txnId}`, {
      txn_id: txnId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByDateRange(
    startDate: string,
    endDate: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(
      `/txnfeesledger/daterange/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      }
    )
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByChargedWallet(
    walletId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(`/txnfeesledger/chargedto/${walletId}`, {
      wallet_id: walletId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByCreditedWallet(
    walletId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(`/txnfeesledger/creditedto/${walletId}`, {
      wallet_id: walletId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByChargedAndCreditedWallets(
    chargedWalletId: number,
    creditedWalletId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(
      `/txnfeesledger/chargedandcreditedto/${chargedWalletId}/${creditedWalletId}`,
      {
        charged_wallet_id: chargedWalletId,
        credited_wallet_id: creditedWalletId,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      }
    )
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async listByStatus(
    status: TxnFeesLedgerEntry['status'],
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnFeesLedgerEntry[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnFeesLedgerDto[]>(`/txnfeesledger/status/${status}`, {
      status,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToEntry)
    return { items, pagination: res.pagination }
  },

  async getById(entryId: number): Promise<TxnFeesLedgerEntry | null> {
    try {
      const res = await apiClient.get<TxnFeesLedgerDto>(`/txnfeesledger/${entryId}`)
      const d = res.data
      if (!d || typeof d !== 'object' || typeof (d as TxnFeesLedgerDto).entry_id === 'undefined') return null
      return dtoToEntry(d as TxnFeesLedgerDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}

