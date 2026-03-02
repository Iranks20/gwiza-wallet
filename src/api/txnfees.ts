import { apiClient, ApiError } from './client'

export type TxnFeeDto = {
  txn_fee_id: number
  date_created?: string
  txn_rule_id: number
  amount_lower: number
  amount_upper: number
  fee_type: string
  transaction_fee: number
  txn_fee_rule_is_active?: boolean
}

export type TxnFee = {
  id: number
  txnRuleId: number
  amountLower: number
  amountUpper: number
  feeType: string
  transactionFee: number
  status: string
}

function dtoToFee(d: TxnFeeDto): TxnFee {
  return {
    id: d.txn_fee_id,
    txnRuleId: d.txn_rule_id,
    amountLower: d.amount_lower,
    amountUpper: d.amount_upper,
    feeType: d.fee_type,
    transactionFee: d.transaction_fee,
    status: d.txn_fee_rule_is_active !== false ? 'active' : 'inactive',
  }
}

function feeToBody(data: { txnRuleId: number; amountLower: number; amountUpper: number; feeType: string; transactionFee: number; status?: string }): Record<string, unknown> {
  const feeType = (data.feeType ?? '').trim()
  if (feeType.length < 1 || feeType.length > 20) throw new ApiError('Fee type must be 1–20 characters', 400)
  if (data.txnRuleId < 1) throw new ApiError('Transaction rule is required', 400)
  const lower = Number(data.amountLower)
  const upper = Number(data.amountUpper)
  const fee = Number(data.transactionFee)
  if (lower < 0 || upper < 0 || fee < 0) throw new ApiError('Amounts and fee must be non-negative', 400)
  return {
    txn_rule_id: data.txnRuleId,
    amount_lower: lower,
    amount_upper: upper,
    fee_type: feeType,
    transaction_fee: fee,
    txn_fee_rule_is_active: data.status !== 'inactive',
  }
}

function extractListData(res: { data?: unknown }): TxnFeeDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnFeeDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnFeeDto[] }).data))
    return (d as { data: TxnFeeDto[] }).data
  if (d && typeof d === 'object' && 'txn_fee_id' in d) return [d as TxnFeeDto]
  return []
}

export const txnfeesApi = {
  async list(params?: { page?: number; limit?: number; txnRuleId?: number }): Promise<{ items: TxnFee[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { txnRuleId, ...rest } = params ?? {}
    let res: Awaited<ReturnType<typeof apiClient.get<TxnFeeDto[] | { data: TxnFeeDto[] }>>>
    if (txnRuleId != null && txnRuleId > 0) {
      res = await apiClient.get<TxnFeeDto[] | { data: TxnFeeDto[] }>(`/txnfees/transaction-rule/${txnRuleId}`, {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    } else {
      res = await apiClient.get<TxnFeeDto[] | { data: TxnFeeDto[] }>('/txnfees/', {
        page: rest.page ?? 1,
        limit: rest.limit ?? 100,
      })
    }
    const items = extractListData(res).map(dtoToFee)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<TxnFee | null> {
    try {
      const res = await apiClient.get<TxnFeeDto>(`/txnfees/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('txn_fee_id' in d)) return null
      return dtoToFee(d as TxnFeeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Parameters<typeof feeToBody>[0]): Promise<TxnFee> {
    const res = await apiClient.post<TxnFeeDto>('/txnfees/', feeToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create transaction fee did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToFee(d)
  },

  async update(id: number, data: Partial<Parameters<typeof feeToBody>[0]>): Promise<TxnFee | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged = {
        txnRuleId: data.txnRuleId ?? existing.txnRuleId,
        amountLower: data.amountLower ?? existing.amountLower,
        amountUpper: data.amountUpper ?? existing.amountUpper,
        feeType: data.feeType ?? existing.feeType,
        transactionFee: data.transactionFee ?? existing.transactionFee,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<TxnFeeDto>(`/txnfees/${id}`, feeToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToFee(d as TxnFeeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
