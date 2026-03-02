import { apiClient, ApiError } from './client'

export type TxnRuleDto = {
  rule_id: number
  date_created?: string
  rule_description: string
  rule_country_id: number
  profile_type_group_id: number
  operation_type_id: number
  operation_type_tag: string
  src_country_id: number
  src_currency: string
  src_txn_channel_id: number
  dest_country_id: number
  dest_txn_channel_id: number
  dest_currency: string
  dest_type: string
  charge_fee_to: string
  fee_split_ratio?: number
  contra_account_no?: string
  fees_collected_account_no?: string
  fees_incurred_account_no?: string
  rule_is_active?: boolean
}

export type TxnRule = {
  id: number
  description: string
  countryId: number
  profileTypeGroupId: number
  operationTypeId: number
  operationTypeTag: string
  srcCountryId: number
  srcCurrency: string
  srcTxnChannelId: number
  destCountryId: number
  destTxnChannelId: number
  destCurrency: string
  destType: string
  chargeFeeTo: string
  feeSplitRatio?: number
  contraAccountNo?: string
  feesCollectedAccountNo?: string
  feesIncurredAccountNo?: string
  status: string
}

function dtoToRule(d: TxnRuleDto): TxnRule {
  return {
    id: d.rule_id,
    description: d.rule_description,
    countryId: d.rule_country_id,
    profileTypeGroupId: d.profile_type_group_id,
    operationTypeId: d.operation_type_id,
    operationTypeTag: d.operation_type_tag,
    srcCountryId: d.src_country_id,
    srcCurrency: d.src_currency,
    srcTxnChannelId: d.src_txn_channel_id,
    destCountryId: d.dest_country_id,
    destTxnChannelId: d.dest_txn_channel_id,
    destCurrency: d.dest_currency,
    destType: d.dest_type,
    chargeFeeTo: d.charge_fee_to,
    feeSplitRatio: d.fee_split_ratio,
    contraAccountNo: d.contra_account_no,
    feesCollectedAccountNo: d.fees_collected_account_no,
    feesIncurredAccountNo: d.fees_incurred_account_no,
    status: d.rule_is_active !== false ? 'active' : 'inactive',
  }
}

function ruleToBody(data: Omit<TxnRule, 'id'>): Record<string, unknown> {
  const desc = (data.description ?? '').trim()
  if (desc.length < 1 || desc.length > 255) throw new ApiError('Rule description must be 1–255 characters', 400)
  return {
    rule_description: desc,
    rule_country_id: data.countryId,
    profile_type_group_id: data.profileTypeGroupId,
    operation_type_id: data.operationTypeId,
    operation_type_tag: data.operationTypeTag,
    src_country_id: data.srcCountryId,
    src_currency: data.srcCurrency,
    src_txn_channel_id: data.srcTxnChannelId,
    dest_country_id: data.destCountryId,
    dest_txn_channel_id: data.destTxnChannelId,
    dest_currency: data.destCurrency,
    dest_type: data.destType,
    charge_fee_to: data.chargeFeeTo,
    fee_split_ratio: data.feeSplitRatio,
    contra_account_no: data.contraAccountNo ?? '',
    fees_collected_account_no: data.feesCollectedAccountNo ?? '',
    fees_incurred_account_no: data.feesIncurredAccountNo ?? '',
    rule_is_active: data.status === 'active',
  }
}

function extractListData(res: { data?: unknown }): TxnRuleDto[] {
  const d = res.data
  if (Array.isArray(d)) return d as TxnRuleDto[]
  if (d && typeof d === 'object' && Array.isArray((d as { data?: TxnRuleDto[] }).data))
    return (d as { data: TxnRuleDto[] }).data
  if (d && typeof d === 'object' && 'rule_id' in d) return [d as TxnRuleDto]
  return []
}

export const txnrulesApi = {
  async list(params?: { page?: number; limit?: number; countryId?: number; profileTypeGroupId?: number; status?: string }): Promise<{ items: TxnRule[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const { countryId, profileTypeGroupId, status, ...rest } = params ?? {}
    let path = '/txnrules/'
    if (profileTypeGroupId != null && profileTypeGroupId > 0) path = `/txnrules/profile-type-group/${profileTypeGroupId}`
    else if (countryId != null && countryId > 0) path = `/txnrules/country/${countryId}`
    else if (status != null && status !== 'all') path = `/txnrules/status/${status === 'active'}`
    const res = await apiClient.get<TxnRuleDto[] | { data: TxnRuleDto[] }>(path, { page: rest.page ?? 1, limit: rest.limit ?? 100 })
    const items = extractListData(res).map(dtoToRule)
    return { items, pagination: res.pagination }
  },

  async getById(id: number): Promise<TxnRule | null> {
    try {
      const res = await apiClient.get<TxnRuleDto>(`/txnrules/${id}`)
      const d = res.data
      if (!d || typeof d !== 'object' || !('rule_id' in d)) return null
      return dtoToRule(d as TxnRuleDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },

  async create(data: Omit<TxnRule, 'id'>): Promise<TxnRule> {
    const res = await apiClient.post<TxnRuleDto>('/txnrules/', ruleToBody(data))
    const d = res.data
    if (!d || typeof d !== 'object') throw new ApiError('Create transaction rule did not return data', 200, res.resp_code, res.resp_msg, res.data)
    return dtoToRule(d)
  },

  async update(id: number, data: Partial<Omit<TxnRule, 'id'>>): Promise<TxnRule | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const merged: Omit<TxnRule, 'id'> = {
        description: data.description ?? existing.description,
        countryId: data.countryId ?? existing.countryId,
        profileTypeGroupId: data.profileTypeGroupId ?? existing.profileTypeGroupId,
        operationTypeId: data.operationTypeId ?? existing.operationTypeId,
        operationTypeTag: data.operationTypeTag ?? existing.operationTypeTag,
        srcCountryId: data.srcCountryId ?? existing.srcCountryId,
        srcCurrency: data.srcCurrency ?? existing.srcCurrency,
        srcTxnChannelId: data.srcTxnChannelId ?? existing.srcTxnChannelId,
        destCountryId: data.destCountryId ?? existing.destCountryId,
        destTxnChannelId: data.destTxnChannelId ?? existing.destTxnChannelId,
        destCurrency: data.destCurrency ?? existing.destCurrency,
        destType: data.destType ?? existing.destType,
        chargeFeeTo: data.chargeFeeTo ?? existing.chargeFeeTo,
        feeSplitRatio: data.feeSplitRatio ?? existing.feeSplitRatio,
        contraAccountNo: data.contraAccountNo ?? existing.contraAccountNo,
        feesCollectedAccountNo: data.feesCollectedAccountNo ?? existing.feesCollectedAccountNo,
        feesIncurredAccountNo: data.feesIncurredAccountNo ?? existing.feesIncurredAccountNo,
        status: data.status ?? existing.status,
      }
      const res = await apiClient.put<TxnRuleDto>(`/txnrules/${id}`, ruleToBody(merged))
      const d = res.data
      if (!d || typeof d !== 'object') return null
      return dtoToRule(d as TxnRuleDto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
}
