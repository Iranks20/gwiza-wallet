import { txnfeesledgerApi } from '@/api/txnfeesledger'
import type { TxnFeesLedgerEntry } from '@/api/txnfeesledger'

export type { TxnFeesLedgerEntry }

export type FeesLedgerFilters = {
  page?: number
  limit?: number
  txnId?: number
  chargedWalletId?: number
  creditedWalletId?: number
  startDate?: string
  endDate?: string
  status?: 'completed' | 'pending' | 'reversed' | 'failed' | 'all'
}

export async function listFeesLedgerEntries(params?: FeesLedgerFilters): Promise<{
  items: TxnFeesLedgerEntry[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const p = { page, limit }
  const txnId = params?.txnId
  const chargedWalletId = params?.chargedWalletId
  const creditedWalletId = params?.creditedWalletId
  const startDate = params?.startDate?.trim()
  const endDate = params?.endDate?.trim()
  const status = params?.status && params.status !== 'all' ? params.status : undefined

  if (chargedWalletId != null && chargedWalletId > 0 && creditedWalletId != null && creditedWalletId > 0)
    return txnfeesledgerApi.listByChargedAndCreditedWallets(chargedWalletId, creditedWalletId, p)
  if (chargedWalletId != null && chargedWalletId > 0) return txnfeesledgerApi.listByChargedWallet(chargedWalletId, p)
  if (creditedWalletId != null && creditedWalletId > 0) return txnfeesledgerApi.listByCreditedWallet(creditedWalletId, p)
  if (txnId != null && txnId > 0) return txnfeesledgerApi.listByTxnId(txnId, p)
  if (startDate && endDate) return txnfeesledgerApi.listByDateRange(startDate, endDate, p)
  if (status) return txnfeesledgerApi.listByStatus(status, p)
  return txnfeesledgerApi.list(p)
}

