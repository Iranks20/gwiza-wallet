'use client'
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import Components from '../components'
import { Plus, Edit2, X, Power, PowerOff } from 'lucide-react'
import type { ProfileThresholdSetting } from '@/services/thresholdsService'
import { listThresholds, createThreshold, updateThreshold } from '@/services/thresholdsService'
import { listCountries } from '@/services/countriesService'
import { listKycTiers } from '@/services/kycTiersService'
import { listCurrencies } from '@/services/currenciesService'
import { getProfileTypeGroupById } from '@/services/profileTypeGroupsService'
import { ApiError } from '@/api/client'

function defaultThreshold(profileTypeGroupId: number, countryId: number, firstCurrencyCode?: string): Omit<ProfileThresholdSetting, 'id'> {
  const now = new Date().toISOString().slice(0, 10)
  return {
    profileTypeGroupId,
    kycTierId: 1,
    countryId,
    currencyCode: firstCurrencyCode ?? 'USD',
    effectiveFrom: now,
    effectiveTo: undefined,
    allowNegativeBalance: false,
    interestBearing: false,
    dailyTxnCountCap: 1,
    singleTxnMinValue: 1,
    singleTxnMaxValue: 1,
    dailyTxnValueCap: 1,
    monthlyTxnValueCap: 1,
    maxReceiveValue: 1,
    minSendValue: 1,
    maxSendValue: 1,
    minWalletBalance: 0,
    maxWalletBalance: 1,
    status: 'active',
  }
}

export type ThresholdFieldErrors = Partial<Record<keyof Omit<ProfileThresholdSetting, 'id'>, string>>

interface DrawerProps {
  open: boolean
  onClose: () => void
  threshold: ProfileThresholdSetting | null
  profileTypeGroupId: number
  countryId: number
  kycTierOptions: { id: number; name: string }[]
  currencyOptions: { code: string; name?: string }[]
  onSave: (data: Omit<ProfileThresholdSetting, 'id'>) => Promise<{ success: boolean; fieldErrors?: ThresholdFieldErrors }>
}

const fieldErrStyle = { color: '#B91C1C', fontSize: 12, marginTop: 4 }
const hintStyle = { color: '#6B7280', fontSize: 12, marginTop: 4 }

