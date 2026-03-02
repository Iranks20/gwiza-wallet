import { walletsApi } from '@/api/wallets'
import type { Wallet } from '@/api/wallets'
import type { CreateWalletBody, UpdateWalletBody } from '@/api/wallets'

export type { Wallet }

export type WalletListFilters = {
  page?: number
  limit?: number
  status?: string
  countryId?: number
  currency?: string
  profileType?: string
  profileTypeGroupId?: number
  memberId?: number
  memberProfileId?: number
  msisdn?: string
  creationDateFrom?: string
  creationDateTo?: string
  accountBalanceMin?: number
  accountBalanceMax?: number
  availableBalanceMin?: number
  availableBalanceMax?: number
  ekashRegStatus?: string
}

export async function listWallets(params?: WalletListFilters): Promise<{
  items: Wallet[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const p = { page, limit }
  if (params?.status) return walletsApi.listByStatus(params.status, p)
  if (params?.countryId != null && params.countryId > 0) return walletsApi.listByCountry(params.countryId, p)
  if (params?.currency?.trim()) return walletsApi.listByCurrency(params.currency.trim(), p)
  if (params?.profileType?.trim()) return walletsApi.listByProfileType(params.profileType.trim(), p)
  if (params?.profileTypeGroupId != null && params.profileTypeGroupId > 0)
    return walletsApi.listByProfileTypeGroup(params.profileTypeGroupId, p)
  if (params?.memberId != null && params.memberId > 0) return walletsApi.listByMember(params.memberId, p)
  if (params?.memberProfileId != null && params.memberProfileId > 0)
    return walletsApi.listByMemberProfile(params.memberProfileId, p)
  if (params?.msisdn?.trim()) return walletsApi.listByMsisdn(params.msisdn.trim(), p)
  if (params?.creationDateFrom?.trim() && params?.creationDateTo?.trim())
    return walletsApi.listByCreationDate(params.creationDateFrom.trim(), params.creationDateTo.trim(), p)
  if (
    params?.accountBalanceMin != null &&
    params?.accountBalanceMax != null &&
    !Number.isNaN(params.accountBalanceMin) &&
    !Number.isNaN(params.accountBalanceMax)
  )
    return walletsApi.listByAccountBalance(params.accountBalanceMin, params.accountBalanceMax, p)
  if (
    params?.availableBalanceMin != null &&
    params?.availableBalanceMax != null &&
    !Number.isNaN(params.availableBalanceMin) &&
    !Number.isNaN(params.availableBalanceMax)
  )
    return walletsApi.listByAvailableBalance(params.availableBalanceMin, params.availableBalanceMax, p)
  if (params?.ekashRegStatus?.trim()) return walletsApi.listByEkashRegStatus(params.ekashRegStatus.trim(), p)
  return walletsApi.list(p)
}

export async function getWalletById(walletId: string | number): Promise<Wallet | null> {
  const id = typeof walletId === 'string' ? parseInt(walletId, 10) : walletId
  if (Number.isNaN(id)) return null
  return walletsApi.getById(id)
}

export async function createWallet(data: CreateWalletBody): Promise<Wallet> {
  return walletsApi.create(data)
}

export async function updateWallet(walletId: number, data: UpdateWalletBody): Promise<Wallet> {
  return walletsApi.update(walletId, data)
}
