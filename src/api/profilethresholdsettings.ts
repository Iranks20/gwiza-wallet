import { apiClient, ApiError } from './client'

export type ProfileThresholdSettingDto = {
  threshold_setting_id: number
  profile_type_group_id: number
  kyc_tier_id: number
  country_id: number
  currency_code: string
  effective_from: string
  effective_to?: string | null
  allow_negative_balance: boolean
  interest_bearing: boolean
  daily_txn_count_cap: number
  single_txn_min_value: number | string
  single_txn_max_value: number | string
  daily_txn_value_cap: number | string
  monthly_txn_value_cap: number | string
  max_receive_value: number | string
  min_send_value: number | string
  max_send_value: number | string
  min_wallet_balance: number | string
  max_wallet_balance: number | string
  threshold_setting_is_active?: boolean
  date_created?: string
}

export type ProfileThresholdSetting = {
  id: number
  profileTypeGroupId: number
  kycTierId: number
  countryId: number
  currencyCode: string
  effectiveFrom: string
  effectiveTo?: string | null
  allowNegativeBalance: boolean
  interestBearing: boolean
  dailyTxnCountCap: number
  singleTxnMinValue: number
  singleTxnMaxValue: number
  dailyTxnValueCap: number
  monthlyTxnValueCap: number
  maxReceiveValue: number
  minSendValue: number
  maxSendValue: number
  minWalletBalance: number
  maxWalletBalance: number
  status: string
  dateCreated?: string
}

function toNum(v: number | string): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = typeof v === 'string' ? Number(v) : Number(v)
  return Number.isNaN(n) ? 0 : n
}

function dtoToThreshold(d: ProfileThresholdSettingDto): ProfileThresholdSetting {
  return {
    id: d.threshold_setting_id,
    profileTypeGroupId: d.profile_type_group_id,
    kycTierId: d.kyc_tier_id,
    countryId: d.country_id,
    currencyCode: d.currency_code,
    effectiveFrom: d.effective_from,
    effectiveTo: d.effective_to ?? undefined,
    allowNegativeBalance: d.allow_negative_balance,
    interestBearing: d.interest_bearing,
    dailyTxnCountCap: d.daily_txn_count_cap,
    singleTxnMinValue: toNum(d.single_txn_min_value),
    singleTxnMaxValue: toNum(d.single_txn_max_value),
    dailyTxnValueCap: toNum(d.daily_txn_value_cap),
    monthlyTxnValueCap: toNum(d.monthly_txn_value_cap),
    maxReceiveValue: toNum(d.max_receive_value),
    minSendValue: toNum(d.min_send_value),
    maxSendValue: toNum(d.max_send_value),
    minWalletBalance: toNum(d.min_wallet_balance),
    maxWalletBalance: toNum(d.max_wallet_balance),
    status: d.threshold_setting_is_active !== false ? 'active' : 'inactive',
    dateCreated: d.date_created,
  }
}

function toDateTime(dateStr: string | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  if (dateStr.length === 10) return `${dateStr}T00:00:00.000Z`
  return dateStr
}

function thresholdToBody(data: Omit<ProfileThresholdSetting, 'id'>): Record<string, unknown> {
  const clampMin1 = (v: number) => (v < 1 ? 1 : v)
  return {
    profile_type_group_id: data.profileTypeGroupId,
    kyc_tier_id: data.kycTierId,
    country_id: data.countryId,
    currency_code: data.currencyCode,
    effective_from: toDateTime(data.effectiveFrom) ?? new Date().toISOString().slice(0, 19) + 'Z',
    effective_to: data.effectiveTo ? toDateTime(data.effectiveTo) : null,
    allow_negative_balance: data.allowNegativeBalance,
    interest_bearing: data.interestBearing,
    daily_txn_count_cap: data.dailyTxnCountCap < 1 ? 1 : data.dailyTxnCountCap,
    single_txn_min_value: data.singleTxnMinValue < 1 ? 1 : data.singleTxnMinValue,
    single_txn_max_value: data.singleTxnMaxValue < 1 ? 1 : data.singleTxnMaxValue,
    daily_txn_value_cap: data.dailyTxnValueCap < 1 ? 1 : data.dailyTxnValueCap,
    monthly_txn_value_cap: data.monthlyTxnValueCap < 1 ? 1 : data.monthlyTxnValueCap,
    max_receive_value: clampMin1(data.maxReceiveValue),
    min_send_value: clampMin1(data.minSendValue),
    max_send_value: clampMin1(data.maxSendValue),
    min_wallet_balance: data.minWalletBalance,
    max_wallet_balance: data.maxWalletBalance,
    threshold_setting_is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): ProfileThresholdSettingDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as ProfileThresholdSettingDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: ProfileThresholdSettingDto[] }).data))
    return (d as { data: ProfileThresholdSettingDto[] }).data
  if (d && typeof d === 'object' && 'threshold_setting_id' in d) return [d as ProfileThresholdSettingDto]
  return []
}

