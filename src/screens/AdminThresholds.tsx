'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import type { Threshold } from '@/services/thresholdsService'
import { listThresholds, createThreshold, updateThreshold, removeThreshold } from '@/services/thresholdsService'
import { listCountries } from '@/services/countriesService'
import { listKycTiers } from '@/services/kycTiersService'
import { listProfileTypeGroups, getProfileTypeGroupById } from '@/services/profileTypeGroupsService'

const emptyForm: Omit<Threshold, 'id'> = { groupName: '', kycTier: '', country: '', currency: '', minAmount: '', maxAmount: '', status: 'active' }

interface ThresholdDrawerProps {
  open: boolean
  onClose: () => void
  threshold: Threshold | null
  countryOptions: string[]
  kycOptions: string[]
  groupOptions: string[]
  defaultGroupName?: string
  onSave: (data: Threshold | Omit<Threshold, 'id'>) => void
}

function ThresholdDrawer({ open, onClose, threshold, countryOptions, kycOptions, groupOptions, defaultGroupName, onSave }: ThresholdDrawerProps) {
  const [form, setForm] = useState<Omit<Threshold, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(threshold ? { ...threshold } : { ...emptyForm, groupName: defaultGroupName ?? emptyForm.groupName })
  }, [open, threshold, defaultGroupName])

  if (!open) return null
  const handleSave = () => {
    if (threshold?.id) {
      const { id, ...rest } = form as Threshold
      onSave({ ...threshold, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<Threshold, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {threshold ? 'Edit Threshold' : 'Add Threshold'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
            <select
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select</option>
              {countryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency</label>
            <input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              placeholder="e.g. KES"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm font-mono"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>KYC Tier</label>
            <select
              value={form.kycTier}
              onChange={e => setForm(f => ({ ...f, kycTier: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select</option>
              {kycOptions.map(k => (<option key={k} value={k}>{k}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Group</label>
            <select
              value={form.groupName}
              onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select</option>
              {groupOptions.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Min Amount</label>
            <input
              value={form.minAmount}
              onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Max Amount</label>
            <input
              value={form.maxAmount}
              onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))}
              placeholder="500000"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {threshold ? 'Save Changes' : 'Add Threshold'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminThresholds({ country, embedded, groupId }: { country?: string; embedded?: boolean; groupId?: number }) {
  const [thresholds, setThresholds] = useState<Threshold[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [kycOptions, setKycOptions] = useState<string[]>([])
  const [groupOptions, setGroupOptions] = useState<string[]>([])
  const [fixedGroupName, setFixedGroupName] = useState<string | null>(null)
  const [groupFilter, setGroupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editThreshold, setEditThreshold] = useState<Threshold | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (groupId != null) {
      getProfileTypeGroupById(groupId).then(g => setFixedGroupName(g?.name ?? null))
    } else {
      setFixedGroupName(null)
    }
  }, [groupId])

  const effectiveGroup = fixedGroupName ?? (groupFilter === 'all' ? undefined : groupFilter)
  const loadThresholds = () =>
    listThresholds({
      country,
      group: effectiveGroup,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }).then(setThresholds)
  useEffect(() => { loadThresholds() }, [country, effectiveGroup, statusFilter])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => c.name))) }, [])
  useEffect(() => { listKycTiers().then(ts => setKycOptions([...new Set(ts.map(t => t.name))])) }, [])
  useEffect(() => { listProfileTypeGroups().then(gs => setGroupOptions(gs.map(g => g.name))) }, [])

  const handleSave = async (data: Threshold | Omit<Threshold, 'id'>) => {
    if ('id' in data && data.id) {
      await updateThreshold(data.id, data)
    } else {
      await createThreshold(data as Omit<Threshold, 'id'>)
    }
    loadThresholds()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeThreshold(deleteId)
      loadThresholds()
      setDeleteId(null)
    }
  }

  const filtered = thresholds.filter(t => !country || t.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Threshold Settings"
          subtitle="Configure transaction limits by country, currency, KYC tier and profile group"
          action={{ label: 'Add Threshold', onClick: () => { setEditThreshold(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            Thresholds{fixedGroupName ? ` · ${fixedGroupName}` : ''}
          </h2>
          <button onClick={() => { setEditThreshold(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}>
            <Plus size={15} /> Add Threshold
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        {!fixedGroupName && (
        <select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
        >
          <option value="all">All Groups</option>
          {groupOptions.map(g => (<option key={g} value={g}>{g}</option>))}
        </select>
        )}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} thresholds</span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Country', 'Currency', 'KYC Tier', 'Profile Group', 'Min', 'Max', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.country}</span></td>
                <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currency}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.kycTier}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.groupName}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.minAmount}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.maxAmount}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditThreshold(r); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ThresholdDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} threshold={editThreshold} countryOptions={countryOptions} kycOptions={kycOptions} groupOptions={groupOptions} defaultGroupName={fixedGroupName ?? undefined} onSave={handleSave} />
      <Components.ConfirmModal open={deleteId != null} title="Delete Threshold?" message={<>Are you sure you want to delete this threshold?</>} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )

  if (embedded) return content
  return content
}
