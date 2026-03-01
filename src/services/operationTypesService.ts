/**
 * Transaction Operation Types service – backed by Wallet+ /txnoptypes/ API.
 */

import { txnoptypesApi } from '@/api/txnoptypes'
import type { OperationType } from '@/api/txnoptypes'

export type { OperationType }

export async function listOperationTypes(filters?: { search?: string; direction?: string; tag?: string; status?: string }): Promise<OperationType[]> {
  const { items } = await txnoptypesApi.list({ limit: 500 })
  let out = items
  if (filters?.direction && filters.direction !== 'all') out = out.filter((o) => o.direction === filters.direction)
  if (filters?.tag && filters.tag !== 'all') out = out.filter((o) => o.tag === filters.tag)
  if (filters?.status && filters.status !== 'all') out = out.filter((o) => o.status === filters.status)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    out = out.filter((o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
  }
  return out
}

export async function getOperationTypeById(id: number): Promise<OperationType | null> {
  return txnoptypesApi.getById(id)
}

export async function createOperationType(data: Pick<OperationType, 'name' | 'description' | 'direction' | 'tag' | 'status'>): Promise<OperationType> {
  return txnoptypesApi.create({
    name: data.name,
    description: data.description,
    direction: data.direction,
    tag: data.tag,
    status: data.status,
  })
}

export async function updateOperationType(id: number, data: Partial<OperationType>): Promise<OperationType | null> {
  return txnoptypesApi.update(typeof id === 'string' ? parseInt(id, 10) : id, data)
}

export async function removeOperationType(id: number): Promise<boolean> {
  return txnoptypesApi.delete(typeof id === 'string' ? parseInt(id, 10) : id)
}