export const profilethresholdsettingsApi = {
  async list(params?: { page?: number; limit?: number; profileTypeGroupId?: number; countryId?: number; kycTierId?: number; currencyCode?: string; status?: string }): Promise<{ items: ProfileThresholdSetting[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    let path = '/profilethresholdsettings/'
    const query: Record<string, string | number> = { page: params?.page ?? 1, limit: params?.limit ?? 100 }
    if (params?.profileTypeGroupId != null) path = `/profilethresholdsettings/profiletypegroup/${params.profileTypeGroupId}`
    else if (params?.kycTierId != null && params.kycTierId > 0) path = `/profilethresholdsettings/kyctier/${params.kycTierId}`
    else if (params?.countryId != null && params.countryId > 0) path = `/profilethresholdsettings/country/${params.countryId}`
    else if (params?.currencyCode != null) path = `/profilethresholdsettings/currency/${params.currencyCode}`
    else if (params?.status != null && params.status !== 'all') path = `/profilethresholdsettings/status/${params.status === 'active'}`
    const res = await apiClient.get<ProfileThresholdSettingDto[] | { data: ProfileThresholdSettingDto[] }>(path, query)
    const items = extractListData(res).map(dtoToThreshold)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<ProfileThresholdSetting | null> {
    try {
      const res = await apiClient.get<ProfileThresholdSettingDto>(`/profilethresholdsettings/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('threshold_setting_id' in d)) return null
      return dtoToThreshold(d as ProfileThresholdSettingDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Omit<ProfileThresholdSetting, 'id'>): Promise<ProfileThresholdSetting> {
    const res = await apiClient.post<ProfileThresholdSettingDto>('/profilethresholdsettings/', thresholdToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create threshold setting did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToThreshold(d)
  },

  async update(id: number, data: Partial<Omit<ProfileThresholdSetting, 'id'>>): Promise<ProfileThresholdSetting | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const clamp1 = (v: number) => (v < 1 ? 1 : v)
      const merged: Omit<ProfileThresholdSetting, 'id'> = {
        profileTypeGroupId: data.profileTypeGroupId ?? existing.profileTypeGroupId,
        kycTierId: data.kycTierId ?? existing.kycTierId,
        countryId: data.countryId ?? existing.countryId,
        currencyCode: data.currencyCode ?? existing.currencyCode,
        effectiveFrom: data.effectiveFrom ?? existing.effectiveFrom,
        effectiveTo: data.effectiveTo !== undefined ? data.effectiveTo : existing.effectiveTo,
        allowNegativeBalance: data.allowNegativeBalance ?? existing.allowNegativeBalance,
        interestBearing: data.interestBearing ?? existing.interestBearing,
        dailyTxnCountCap: clamp1(data.dailyTxnCountCap ?? existing.dailyTxnCountCap),
        singleTxnMinValue: clamp1(data.singleTxnMinValue ?? existing.singleTxnMinValue),
        singleTxnMaxValue: clamp1(data.singleTxnMaxValue ?? existing.singleTxnMaxValue),
        dailyTxnValueCap: clamp1(data.dailyTxnValueCap ?? existing.dailyTxnValueCap),
        monthlyTxnValueCap: clamp1(data.monthlyTxnValueCap ?? existing.monthlyTxnValueCap),
        maxReceiveValue: clamp1(data.maxReceiveValue ?? existing.maxReceiveValue),
        minSendValue: clamp1(data.minSendValue ?? existing.minSendValue),
        maxSendValue: clamp1(data.maxSendValue ?? existing.maxSendValue),
        minWalletBalance: data.minWalletBalance ?? existing.minWalletBalance,
        maxWalletBalance: data.maxWalletBalance ?? existing.maxWalletBalance,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<ProfileThresholdSettingDto>(`/profilethresholdsettings/${id}`, thresholdToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToThreshold(d as ProfileThresholdSettingDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
