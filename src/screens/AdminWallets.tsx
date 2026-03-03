'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Search, Filter, Eye, X, Plus, RotateCcw } from 'lucide-react'
import { listWallets, listCountries, listKycTiers, listProfileTypes, listProfileTypeGroups } from '@/services'
import { createWallet, updateWallet } from '@/services/walletsService'
import type { Wallet } from '@/api/wallets'
import type { CreateWalletBody } from '@/api/wallets'
import { ApiError } from '@/api/client'

const LINKED_MSISDN_PATTERN = /^\+?[0-9]{8,16}$/
const WALLET_CURRENCY_PATTERN = /^[A-Z]{3}$/

type WalletFieldErrors = Partial<Record<
  'linkedMsisdn' | 'walletCurrencyCode' | 'walletAccountTag' | 'walletAccountIdentifier' | 'profileType' | 'kycTierId' | 'memberId' | 'memberProfileId' | 'walletCountryId' | 'profileTypeGroupId',
  string
>>

function parseWalletApiErrors(errorMsg: string): WalletFieldErrors {
  const out: WalletFieldErrors = {}
  const snakeToCamel: Record<string, keyof WalletFieldErrors> = {
    linked_msisdn: 'linkedMsisdn',
    wallet_currency_code: 'walletCurrencyCode',
    wallet_account_tag: 'walletAccountTag',
    wallet_account_identifier: 'walletAccountIdentifier',
    profile_type: 'profileType',
    kyc_tier_id: 'kycTierId',
    member_id: 'memberId',
    member_profile_id: 'memberProfileId',
    wallet_country_id: 'walletCountryId',
    profile_type_group_id: 'profileTypeGroupId',
  }
  const parts = errorMsg.split(',').map(s => s.trim())
  for (const part of parts) {
    const m = part.match(/body\/(\w+)\s+(.+)/)
    if (m) {
      const field = snakeToCamel[m[1]] ?? m[1]
      const message = m[2].replace(/^must /, '').replace(/^NOT /, '')
      out[field as keyof WalletFieldErrors] = message
    }
  }
  return out
}

function validateCreateWalletForm(form: WalletFormState): WalletFieldErrors {
  const err: WalletFieldErrors = {}
  const msisdn = form.linkedMsisdn.trim()
  if (!msisdn) err.linkedMsisdn = 'Linked MSISDN is required.'
  else if (!LINKED_MSISDN_PATTERN.test(msisdn)) err.linkedMsisdn = 'Enter digits only (optional + at start). Length and format are validated by the API for the selected country.'
  const currency = form.walletCurrencyCode.trim().toUpperCase()
  if (currency && (currency.length !== 3 || !WALLET_CURRENCY_PATTERN.test(currency))) err.walletCurrencyCode = 'Must be exactly 3 uppercase letters (e.g. RWF, USD).'
  const tag = form.walletAccountTag.trim()
  if (tag && (tag.length < 1 || tag.length > 15)) err.walletAccountTag = 'If provided, must be 1–15 characters.'
  const ident = form.walletAccountIdentifier.trim()
  if (ident && (ident.length < 1 || ident.length > 25)) err.walletAccountIdentifier = 'If provided, must be 1–25 characters.'
  const memberId = Number(form.memberId)
  if (!form.memberId || isNaN(memberId) || memberId < 1) err.memberId = 'Must be at least 1.'
  const memberProfileId = Number(form.memberProfileId)
  if (!form.memberProfileId || isNaN(memberProfileId) || memberProfileId < 1) err.memberProfileId = 'Must be at least 1.'
  if (!form.profileType) err.profileType = 'Profile type is required.'
  if (!form.kycTierId) err.kycTierId = 'KYC tier is required.'
  if (!form.walletCountryId) err.walletCountryId = 'Country is required.'
  return err
}

type EditWalletFieldErrors = Partial<Record<'walletAccountTag' | 'walletAccountIdentifier' | 'profileTypeGroupId', string>>

