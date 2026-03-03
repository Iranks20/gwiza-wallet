import { txnregisterApi } from '@/api/txnregister'
import type { TxnRegisterEntry, CreateTxnRegisterBody, UpdateTxnRegisterBody } from '@/api/txnregister'

export type { TxnRegisterEntry }

export type TxnRegisterFilters = {
  page?: number
  limit?: number
  walletId?: number
  startDate?: string
  endDate?: string
}

export async function listTransactions(params?: TxnRegisterFilters): Promise<{
  items: TxnRegisterEntry[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const p = { page, limit }
  const walletId = params?.walletId
  const startDate = params?.startDate?.trim()
  const endDate = params?.endDate?.trim()
  if (walletId != null && walletId > 0 && startDate && endDate)
    return txnregisterApi.listByWalletAndDateRange(walletId, startDate, endDate, p)
  if (walletId != null && walletId > 0) return txnregisterApi.listByWallet(walletId, p)
  return txnregisterApi.list(p)
}

export async function getTransactionById(txnId: number): Promise<TxnRegisterEntry | null> {
  return txnregisterApi.getById(txnId)
}

export async function createTransaction(data: CreateTxnRegisterBody): Promise<TxnRegisterEntry> {
  return txnregisterApi.create(data)
}

export async function updateTransaction(txnId: number, data: UpdateTxnRegisterBody): Promise<TxnRegisterEntry> {
  return txnregisterApi.update(txnId, data)
}
