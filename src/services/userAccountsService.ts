import { useraccountsApi } from '@/api/useraccounts'
import type { UserAccount } from '@/api/useraccounts'

export type { UserAccount }

export type UserAccountFilters = {
  page?: number
  limit?: number
  status?: 'new' | 'active' | 'inactive' | 'suspended' | 'all'
  userId?: number
  email?: string
}

export async function listUserAccounts(
  filters?: UserAccountFilters
): Promise<{ items: UserAccount[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 20
  const status = filters?.status && filters.status !== 'all' ? filters.status : undefined
  const userId = filters?.userId
  const email = filters?.email?.trim()

  if (userId != null && userId > 0) {
    const u = await useraccountsApi.getById(userId)
    return {
      items: u ? [u] : [],
      pagination: { page: 1, limit: 1, total: u ? 1 : 0, totalPages: u ? 1 : 0 },
    }
  }

  if (email) {
    const u = await useraccountsApi.getByEmail(email)
    return {
      items: u ? [u] : [],
      pagination: { page: 1, limit: 1, total: u ? 1 : 0, totalPages: u ? 1 : 0 },
    }
  }

  if (status) {
    return useraccountsApi.listByStatus(status, { page, limit })
  }

  return useraccountsApi.list({ page, limit })
}

export async function updateUserAccount(
  id: number,
  data: Partial<{ accessLevel: number; status: UserAccount['status'] }>
): Promise<UserAccount | null> {
  return useraccountsApi.update(id, data)
}