function parseEditWalletApiErrors(errorMsg: string): EditWalletFieldErrors {
  const out: EditWalletFieldErrors = {}
  const snakeToCamel: Record<string, keyof EditWalletFieldErrors> = {
    wallet_account_tag: 'walletAccountTag',
    wallet_account_identifier: 'walletAccountIdentifier',
    profile_type_group_id: 'profileTypeGroupId',
  }
  const parts = errorMsg.split(',').map(s => s.trim())
  for (const part of parts) {
    const m = part.match(/body\/(\w+)\s+(.+)/)
    if (m) {
      const field = snakeToCamel[m[1]] ?? m[1]
      out[field as keyof EditWalletFieldErrors] = m[2].replace(/^must /, '').replace(/^NOT /, '')
    }
  }
  return out
}

function validateEditWalletForm(state: { walletAccountTag: string; walletAccountIdentifier: string }): EditWalletFieldErrors {
  const err: EditWalletFieldErrors = {}
  const tag = state.walletAccountTag.trim()
  if (tag && (tag.length < 1 || tag.length > 15)) err.walletAccountTag = 'If provided, must be 1–15 characters.'
  const ident = state.walletAccountIdentifier.trim()
  if (ident && (ident.length < 1 || ident.length > 25)) err.walletAccountIdentifier = 'If provided, must be 1–25 characters.'
  return err
}