function ThresholdDrawer({ open, onClose, threshold, profileTypeGroupId, countryId, kycTierOptions, currencyOptions, onSave }: DrawerProps) {
  const firstCurrency = currencyOptions[0]?.code
  const [form, setForm] = useState<Omit<ProfileThresholdSetting, 'id'>>(defaultThreshold(profileTypeGroupId, countryId, firstCurrency))
  const [fieldErrors, setFieldErrors] = useState<ThresholdFieldErrors>({})
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (open) {
      setFieldErrors({})
      if (threshold) setForm({
        profileTypeGroupId: threshold.profileTypeGroupId,
        kycTierId: threshold.kycTierId,
        countryId: threshold.countryId,
        currencyCode: threshold.currencyCode,
        effectiveFrom: threshold.effectiveFrom,
        effectiveTo: threshold.effectiveTo,
        allowNegativeBalance: threshold.allowNegativeBalance,
        interestBearing: threshold.interestBearing,
        dailyTxnCountCap: threshold.dailyTxnCountCap < 1 ? 1 : threshold.dailyTxnCountCap,
        singleTxnMinValue: threshold.singleTxnMinValue < 1 ? 1 : threshold.singleTxnMinValue,
        singleTxnMaxValue: threshold.singleTxnMaxValue < 1 ? 1 : threshold.singleTxnMaxValue,
        dailyTxnValueCap: threshold.dailyTxnValueCap < 1 ? 1 : threshold.dailyTxnValueCap,
        monthlyTxnValueCap: threshold.monthlyTxnValueCap < 1 ? 1 : threshold.monthlyTxnValueCap,
        maxReceiveValue: threshold.maxReceiveValue < 1 ? 1 : threshold.maxReceiveValue,
        minSendValue: threshold.minSendValue < 1 ? 1 : threshold.minSendValue,
        maxSendValue: threshold.maxSendValue < 1 ? 1 : threshold.maxSendValue,
        minWalletBalance: threshold.minWalletBalance,
        maxWalletBalance: Math.max(threshold.maxWalletBalance, threshold.maxReceiveValue < 1 ? 1 : threshold.maxReceiveValue),
        status: threshold.status,
      })
      else setForm(defaultThreshold(profileTypeGroupId, countryId, currencyOptions[0]?.code))
    }
  }, [open, threshold, profileTypeGroupId, countryId, currencyOptions])

  if (!open) return null
  const handleSave = async () => {
    setFieldErrors({})
    setSaving(true)
    try {
      const result = await onSave(form)
      if (result.success) onClose()
      else if (result.fieldErrors) setFieldErrors(result.fieldErrors)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[28rem] bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{threshold ? 'Edit Threshold' : 'Add Threshold'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>KYC Tier</label>
            <select value={form.kycTierId} onChange={e => setForm(f => ({ ...f, kycTierId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: fieldErrors.kycTierId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {kycTierOptions.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
            </select>
            {fieldErrors.kycTierId && <p style={fieldErrStyle}>{fieldErrors.kycTierId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency</label>
            <select value={form.currencyCode} onChange={e => setForm(f => ({ ...f, currencyCode: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: fieldErrors.currencyCode ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {currencyOptions.map(c => (<option key={c.code} value={c.code}>{c.code}{c.name ? ` – ${c.name}` : ''}</option>))}
            </select>
            {fieldErrors.currencyCode && <p style={fieldErrStyle}>{fieldErrors.currencyCode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Effective from</label>
            <input type="date" value={form.effectiveFrom.slice(0, 10)} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value || new Date().toISOString().slice(0, 10) }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Single txn min</label>
              <input type="number" min={1} value={form.singleTxnMinValue} onChange={e => setForm(f => ({ ...f, singleTxnMinValue: Math.max(1, Number(e.target.value) || 1) }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.singleTxnMinValue ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.singleTxnMinValue && <p style={fieldErrStyle}>{fieldErrors.singleTxnMinValue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Single txn max</label>
              <input type="number" min={1} value={form.singleTxnMaxValue} onChange={e => setForm(f => ({ ...f, singleTxnMaxValue: Math.max(1, Number(e.target.value) || 1) }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.singleTxnMaxValue ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.singleTxnMaxValue && <p style={fieldErrStyle}>{fieldErrors.singleTxnMaxValue}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Daily txn count cap</label>
            <input type="number" min={1} value={form.dailyTxnCountCap} onChange={e => setForm(f => ({ ...f, dailyTxnCountCap: Number(e.target.value) || 1 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.dailyTxnCountCap ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
            {fieldErrors.dailyTxnCountCap && <p style={fieldErrStyle}>{fieldErrors.dailyTxnCountCap}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Daily value cap</label>
              <input type="number" min={1} value={form.dailyTxnValueCap} onChange={e => setForm(f => ({ ...f, dailyTxnValueCap: Math.max(1, Number(e.target.value) || 1) }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.dailyTxnValueCap ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.dailyTxnValueCap && <p style={fieldErrStyle}>{fieldErrors.dailyTxnValueCap}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Monthly value cap</label>
              <input type="number" min={1} value={form.monthlyTxnValueCap} onChange={e => setForm(f => ({ ...f, monthlyTxnValueCap: Math.max(1, Number(e.target.value) || 1) }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.monthlyTxnValueCap ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.monthlyTxnValueCap && <p style={fieldErrStyle}>{fieldErrors.monthlyTxnValueCap}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Max receive value</label>
            <input type="number" min={0} value={form.maxReceiveValue} onChange={e => setForm(f => ({ ...f, maxReceiveValue: Number(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.maxReceiveValue ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
            <p style={hintStyle}>Available max wallet balance: {form.maxWalletBalance}</p>
            {fieldErrors.maxReceiveValue && <p style={fieldErrStyle}>{fieldErrors.maxReceiveValue}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Max wallet balance</label>
            <input type="number" min={0} value={form.maxWalletBalance} onChange={e => setForm(f => ({ ...f, maxWalletBalance: Number(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.maxWalletBalance ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
            {fieldErrors.maxWalletBalance && <p style={fieldErrStyle}>{fieldErrors.maxWalletBalance}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Min send value</label>
              <input type="number" min={0} value={form.minSendValue} onChange={e => setForm(f => ({ ...f, minSendValue: Number(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.minSendValue ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.minSendValue && <p style={fieldErrStyle}>{fieldErrors.minSendValue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Max send value</label>
              <input type="number" min={0} value={form.maxSendValue} onChange={e => setForm(f => ({ ...f, maxSendValue: Number(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: fieldErrors.maxSendValue ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }} />
              {fieldErrors.maxSendValue && <p style={fieldErrStyle}>{fieldErrors.maxSendValue}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-50" style={{ background: '#37BBA2', fontSize: 14 }}>{saving ? 'Saving…' : (threshold ? 'Save' : 'Add Threshold')}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminThresholds({ embedded, countryId: countryIdProp, groupId: groupIdProp }: { country?: string; embedded?: boolean; countryId?: number; groupId?: number }) {
  const params = useParams<{ countryId?: string; groupId?: string }>()
  const countryId = countryIdProp ?? (params.countryId ? parseInt(params.countryId, 10) : 0)
  const groupId = groupIdProp ?? (params.groupId !== undefined && params.groupId !== '' ? parseInt(params.groupId, 10) : NaN)
  const hasValidGroup = typeof groupId === 'number' && !Number.isNaN(groupId) && groupId >= 0
  const [thresholds, setThresholds] = useState<ProfileThresholdSetting[]>([])
  const [groupName, setGroupName] = useState<string | null>(null)
  const [kycTierOptions, setKycTierOptions] = useState<{ id: number; name: string }[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<{ code: string; name?: string }[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editThreshold, setEditThreshold] = useState<ProfileThresholdSetting | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const profileTypeGroupsListPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : ''

  useEffect(() => {
    if (hasValidGroup) getProfileTypeGroupById(groupId).then(g => setGroupName(g?.name ?? null))
    else setGroupName(null)
  }, [groupId, hasValidGroup])

  const load = () => {
    setError(null)
    if (!hasValidGroup) return setThresholds([])
    setLoading(true)
    listThresholds({ profileTypeGroupId: groupId, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(setThresholds)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load thresholds') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [groupId, statusFilter])
  useEffect(() => { listKycTiers().then(ts => setKycTierOptions(ts.map(t => ({ id: t.id, name: t.name })))) }, [])
  useEffect(() => { listCurrencies().then(cs => setCurrencyOptions(cs.map(c => ({ code: c.code, name: c.name })))) }, [])

  const handleSave = async (data: Omit<ProfileThresholdSetting, 'id'>): Promise<{ success: boolean; fieldErrors?: ThresholdFieldErrors }> => {
    setError(null)
    const fieldErrors: ThresholdFieldErrors = {}
    if (data.singleTxnMinValue < 1) fieldErrors.singleTxnMinValue = 'Must be at least 1.'
    if (data.singleTxnMaxValue < 1) fieldErrors.singleTxnMaxValue = 'Must be at least 1.'
    if (data.dailyTxnValueCap < 1) fieldErrors.dailyTxnValueCap = 'Must be at least 1.'
    if (data.singleTxnMinValue > data.singleTxnMaxValue) {
      fieldErrors.singleTxnMinValue = fieldErrors.singleTxnMinValue ?? 'Cannot be greater than single txn max.'
      fieldErrors.singleTxnMaxValue = fieldErrors.singleTxnMaxValue ?? 'Must be at least single txn min.'
    }
    if (data.maxReceiveValue > data.maxWalletBalance) {
      fieldErrors.maxReceiveValue = `Cannot exceed max wallet balance (${data.maxWalletBalance}).`
      fieldErrors.maxWalletBalance = 'Must be at least max receive value.'
    }
    if (data.dailyTxnCountCap < 1) {
      fieldErrors.dailyTxnCountCap = 'Must be at least 1.'
    }
    const maxPossibleDaily = data.singleTxnMaxValue * data.dailyTxnCountCap
    if (data.dailyTxnValueCap > maxPossibleDaily) {
      fieldErrors.dailyTxnValueCap = `Cannot exceed ${maxPossibleDaily} (single max × daily count cap).`
    }
    if (data.monthlyTxnValueCap < 1) {
      fieldErrors.monthlyTxnValueCap = 'Must be at least 1.'
    }
    if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors }
    try {
      if (editThreshold?.id) await updateThreshold(editThreshold.id, data)
      else await createThreshold(data)
      load()
      setDrawerOpen(false)
      return { success: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to save'
      setError(msg)
      if (e instanceof ApiError && msg.includes('KYC tier') && msg.includes('not active')) {
        return { success: false, fieldErrors: { kycTierId: 'Selected KYC tier is not active. Choose an active KYC tier.' } }
      }
      if (e instanceof ApiError && (e.status === 409 || e.respCode === 170) && (msg.includes('already exists') || msg.includes('Unique constraint'))) {
        const hint = 'A threshold for this KYC tier and currency already exists. Use a different KYC tier or currency, or edit the existing one.'
        return { success: false, fieldErrors: { kycTierId: hint, currencyCode: hint } }
      }
      if (e instanceof ApiError && msg.includes('maximum wallet balance')) {
        return { success: false, fieldErrors: { maxReceiveValue: msg, maxWalletBalance: `Available max wallet balance: ${data.maxWalletBalance}` } }
      }
      if (e instanceof ApiError && msg.includes('Single transaction minimum')) {
        return { success: false, fieldErrors: { singleTxnMinValue: msg, singleTxnMaxValue: msg } }
      }
      if (e instanceof ApiError && msg.includes('Daily transaction value cap')) {
        return { success: false, fieldErrors: { dailyTxnValueCap: msg } }
      }
      if (e instanceof ApiError && (msg.includes('single_txn_min_value') || msg.includes('single_txn_max_value') || msg.includes('daily_txn_value_cap'))) {
        const hint = 'Must be at least 1.'
        const apiFieldErrors: ThresholdFieldErrors = {}
        if (msg.includes('single_txn_min_value')) apiFieldErrors.singleTxnMinValue = hint
        if (msg.includes('single_txn_max_value')) apiFieldErrors.singleTxnMaxValue = hint
        if (msg.includes('daily_txn_value_cap')) apiFieldErrors.dailyTxnValueCap = hint
        return { success: false, fieldErrors: apiFieldErrors }
      }
      return { success: false }
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateThreshold(deactivateId, { status: 'inactive' })
      load()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateThreshold(activateId, { status: 'active' })
      load()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const kycTierName = (id: number) => kycTierOptions.find(k => k.id === id)?.name ?? String(id)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && profileTypeGroupsListPath && (
        <div className="mb-4">
          <Link to={profileTypeGroupsListPath} className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Back to Profile Type Groups</Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader title="Threshold Settings" subtitle="Configure transaction limits by profile group, KYC tier and currency" action={{ label: 'Add Threshold', onClick: () => { setEditThreshold(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }} />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Thresholds{groupName ? ` · ${groupName}` : ''}</h2>
          <button onClick={() => { setEditThreshold(null); setDrawerOpen(true) }} disabled={!hasValidGroup || countryId < 1} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#37BBA2', fontSize: 14 }}><Plus size={15} /> Add Threshold</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && hasValidGroup && <p className="mb-2 text-sm" style={{ color: '#6B7280' }}>Loading thresholds…</p>}
      {hasValidGroup && countryId >= 1 && (
        <>
          {!loading && (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{thresholds.length} thresholds</span>
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                      {['ID', 'Currency', 'KYC Tier', 'Single min', 'Single max', 'Daily cap', 'Monthly cap', 'Status', 'Date created', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {thresholds.map(r => (
                      <tr key={r.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                        <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.id}</span></td>
                        <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currencyCode}</span></td>
                        <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{kycTierName(r.kycTierId)}</span></td>
                        <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.singleTxnMinValue}</span></td>
                        <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.singleTxnMaxValue}</span></td>
                        <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.dailyTxnValueCap}</span></td>
                        <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.monthlyTxnValueCap}</span></td>
                        <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                        <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.dateCreated ? new Date(r.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditThreshold(r); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                            {r.status === 'active' ? (
                              <button onClick={() => setDeactivateId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }} title="Deactivate"><PowerOff size={14} /></button>
                            ) : (
                              <button onClick={() => setActivateId(r.id)} className="p-1.5 rounded-lg hover:bg-green-50 cursor-pointer" style={{ color: '#4CAF50' }} title="Activate"><Power size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <ThresholdDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} threshold={editThreshold} profileTypeGroupId={hasValidGroup ? groupId : 0} countryId={countryId} kycTierOptions={kycTierOptions} currencyOptions={currencyOptions} onSave={handleSave} />
          <Components.ConfirmModal open={deactivateId != null} title="Deactivate threshold?" message={<>Deactivate this threshold setting?</>} confirmLabel="Deactivate" onConfirm={handleDeactivate} onCancel={() => setDeactivateId(null)} />
          <Components.ConfirmModal open={activateId != null} title="Activate threshold?" message={<>Activate this threshold setting?</>} confirmLabel="Activate" onConfirm={handleActivate} onCancel={() => setActivateId(null)} />
        </>
      )}
      {!hasValidGroup && embedded && <p className="text-sm" style={{ color: '#6B7280' }}>Select a group to manage thresholds.</p>}
    </div>
  )
  return content
}
