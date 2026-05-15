'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Edit2, Settings2, X, Power, PowerOff, Loader2 } from 'lucide-react'
import type { ProfileTypeGroup } from '@/services/profileTypeGroupsService'
import { listProfileTypeGroups, createProfileTypeGroup, updateProfileTypeGroup } from '@/services/profileTypeGroupsService'
import { listCountries } from '@/services/countriesService'
import { listProfileTypes } from '@/services/profileTypesService'
import { listKycTiers } from '@/services/kycTiersService'
import { listCurrencies } from '@/services/currenciesService'
import { ApiError } from '@/api/client'
import { Table } from '@/components/ui/table'

type ProfileTypeOption = { id: number; name: string }
type KycTierOption = { id: number; name: string }
type CountryOption = { id: number; name: string }
type CurrencyOption = { code: string; name: string }

const emptyForm: { name: string; profileTypeId: number; kycTierId: number; countryId: number; currency: string; isDefault: boolean; status: string } = { name: '', profileTypeId: 0, kycTierId: 0, countryId: 0, currency: '', isDefault: false, status: 'active' }

interface GroupDrawerProps {
  open: boolean
  onClose: () => void
  group: ProfileTypeGroup | null
  countryId: number
  countryOptions: CountryOption[]
  profileTypeOptions: ProfileTypeOption[]
  kycTierOptions: KycTierOption[]
  currencyOptions: CurrencyOption[]
  onSave: (data: Omit<ProfileTypeGroup, 'id'> | ProfileTypeGroup) => void
}