function formatBalance(n: number, currency: string): string {
  return `${currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString()
  } catch {
    return s
  }
}

type WalletFormState = {
  profileType: string
  kycTierId: string
  memberId: string
  memberProfileId: string
  linkedMsisdn: string
  walletCountryId: string
  walletCurrencyCode: string
  profileTypeGroupId: string
  walletAccountTag: string
  walletAccountIdentifier: string
  walletStatus: 'active' | 'inactive' | 'suspended' | 'closed'
}

const emptyForm: WalletFormState = {
  profileType: '',
  kycTierId: '',
  memberId: '',
  memberProfileId: '',
  linkedMsisdn: '',
  walletCountryId: '',
  walletCurrencyCode: 'RWF',
  profileTypeGroupId: '',
  walletAccountTag: '',
  walletAccountIdentifier: '',
  walletStatus: 'active',
}

interface WalletDrawerProps {
  open: boolean
  onClose: () => void
  countries: { id: number; name: string; currency: string }[]
  kycTiers: { id: number; name: string }[]
  profileTypes: { code: string; name: string }[]
  onCreated: () => void
}

const fieldErrStyle = { color: '#B91C1C', fontSize: 12, marginTop: 4 } as const

function WalletDrawer({ open, onClose, countries, kycTiers, profileTypes, onCreated }: WalletDrawerProps) {
  const [form, setForm] = useState<WalletFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<WalletFieldErrors>({})
  const [profileTypeGroups, setProfileTypeGroups] = useState<{ id: number; name: string; kycTierId: number }[]>([])

  useEffect(() => {
    if (open) {
      const defaultCountry = countries[0]
      setForm(f => ({
        ...emptyForm,
        walletCountryId: defaultCountry ? String(defaultCountry.id) : '',
        walletCurrencyCode: defaultCountry?.currency ? defaultCountry.currency : 'RWF',
      }))
      setError(null)
      setFieldErrors({})
      setProfileTypeGroups([])
    }
  }, [open, countries])

  useEffect(() => {
    if (!open) return
    const cId = form.walletCountryId ? parseInt(form.walletCountryId, 10) : NaN
    const promise = !Number.isNaN(cId) && cId > 0
      ? listProfileTypeGroups({ countryId: cId, status: 'active' })
      : listProfileTypeGroups({ status: 'active' })
    promise.then(groups => setProfileTypeGroups(groups.map(g => ({ id: g.id, name: g.name, kycTierId: g.kycTierId })))).catch(() => setProfileTypeGroups([]))
  }, [open, form.walletCountryId])

  const selectedKycTierId = form.kycTierId ? parseInt(form.kycTierId, 10) : NaN
  const profileTypeGroupsMatchingKyc = React.useMemo(() => {
    if (!form.kycTierId || Number.isNaN(selectedKycTierId)) return []
    return profileTypeGroups.filter(g => g.kycTierId === selectedKycTierId)
  }, [profileTypeGroups, form.kycTierId, selectedKycTierId])

  if (!open) return null

  const handleChange = (key: keyof WalletFormState, value: string) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'walletCountryId') {
        next.profileTypeGroupId = ''
        const c = countries.find(c => String(c.id) === value)
        next.walletCurrencyCode = c?.currency ? c.currency : (f.walletCurrencyCode || 'RWF')
      }
      if (key === 'kycTierId') next.profileTypeGroupId = ''
      return next
    })
    if (fieldErrors[key as keyof WalletFieldErrors]) setFieldErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const handleSave = async () => {
    setError(null)
    setFieldErrors({})
    const validationErrors = validateCreateWalletForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }
    const body: CreateWalletBody = {
      profile_type: form.profileType,
      member_id: Number(form.memberId),
      member_profile_id: Number(form.memberProfileId),
      linked_msisdn: form.linkedMsisdn.trim(),
      kyc_tier_id: Number(form.kycTierId),
      wallet_country_id: Number(form.walletCountryId),
    }
    const currency = form.walletCurrencyCode.trim().toUpperCase()
    if (currency) body.wallet_currency_code = currency
    if (form.profileTypeGroupId) body.profile_type_group_id = Number(form.profileTypeGroupId)
    const tag = form.walletAccountTag.trim()
    if (tag) body.wallet_account_tag = tag
    const ident = form.walletAccountIdentifier.trim()
    if (ident) body.wallet_account_identifier = ident
    body.wallet_status = form.walletStatus

    setSaving(true)
    try {
      await createWallet(body)
      onCreated()
      onClose()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to create wallet')
      if (e instanceof ApiError && msg && (e.status === 400 || e.respCode === 101)) {
        if ((msg.includes('phone number') || msg.includes('Expected format') || msg.includes('wallet tag')) && msg.includes('Invalid')) {
          const expectedMatch = msg.match(/Expected format:\s*(.+)/)
          const formatPart = expectedMatch ? expectedMatch[1].replace(/\s*\(code\s*\d+\)\s*$/, '').trim() : ''
          const hint = formatPart ? `Phone number must match the selected country's format. Expected format: ${formatPart}` : msg.replace(/\s*\(code\s*\d+\)\s*$/, '').trim()
          setFieldErrors(prev => ({ ...prev, linkedMsisdn: hint }))
          setSaving(false)
          return
        }
        if (msg.includes('does not match') && (msg.includes('KYC Tier') || msg.includes('Profile Type Group'))) {
          const hint = 'Profile type group must have the same KYC tier as selected above. Choose a group from the list (only matching KYC tiers are shown) or leave None.'
          setFieldErrors(prev => ({ ...prev, profileTypeGroupId: hint, kycTierId: hint }))
          setSaving(false)
          return
        }
        const apiFieldErrors = parseWalletApiErrors(msg)
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }))
          setSaving(false)
          return
        }
      }
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Add Wallet</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {error && (
            <div className="mb-2 p-2 rounded border border-red-200 bg-red-50 text-xs" style={{ color: '#B91C1C' }}>{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Type</label>
            <select
              value={form.profileType}
              onChange={e => handleChange('profileType', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: fieldErrors.profileType ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select profile type</option>
              {profileTypes.map(p => (
                <option key={p.code} value={p.code}>{p.code}</option>
              ))}
            </select>
            {fieldErrors.profileType && <p style={fieldErrStyle}>{fieldErrors.profileType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>KYC Tier</label>
            <select
              value={form.kycTierId}
              onChange={e => handleChange('kycTierId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: fieldErrors.kycTierId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select KYC tier</option>
              {kycTiers.map(t => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </select>
            {fieldErrors.kycTierId && <p style={fieldErrStyle}>{fieldErrors.kycTierId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Member ID</label>
              <input
                value={form.memberId}
                onChange={e => handleChange('memberId', e.target.value)}
                type="number"
                min={1}
                className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
                style={{ borderColor: fieldErrors.memberId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
              />
              {fieldErrors.memberId && <p style={fieldErrStyle}>{fieldErrors.memberId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Member Profile ID</label>
              <input
                value={form.memberProfileId}
                onChange={e => handleChange('memberProfileId', e.target.value)}
                type="number"
                min={1}
                className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
                style={{ borderColor: fieldErrors.memberProfileId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
              />
              {fieldErrors.memberProfileId && <p style={fieldErrStyle}>{fieldErrors.memberProfileId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Linked MSISDN</label>
            <input
              value={form.linkedMsisdn}
              onChange={e => handleChange('linkedMsisdn', e.target.value)}
              placeholder="e.g. 250788123456 or +250788123456 (10–15 digits)"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: fieldErrors.linkedMsisdn ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            />
            {fieldErrors.linkedMsisdn && <p style={fieldErrStyle}>{fieldErrors.linkedMsisdn}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
            <select
              value={form.walletCountryId}
              onChange={e => handleChange('walletCountryId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: fieldErrors.walletCountryId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select country</option>
              {countries.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            {fieldErrors.walletCountryId && <p style={fieldErrStyle}>{fieldErrors.walletCountryId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency code</label>
            <input
              value={form.walletCurrencyCode}
              readOnly
              placeholder="From selected country"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: fieldErrors.walletCurrencyCode ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13, background: '#F9FAFB', cursor: 'default' }}
            />
            <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>From selected country.</p>
            {fieldErrors.walletCurrencyCode && <p style={fieldErrStyle}>{fieldErrors.walletCurrencyCode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile type group</label>
            <select
              value={profileTypeGroupsMatchingKyc.some(g => String(g.id) === form.profileTypeGroupId) ? form.profileTypeGroupId : ''}
              onChange={e => handleChange('profileTypeGroupId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">None</option>
              {profileTypeGroupsMatchingKyc.map(g => (
                <option key={g.id} value={String(g.id)}>{g.name} (ID {g.id})</option>
              ))}
            </select>
            {form.walletCountryId && profileTypeGroups.length === 0 && (
              <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>No profile type groups for this country.</p>
            )}
            {form.walletCountryId && form.kycTierId && profileTypeGroups.length > 0 && profileTypeGroupsMatchingKyc.length === 0 && (
              <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>No profile type groups for this country with the selected KYC tier. Select another KYC tier or leave None.</p>
            )}
            {form.kycTierId && profileTypeGroupsMatchingKyc.length > 0 && !fieldErrors.profileTypeGroupId && !fieldErrors.kycTierId && (
              <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>Only groups matching the selected KYC tier are shown.</p>
            )}
            {fieldErrors.profileTypeGroupId && <p style={fieldErrStyle}>{fieldErrors.profileTypeGroupId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Wallet account tag (max 15 chars)</label>
            <input
              value={form.walletAccountTag}
              onChange={e => handleChange('walletAccountTag', e.target.value)}
              maxLength={15}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: fieldErrors.walletAccountTag ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            />
            {fieldErrors.walletAccountTag && <p style={fieldErrStyle}>{fieldErrors.walletAccountTag}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Wallet account identifier (max 25 chars)</label>
            <input
              value={form.walletAccountIdentifier}
              onChange={e => handleChange('walletAccountIdentifier', e.target.value)}
              maxLength={25}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: fieldErrors.walletAccountIdentifier ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
            />
            {fieldErrors.walletAccountIdentifier && <p style={fieldErrStyle}>{fieldErrors.walletAccountIdentifier}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select
              value={form.walletStatus}
              onChange={e => handleChange('walletStatus', e.target.value as WalletFormState['walletStatus'])}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {saving ? 'Creating…' : 'Create Wallet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminWallets() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [countries, setCountries] = useState<{ id: number; name: string; currency: string }[]>([])
  const [kycTiers, setKycTiers] = useState<{ id: number; name: string }[]>([])
  const [profileTypes, setProfileTypes] = useState<{ code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [profileTypeFilter, setProfileTypeFilter] = useState('')
  const [profileTypeGroupFilter, setProfileTypeGroupFilter] = useState('')
  const [memberIdFilter, setMemberIdFilter] = useState('')
  const [memberProfileIdFilter, setMemberProfileIdFilter] = useState('')
  const [msisdnFilter, setMsisdnFilter] = useState('')
  const [accountNoFilter, setAccountNoFilter] = useState('')
  const [creationDateFrom, setCreationDateFrom] = useState('')
  const [creationDateTo, setCreationDateTo] = useState('')
  const [accountBalanceMin, setAccountBalanceMin] = useState('')
  const [accountBalanceMax, setAccountBalanceMax] = useState('')
  const [availableBalanceMin, setAvailableBalanceMin] = useState('')
  const [availableBalanceMax, setAvailableBalanceMax] = useState('')
  const [ekashRegStatusFilter, setEkashRegStatusFilter] = useState('')
  const [profileTypeGroups, setProfileTypeGroups] = useState<{ id: number; name: string }[]>([])

  const countryIdToName = React.useMemo(() => {
    const m: Record<number, string> = {}
    countries.forEach(c => { m[c.id] = c.name })
    return m
  }, [countries])

  const listParams = React.useMemo(() => {
    const pageNum = page
    const limitNum = 20
    if (statusFilter !== 'all') return { page: pageNum, limit: limitNum, status: statusFilter }
    if (countryFilter !== 'all') {
      const cId = parseInt(countryFilter, 10)
      if (!Number.isNaN(cId) && cId > 0) return { page: pageNum, limit: limitNum, countryId: cId }
    }
    if (currencyFilter.trim()) return { page: pageNum, limit: limitNum, currency: currencyFilter.trim() }
    if (profileTypeFilter.trim()) return { page: pageNum, limit: limitNum, profileType: profileTypeFilter.trim() }
    if (profileTypeGroupFilter !== '') {
      const gId = parseInt(profileTypeGroupFilter, 10)
      if (!Number.isNaN(gId) && gId > 0) return { page: pageNum, limit: limitNum, profileTypeGroupId: gId }
    }
    const mId = memberIdFilter.trim() ? parseInt(memberIdFilter, 10) : NaN
    if (!Number.isNaN(mId) && mId > 0) return { page: pageNum, limit: limitNum, memberId: mId }
    const mpId = memberProfileIdFilter.trim() ? parseInt(memberProfileIdFilter, 10) : NaN
    if (!Number.isNaN(mpId) && mpId > 0) return { page: pageNum, limit: limitNum, memberProfileId: mpId }
    if (msisdnFilter.trim()) return { page: pageNum, limit: limitNum, msisdn: msisdnFilter.trim() }
    if (creationDateFrom.trim() && creationDateTo.trim())
      return { page: pageNum, limit: limitNum, creationDateFrom: creationDateFrom.trim(), creationDateTo: creationDateTo.trim() }
    const abMin = accountBalanceMin.trim() ? parseFloat(accountBalanceMin) : NaN
    const abMax = accountBalanceMax.trim() ? parseFloat(accountBalanceMax) : NaN
    if (!Number.isNaN(abMin) && !Number.isNaN(abMax)) return { page: pageNum, limit: limitNum, accountBalanceMin: abMin, accountBalanceMax: abMax }
    const avMin = availableBalanceMin.trim() ? parseFloat(availableBalanceMin) : NaN
    const avMax = availableBalanceMax.trim() ? parseFloat(availableBalanceMax) : NaN
    if (!Number.isNaN(avMin) && !Number.isNaN(avMax)) return { page: pageNum, limit: limitNum, availableBalanceMin: avMin, availableBalanceMax: avMax }
    if (ekashRegStatusFilter.trim()) return { page: pageNum, limit: limitNum, ekashRegStatus: ekashRegStatusFilter.trim() }
    return { page: pageNum, limit: limitNum }
  }, [
    page,
    statusFilter,
    countryFilter,
    currencyFilter,
    profileTypeFilter,
    profileTypeGroupFilter,
    memberIdFilter,
    memberProfileIdFilter,
    msisdnFilter,
    creationDateFrom,
    creationDateTo,
    accountBalanceMin,
    accountBalanceMax,
    availableBalanceMin,
    availableBalanceMax,
    ekashRegStatusFilter,
  ])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      listWallets(listParams),
      listCountries().then(items => items.map(c => ({ id: c.id, name: c.name, currency: c.currency }))),
      listKycTiers({ status: 'all' }),
      listProfileTypes({ status: 'all' }),
      listProfileTypeGroups({ status: 'active' }).then(g => g.map(x => ({ id: x.id, name: x.name }))),
    ]).then(([wRes, cList, tiers, ptypes, groups]) => {
      if (cancelled) return
      setWallets(wRes.items)
      setPagination(wRes.pagination ?? null)
      setCountries(cList)
      setKycTiers(tiers.map(t => ({ id: t.id, name: t.name })))
      setProfileTypes(ptypes.map(p => ({ code: p.code, name: p.name })))
      setProfileTypeGroups(groups)
      setLoading(false)
    }).catch(e => {
      if (cancelled) return
      setError(e instanceof Error ? e.message : 'Failed to load wallets')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [refreshKey, listParams])

  const filtered = React.useMemo(() => {
    let list = wallets
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(w =>
        String(w.walletId).includes(q) ||
        String(w.walletAccountNo ?? '').includes(q) ||
        w.linkedMsisdn.includes(q) ||
        String(w.memberId).includes(q) ||
        w.walletCurrencyCode.toLowerCase().includes(q) ||
        w.profileType.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(w => w.walletStatus === statusFilter)
    if (countryFilter !== 'all') {
      const cId = parseInt(countryFilter, 10)
      if (!Number.isNaN(cId)) list = list.filter(w => w.walletCountryId === cId)
    }
    if (currencyFilter.trim()) list = list.filter(w => w.walletCurrencyCode === currencyFilter.trim())
    if (profileTypeFilter.trim()) list = list.filter(w => w.profileType === profileTypeFilter.trim())
    if (profileTypeGroupFilter !== '') {
      const gId = parseInt(profileTypeGroupFilter, 10)
      if (!Number.isNaN(gId)) list = list.filter(w => w.profileTypeGroupId === gId)
    }
    if (memberIdFilter.trim()) {
      const mId = parseInt(memberIdFilter, 10)
      if (!Number.isNaN(mId)) list = list.filter(w => w.memberId === mId)
    }
    if (memberProfileIdFilter.trim()) {
      const mpId = parseInt(memberProfileIdFilter, 10)
      if (!Number.isNaN(mpId)) list = list.filter(w => w.memberProfileId === mpId)
    }
    if (msisdnFilter.trim()) list = list.filter(w => w.linkedMsisdn.includes(msisdnFilter.trim()))
    if (accountNoFilter.trim()) list = list.filter(w => String(w.walletAccountNo ?? '').includes(accountNoFilter.trim()))
    if (creationDateFrom.trim()) {
      const from = new Date(creationDateFrom).getTime()
      if (!Number.isNaN(from)) list = list.filter(w => w.dateCreated && new Date(w.dateCreated).getTime() >= from)
    }
    if (creationDateTo.trim()) {
      const to = new Date(creationDateTo).getTime()
      if (!Number.isNaN(to)) list = list.filter(w => w.dateCreated && new Date(w.dateCreated).getTime() <= to)
    }
    if (accountBalanceMin.trim()) {
      const min = parseFloat(accountBalanceMin)
      if (!Number.isNaN(min)) list = list.filter(w => w.accountBalance >= min)
    }
    if (accountBalanceMax.trim()) {
      const max = parseFloat(accountBalanceMax)
      if (!Number.isNaN(max)) list = list.filter(w => w.accountBalance <= max)
    }
    if (availableBalanceMin.trim()) {
      const min = parseFloat(availableBalanceMin)
      if (!Number.isNaN(min)) list = list.filter(w => w.availableBalance >= min)
    }
    if (availableBalanceMax.trim()) {
      const max = parseFloat(availableBalanceMax)
      if (!Number.isNaN(max)) list = list.filter(w => w.availableBalance <= max)
    }
    if (ekashRegStatusFilter.trim())
      list = list.filter(w => (w.rndpsRegStatus ?? '').toLowerCase() === ekashRegStatusFilter.trim().toLowerCase())
    return list
  }, [
    wallets,
    search,
    statusFilter,
    countryFilter,
    currencyFilter,
    profileTypeFilter,
    profileTypeGroupFilter,
    memberIdFilter,
    memberProfileIdFilter,
    msisdnFilter,
    accountNoFilter,
    creationDateFrom,
    creationDateTo,
    accountBalanceMin,
    accountBalanceMax,
    availableBalanceMin,
    availableBalanceMax,
    ekashRegStatusFilter,
  ])

  const handleCreated = () => {
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCountryFilter('all')
    setCurrencyFilter('')
    setProfileTypeFilter('')
    setProfileTypeGroupFilter('')
    setMemberIdFilter('')
    setMemberProfileIdFilter('')
    setMsisdnFilter('')
    setAccountNoFilter('')
    setCreationDateFrom('')
    setCreationDateTo('')
    setAccountBalanceMin('')
    setAccountBalanceMax('')
    setAvailableBalanceMin('')
    setAvailableBalanceMax('')
    setEkashRegStatusFilter('')
    setPage(1)
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Wallets"
        subtitle="Search and manage wallet accounts across the platform"
        action={{ label: 'Add Wallet', onClick: () => setDrawerOpen(true), icon: <Plus size={15} /> }}
      />

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by wallet ID, account no, MSISDN, member ID..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm transition-all"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = '#37BBA2' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="w-36">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Country</label>
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
            <option value="all">All</option>
            {countries.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Currency</label>
          <select value={currencyFilter} onChange={e => { setCurrencyFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
            <option value="">All</option>
            {Array.from(new Set(countries.map(c => c.currency))).filter(Boolean).sort().map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors shrink-0" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
          <Filter size={14} />
          {showFilters ? 'Hide filters' : 'Filters'}
        </button>
        <button type="button" onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors shrink-0" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>

      {showFilters && (
        <div className="p-4 rounded-xl border mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" style={{ background: '#FAFBFC', borderColor: '#E5E7EB' }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Profile type</label>
            <select value={profileTypeFilter} onChange={e => { setProfileTypeFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">All</option>
              {profileTypes.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Profile type group</label>
            <select value={profileTypeGroupFilter} onChange={e => { setProfileTypeGroupFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">All</option>
              {profileTypeGroups.map(g => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>eKash reg. status</label>
            <select value={ekashRegStatusFilter} onChange={e => { setEkashRegStatusFilter(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">All</option>
              <option value="not_registered">Not registered</option>
              <option value="registered">Registered</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Member ID</label>
            <input type="text" value={memberIdFilter} onChange={e => setMemberIdFilter(e.target.value)} placeholder="Filter by member ID" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Member profile ID</label>
            <input type="text" value={memberProfileIdFilter} onChange={e => setMemberProfileIdFilter(e.target.value)} placeholder="Filter" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>MSISDN</label>
            <input type="text" value={msisdnFilter} onChange={e => setMsisdnFilter(e.target.value)} placeholder="Filter by phone" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Account no</label>
            <input type="text" value={accountNoFilter} onChange={e => setAccountNoFilter(e.target.value)} placeholder="Filter" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Created from</label>
            <input type="date" value={creationDateFrom} onChange={e => { setCreationDateFrom(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Created to</label>
            <input type="date" value={creationDateTo} onChange={e => { setCreationDateTo(e.target.value); setPage(1) }} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Account balance min</label>
            <input type="number" min={0} step="any" value={accountBalanceMin} onChange={e => setAccountBalanceMin(e.target.value)} placeholder="Min" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Account balance max</label>
            <input type="number" min={0} step="any" value={accountBalanceMax} onChange={e => setAccountBalanceMax(e.target.value)} placeholder="Max" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Available balance min</label>
            <input type="number" min={0} step="any" value={availableBalanceMin} onChange={e => setAvailableBalanceMin(e.target.value)} placeholder="Min" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Available balance max</label>
            <input type="number" min={0} step="any" value={availableBalanceMax} onChange={e => setAvailableBalanceMax(e.target.value)} placeholder="Max" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onBlur={() => setPage(1)} />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>
            {loading ? 'Loading...' : `${filtered.length} wallets found`}
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#6B7280', fontSize: 14 }}>Loading wallets...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Wallet ID', 'Account No', 'Member ID', 'MSISDN', 'Country', 'Currency', 'Balance', 'Profile Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.walletId} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-3"><span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{w.walletId}</span></td>
                    <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{w.walletAccountNo ?? '—'}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{w.memberId}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{w.linkedMsisdn}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{countryIdToName[w.walletCountryId] ?? w.walletCountryId}</span></td>
                    <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{w.walletCurrencyCode}</span></td>
                    <td className="px-4 py-3"><span className="font-semibold" style={{ color: '#04304B', fontSize: 12 }}>{formatBalance(w.availableBalance, w.walletCurrencyCode)}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{w.profileType}</span></td>
                    <td className="px-4 py-3"><Components.StatusBadge status={w.walletStatus} size="sm" /></td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/wallets/${w.walletId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background: '#E8F8F5', color: '#037F67' }}
                      >
                        <Eye size={12} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-sm font-medium cursor-pointer" style={{ background: p === page ? '#37BBA2' : '#F9FAFB', color: p === page ? 'white' : '#6B7280', fontSize: 13 }}>{p}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <WalletDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        countries={countries}
        kycTiers={kycTiers}
        profileTypes={profileTypes}
        onCreated={handleCreated}
      />
    </div>
  )
}
