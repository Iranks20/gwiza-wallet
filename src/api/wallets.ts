import { apiClient, ApiError } from './client'

export type Wallet = {
  walletId: number
  walletAccountNo: number | null
  profileType: string
  profileTypeGroupId: number
  memberId: number
  memberProfileId: number
  linkedMsisdn: string
  walletAccountTag: string | null
  walletAccountIdentifier: string | null
  walletCountryId: number
  walletCurrencyCode: string
  accountBalance: number
  availableBalance: number
  loyaltyBalance: number
  loyaltyPoints: number
  walletStatus: 'active' | 'inactive' | 'suspended' | 'closed'
  dateCreated: string | null
  lastUpdateAt: string | null
  lastUpdateBy: string | null
  rndpsRegStatus?: string
}

export type WalletDto = {
  wallet_id: number
  wallet_account_no?: number | string | null
  profile_type: string
  profile_type_group_id: number
  member_id: number
  member_profile_id: number
  linked_msisdn: string
  wallet_account_tag?: string | null
  wallet_account_identifier?: string | null
  wallet_country_id: number
  wallet_currency_code: string
  account_balance?: number | string
  available_balance?: number | string
  loyalty_balance?: number | string
  loyalty_points?: number | string
  wallet_status: 'active' | 'inactive' | 'suspended' | 'closed'
  date_created?: string | null
  last_update_at?: string | null
  last_update_by?: string | null
  rndps_reg_status?: string
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function dtoToWallet(d: WalletDto): Wallet {
  return {
    walletId: toNum(d.wallet_id),
    walletAccountNo: d.wallet_account_no != null ? toNum(d.wallet_account_no) : null,
    profileType: String(d.profile_type ?? ''),
    profileTypeGroupId: toNum(d.profile_type_group_id),
    memberId: toNum(d.member_id),
    memberProfileId: toNum(d.member_profile_id),
    linkedMsisdn: String(d.linked_msisdn ?? ''),
    walletAccountTag: d.wallet_account_tag ?? null,
    walletAccountIdentifier: d.wallet_account_identifier ?? null,
    walletCountryId: toNum(d.wallet_country_id),
    walletCurrencyCode: String(d.wallet_currency_code ?? ''),
    accountBalance: toNum(d.account_balance),
    availableBalance: toNum(d.available_balance),
    loyaltyBalance: toNum(d.loyalty_balance),
    loyaltyPoints: toNum(d.loyalty_points),
    walletStatus: (d.wallet_status as Wallet['walletStatus']) ?? 'active',
    dateCreated: d.date_created ?? null,
    lastUpdateAt: d.last_update_at ?? null,
    lastUpdateBy: d.last_update_by ?? null,
    rndpsRegStatus: d.rndps_reg_status ?? undefined,
  }
}

async function listWithPath(
  path: string,
  params?: { page?: number; limit?: number }
): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await apiClient.get<WalletDto[]>(path, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  })
  const arr = extractListData(res)
  return { items: arr.map(dtoToWallet), pagination: res.pagination }
}

function extractListData(res: { data?: unknown }): WalletDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as WalletDto[]
  return []
}

export type CreateWalletBody = {
  profile_type: string
  member_id: number
  member_profile_id: number
  linked_msisdn: string
  kyc_tier_id: number
  wallet_country_id: number
  profile_type_group_id?: number
  wallet_account_tag?: string | null
  wallet_account_identifier?: string | null
  wallet_currency_code?: string
  wallet_status?: 'active' | 'inactive' | 'suspended' | 'closed'
}

export type UpdateWalletBody = {
  profile_type_group_id?: number
  wallet_account_tag?: string | null
  wallet_account_identifier?: string | null
  wallet_status?: 'active' | 'inactive' | 'suspended' | 'closed'
}

export const walletsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<{
    items: Wallet[]
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const res = await apiClient.get<WalletDto[]>('/wallets/', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })
    const items = extractListData(res).map(dtoToWallet)
    return { items, pagination: res.pagination }
  },

  async listByStatus(
    status: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/status/${encodeURIComponent(status)}`, params)
  },
  async listByCountry(
    countryId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/country/${countryId}`, params)
  },
  async listByCurrency(
    currencyCode: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/currency/${encodeURIComponent(currencyCode)}`, params)
  },
  async listByProfileType(
    profileType: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/profiletype/${encodeURIComponent(profileType)}`, params)
  },
  async listByProfileTypeGroup(
    groupId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/profiletypegroup/${groupId}`, params)
  },
  async listByMember(
    memberId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/member/${memberId}`, params)
  },
  async listByMemberProfile(
    memberProfileId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/memberprofile/${memberProfileId}`, params)
  },
  async listByMsisdn(
    msisdn: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/msisdn/${encodeURIComponent(msisdn)}`, params)
  },
  async listByCreationDate(
    startDate: string,
    endDate: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/creationdate/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`, params)
  },
  async listByAccountBalance(
    minBalance: number,
    maxBalance: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/accountbalance/${minBalance}/${maxBalance}`, params)
  },
  async listByAvailableBalance(
    minBalance: number,
    maxBalance: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/availablebalance/${minBalance}/${maxBalance}`, params)
  },
  async listByEkashRegStatus(
    rndpsRegStatus: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: Wallet[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    return listWithPath(`/wallets/ekashregstatus/${encodeURIComponent(rndpsRegStatus)}`, params)
  },

  async getById(walletId: number): Promise<Wallet | null> {
    try {
      const res = await apiClient.get<WalletDto>(`/wallets/${walletId}`)
      const d = res.data
      if (!d || typeof d !== 'object' || typeof (d as WalletDto).wallet_id === 'undefined')
        return null
      return dtoToWallet(d as WalletDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(body: CreateWalletBody): Promise<Wallet> {
    const res = await apiClient.post<WalletDto>('/wallets/', body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create wallet returned no data', 0)
    return dtoToWallet(d as WalletDto)
  },

  async update(walletId: number, body: UpdateWalletBody): Promise<Wallet> {
    const res = await apiClient.put<WalletDto>(`/wallets/${walletId}`, body)
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Update wallet returned no data', 0)
    return dtoToWallet(d as WalletDto)
  },
}
