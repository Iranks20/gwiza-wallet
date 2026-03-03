import { apiClient, ApiError } from './client'

export type TxnAuditLogDto = {
  date_created?: string
  record_id: number
  transaction_id?: number
  action: string
  performed_by: string
  performed_by_type: string
  previous_status?: string
  new_status?: string
  ip_address?: string
  user_agent?: string
  meta?: unknown
}

export type TxnAuditLog = {
  id: number
  dateCreated: string | null
  txnId: number | null
  action: string
  performedBy: string
  performedByType: string
  previousStatus: string
  newStatus: string
  ipAddress: string
  userAgent: string
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function dtoToAuditLog(d: TxnAuditLogDto): TxnAuditLog {
  return {
    id: toNum(d.record_id),
    dateCreated: d.date_created ?? null,
    txnId: d.transaction_id != null ? toNum(d.transaction_id) : null,
    action: String(d.action ?? ''),
    performedBy: String(d.performed_by ?? ''),
    performedByType: String(d.performed_by_type ?? ''),
    previousStatus: String(d.previous_status ?? ''),
    newStatus: String(d.new_status ?? ''),
    ipAddress: String(d.ip_address ?? ''),
    userAgent: String(d.user_agent ?? ''),
  }
}

function extractListData(res: { data?: unknown }): TxnAuditLogDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnAuditLogDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnAuditLogDto[] }).data))
    return (d as { data: TxnAuditLogDto[] }).data
  if (d && typeof d === 'object' && 'record_id' in d) return [d as TxnAuditLogDto]
  return []
}

export const txnauditlogsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: TxnAuditLog[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<TxnAuditLogDto[]>('/txnauditlogs/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })
    const items = extractListData(res).map(dtoToAuditLog)
    return { items, pagination: res.pagination }
  },

  async listByTxnId(
    txnId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnAuditLog[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnAuditLogDto[]>(`/txnauditlogs/txn/${txnId}`, {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      txn_id: txnId,
    })
    const items = extractListData(res).map(dtoToAuditLog)
    return { items, pagination: res.pagination }
  },

  async listByUser(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnAuditLog[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnAuditLogDto[]>(`/txnauditlogs/user/${encodeURIComponent(userId)}`, {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      user_id: userId,
    })
    const items = extractListData(res).map(dtoToAuditLog)
    return { items, pagination: res.pagination }
  },

  async listByDateRange(
    startDate: string,
    endDate: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: TxnAuditLog[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnAuditLogDto[]>(
      `/txnauditlogs/date-range/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      }
    )
    const items = extractListData(res).map(dtoToAuditLog)
    return { items, pagination: res.pagination }
  },

  async getById(recordId: number): Promise<TxnAuditLog | null> {
    try {
      const res = await apiClient.get<TxnAuditLogDto>(`/txnauditlogs/${recordId}`)
      const d = res.data
      if (!d || typeof d !== 'object' || typeof (d as TxnAuditLogDto).record_id === 'undefined') return null
      return dtoToAuditLog(d as TxnAuditLogDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}