function GroupDrawer({ open, onClose, group, countryId, countryOptions, profileTypeOptions, kycTierOptions, currencyOptions, onSave }: GroupDrawerProps) {
  const [form, setForm] = useState({ ...emptyForm, countryId })
  useEffect(() => {
    if (open) {
      if (group) setForm({ name: group.name, profileTypeId: group.profileTypeId, kycTierId: group.kycTierId, countryId: group.countryId, currency: group.currency, isDefault: group.isDefault, status: group.status })
      else setForm({ ...emptyForm, countryId: countryId || 0 })
    }
  }, [open, group, countryId])

  if (!open) return null
  const handleSave = () => {
    if (group?.id) onSave({ ...group, ...form })
    else onSave(form as Omit<ProfileTypeGroup, 'id'>)
    onClose()
  }
  const showCountrySelect = countryId === 0
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{group ? 'Edit Profile Type Group' : 'Add Profile Type Group'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Group Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Retail - Default" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          {showCountrySelect && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
              <select value={form.countryId || ''} onChange={e => setForm(f => ({ ...f, countryId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                <option value="">Select country</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Type</label>
            <select value={form.profileTypeId || ''} onChange={e => setForm(f => ({ ...f, profileTypeId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select profile type</option>
              {profileTypeOptions.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>KYC Tier</label>
            <select value={form.kycTierId || ''} onChange={e => setForm(f => ({ ...f, kycTierId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select KYC tier</option>
              {kycTierOptions.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select currency</option>
              {currencyOptions.map(c => (<option key={c.code} value={c.code}>{c.code} – {c.name}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded border cursor-pointer" style={{ borderColor: '#E5E7EB' }} />
            <label htmlFor="isDefault" className="text-sm cursor-pointer" style={{ color: '#04304B', fontSize: 13 }}>Default group</label>
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
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90" style={{ background: '#37BBA2', fontSize: 14 }}>{group ? 'Save Changes' : 'Add Group'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileGroups({ country, countryId: countryIdProp, embedded }: { country?: string; countryId?: number; embedded?: boolean }) {
  const { countryId: countryIdParam } = useParams<{ countryId?: string }>()
  const countryId = countryIdProp ?? (countryIdParam ? parseInt(countryIdParam, 10) : 0)
  const [groups, setGroups] = useState<ProfileTypeGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [profileTypeOptions, setProfileTypeOptions] = useState<ProfileTypeOption[]>([])
  const [kycTierOptions, setKycTierOptions] = useState<KycTierOption[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<ProfileTypeGroup | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const configureBase = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : ''
  const profileTypesPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types` : null

  const loadGroups = () => {
    setError(null)
    setLoading(true)
    const id = countryId > 0 ? countryId : undefined
    listProfileTypeGroups({ countryId: id })
      .then(setGroups)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load groups') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadGroups() }, [countryId])
  useEffect(() => { listProfileTypes().then(pts => setProfileTypeOptions(pts.map(p => ({ id: p.id, name: p.name })))) }, [])
  useEffect(() => { listKycTiers().then(tiers => setKycTierOptions(tiers.map(t => ({ id: t.id, name: t.name })))) }, [])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => ({ id: c.id, name: c.name })))) }, [])
  useEffect(() => { listCurrencies().then(cs => setCurrencyOptions(cs)) }, [])

  const handleSave = async (data: Omit<ProfileTypeGroup, 'id'> | ProfileTypeGroup) => {
    setError(null)
    try {
      if ('id' in data && data.id) await updateProfileTypeGroup(data.id, data)
      else await createProfileTypeGroup(data as Omit<ProfileTypeGroup, 'id'>)
      loadGroups()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateProfileTypeGroup(deactivateId, { status: 'inactive' })
      loadGroups()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateProfileTypeGroup(activateId, { status: 'active' })
      loadGroups()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const countryName = (id: number) => countryOptions.find(c => c.id === id)?.name ?? String(id)
  const profileTypeName = (id: number) => profileTypeOptions.find(p => p.id === id)?.name ?? String(id)
  const kycTierName = (id: number) => kycTierOptions.find(k => k.id === id)?.name ?? String(id)

  const content = (
    <div>
      {embedded && profileTypesPath && (
        <div className="mb-4">
          <Link to={profileTypesPath} className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Back to Profile Types</Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader title="Profile Type Groups" subtitle="Group profile types by country and use them in rules, fees, and limits" action={{ label: 'Add Group', onClick: () => { setEditGroup(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }} />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Profile Type Groups</h2>
          <button onClick={() => { setEditGroup(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}><Plus size={15} /> Add Group</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && (
        <div className="mb-2 inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
          <Loader2 size={16} className="animate-spin" />
          <span>Loading profile type groups...</span>
        </div>
      )}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Group Name', 'Country', 'Profile Type', 'KYC Tier', 'Currency', 'Default', 'Status', 'Date created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && groups.map(g => (
              <tr key={g.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{g.name}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{countryName(g.countryId)}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{profileTypeName(g.profileTypeId)}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{kycTierName(g.kycTierId)}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{g.currency}</span></td>
                <td className="px-4 py-3">{g.isDefault && <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>Default</span>}</td>
                <td className="px-4 py-3"><Components.StatusBadge status={g.status} size="sm" /></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{g.dateCreated ? new Date(g.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {configureBase && (
                      <Link to={`${configureBase}/${g.id}/permissions`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ background: '#E8F8F5', color: '#037F67' }}><Settings2 size={12} /> Configure</Link>
                    )}
                    <button onClick={() => { setEditGroup(g); setDrawerOpen(true) }} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="Edit profile type group" aria-label="Edit profile type group"><Edit2 size={14} /></button>
                    {g.status === 'active' ? (
                      <button onClick={() => setDeactivateId(g.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }} title="Deactivate profile type group" aria-label="Deactivate profile type group"><PowerOff size={14} /></button>
                    ) : (
                      <button onClick={() => setActivateId(g.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-green-50 cursor-pointer" style={{ color: '#4CAF50' }} title="Activate profile type group" aria-label="Activate profile type group"><Power size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <GroupDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} group={editGroup} countryId={countryId} countryOptions={countryOptions} profileTypeOptions={profileTypeOptions} kycTierOptions={kycTierOptions} currencyOptions={currencyOptions} onSave={handleSave} />
      <Components.ConfirmModal open={deactivateId != null} title="Deactivate Profile Type Group?" message={<>Are you sure you want to deactivate this group?</>} onConfirm={handleDeactivate} onCancel={() => setDeactivateId(null)} />
      <Components.ConfirmModal open={activateId != null} title="Activate Profile Type Group?" message={<>Are you sure you want to activate this group?</>} onConfirm={handleActivate} onCancel={() => setActivateId(null)} />
    </div>
  )
  return content
}
