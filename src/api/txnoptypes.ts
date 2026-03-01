/**
 * Transaction Operation Types API – /txnoptypes/
 */

import { apiClient, ApiError } from './client'

export type TxnOpTypeDto = {
  operation_type_id: number
  operation_type_name: string
  operation_type_description: string | null
  operation_type_direction: string
  operation_type_tag: string
  operation_type_is_active: boolean
  date_created?: string
  last_update_at?: string
  last_update_to?: string
  last_update_by?: string
}

/** App-facing type (id can be number from API). */
export type OperationType = {
  id: number | string
  code: string
  name: string
  direction: string
  tag: string
  description: string
  status: string
}

function dtoToOpType(d: TxnOpTypeDto): OperationType {
  return {
    id: d.operation_type_id,
    code: d.operation_type_name,
    name: d.operation_type_name,
    direction: d.operation_type_direction,
    tag: d.operation_type_tag,
    description: d.operation_type_description ?? '',
    status: d.operation_type_is_active ? 'active' : 'inactive',
  }
}

function extractListData(res: { data?: unknown }): TxnOpTypeDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnOpTypeDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnOpTypeDto[] }).data))
    return (d as { data: TxnOpTypeDto[] }).data
  if (d && typeof d === 'object' && 'operation_type_id' in d) return [d as TxnOpTypeDto]
  return []
}

export const txnoptypesApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{ items: OperationType[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await apiClient.get<TxnOpTypeDto[] | { data: TxnOpTypeDto[] }>('/txnoptypes/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToOpType)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<OperationType | null> {
    try {
      const res = await apiClient.get<TxnOpTypeDto>(`/txnoptypes/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToOpType(d as TxnOpTypeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: { name: string; description?: string; direction: string; tag: string; status: string }): Promise<OperationType> {
    const res = await apiClient.post<TxnOpTypeDto>('/txnoptypes/', {
      operation_type_name: data.name,
      operation_type_description: data.description ?? null,
      operation_type_direction: data.direction,
      operation_type_tag: data.tag,
      operation_type_is_active: data.status === 'active',
    })
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToOpType(d as TxnOpTypeDto)
  },

  async update(id: number, data: Partial<{ name: string; description: string; direction: string; tag: string; status: string }>): Promise<OperationType | null> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.operation_type_name = data.name
      if (data.description !== undefined) body.operation_type_description = data.description
      if (data.direction !== undefined) body.operation_type_direction = data.direction
      if (data.tag !== undefined) body.operation_type_tag = data.tag
      if (data.status !== undefined) body.operation_type_is_active = data.status === 'active'
      const res = await apiClient.put<TxnOpTypeDto>(`/txnoptypes/${id}`, body)
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToOpType(d as TxnOpTypeDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/txnoptypes/${id}`)
      return true
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return false
      throw e
    }
  },
}
