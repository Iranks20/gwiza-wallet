'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, X, Power, PowerOff } from 'lucide-react'
import type { KycTier } from '@/services/kycTiersService'
import { listKycTiers, createKycTier, updateKycTier } from '@/services/kycTiersService'
import { ApiError } from '@/api/client'

const emptyForm: Omit<KycTier, 'id'> = { name: '', description: '', status: 'active' }

interface KycTierDrawerProps {
  open: boolean
  onClose: () => void
  tier: KycTier | null
  onSave: (data: KycTier | Omit<KycTier, 'id'>) => void
}

function KycTierDrawer({ open, onClose, tier, onSave }: KycTierDrawerProps) {
  const [form, setForm] = useState<Omit<KycTier, 'id'> & { id?: number }>({ ...emptyForm })
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (open) {
      setForm(tier ? { ...tier } : { ...emptyForm })
      setError(null)
    }
  }, [open, tier])

  if (!open) return null
  const handleSave = () => {
    setError(null)
    if (tier?.id) {
      onSave({ ...tier, ...form })
    } else {
      onSave(form as Omit<KycTier, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {tier ? 'Edit KYC Tier' : 'Add KYC Tier'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {error && <p className="text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Tier Name (min 5 characters)</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Basic, Gold"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Description (min 5 characters)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm resize-none"
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
            {tier ? 'Save Changes' : 'Add Tier'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminKYCTiers({ embedded }: { country?: string; embedded?: boolean }) {
  const [tiers, setTiers] = useState<KycTier[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTier, setEditTier] = useState<KycTier | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTiers = () => {
    setError(null)
    listKycTiers({ status: statusFilter === 'all' ? undefined : statusFilter }).then(setTiers).catch(e => {
      setError(e instanceof ApiError ? e.message : 'Failed to load tiers')
    })
  }
  useEffect(() => { loadTiers() }, [statusFilter])

  const handleSave = async (data: KycTier | Omit<KycTier, 'id'>) => {
    setError(null)
    try {
      if ('id' in data && data.id) {
        await updateKycTier(data.id, { name: data.name, description: data.description, status: data.status })
      } else {
        await createKycTier({ name: data.name, description: data.description, status: data.status })
      }
      loadTiers()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateKycTier(deactivateId, { status: 'inactive' })
      loadTiers()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateKycTier(activateId, { status: 'active' })
      loadTiers()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="KYC Tiers"
          subtitle="Define verification tiers and link them to limits and profiles"
          action={{ label: 'Add Tier', onClick: () => { setEditTier(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}

      <div className="flex items-center gap-3 mb-4">
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
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{tiers.length} tiers</span>
        {error && <span className="text-sm" style={{ color: '#B91C1C' }}>{error}</span>}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Tier Name', 'Description', 'Status', 'Date created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiers.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{t.name}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{t.description}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={t.status} size="sm" /></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{t.dateCreated ? new Date(t.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditTier(t); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                    {t.status === 'active' ? (
                      <button onClick={() => setDeactivateId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }} title="Deactivate"><PowerOff size={14} /></button>
                    ) : (
                      <button onClick={() => setActivateId(t.id)} className="p-1.5 rounded-lg hover:bg-green-50 cursor-pointer" style={{ color: '#4CAF50' }} title="Activate"><Power size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <KycTierDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tier={editTier} onSave={handleSave} />
      <Components.ConfirmModal open={deactivateId != null} title="Deactivate KYC Tier?" message={<>Are you sure you want to deactivate this tier?</>} onConfirm={handleDeactivate} onCancel={() => setDeactivateId(null)} />
      <Components.ConfirmModal open={activateId != null} title="Activate KYC Tier?" message={<>Are you sure you want to activate this tier?</>} onConfirm={handleActivate} onCancel={() => setActivateId(null)} />
    </div>
  )

  return content
}
