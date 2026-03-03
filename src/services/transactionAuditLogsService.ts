import { txnauditlogsApi } from '@/api/txnauditlogs'
import type { TxnAuditLog } from '@/api/txnauditlogs'

export type { TxnAuditLog }

export type AuditLogFilters = {
  page?: number
  limit?: number
  txnId?: number
  userId?: string
  startDate?: string
  endDate?: string
}

export async function listAuditLogs(params?: AuditLogFilters): Promise<{
  items: TxnAuditLog[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const p = { page, limit }
  const txnId = params?.txnId
  const userId = params?.userId?.trim()
  const startDate = params?.startDate?.trim()
  const endDate = params?.endDate?.trim()

  if (txnId != null && txnId > 0) return txnauditlogsApi.listByTxnId(txnId, p)
  if (userId) return txnauditlogsApi.listByUser(userId, p)
  if (startDate && endDate) return txnauditlogsApi.listByDateRange(startDate, endDate, p)
  return txnauditlogsApi.list(p)
}

