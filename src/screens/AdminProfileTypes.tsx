'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Edit2, Users, X, Power, PowerOff, Loader2 } from 'lucide-react'
import type { ProfileType } from '@/services/profileTypesService'
import {
  listProfileTypes,
  createProfileType,
  updateProfileType,
  PROFILE_TYPE_ENUM,
  PROFILE_AUTH_ENUM,
  LOGIN_RESET_ENUM,
  LIMIT_MESSAGE_ENUM,
} from '@/services/profileTypesService'
import { ApiError } from '@/api/client'
import { Table } from '@/components/ui/table'

const emptyForm: Omit<ProfileType, 'id'> = {
  name: '',
  code: 'personal',
  profileAuthType: 'pin',
  loginCounterMaxAllowedNo: 0,
  loginCounterResetFreq: 'daily',
  limitMessage: 'none',
  status: 'active',
}

interface ProfileTypeDrawerProps {
  open: boolean
  onClose: () => void
  profileType: ProfileType | null
  onSave: (data: ProfileType | Omit<ProfileType, 'id'>) => void
}

function ProfileTypeDrawer({ open, onClose, profileType, onSave }: ProfileTypeDrawerProps) {
  const [form, setForm] = useState<Omit<ProfileType, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(profileType ? { ...profileType } : { ...emptyForm })
  }, [open, profileType])

  if (!open) return null
  const handleSave = () => {
    if (profileType?.id) onSave({ ...profileType, ...form })
    else onSave(form as Omit<ProfileType, 'id'>)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{profileType ? 'Edit Profile Type' : 'Add Profile Type'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Name (min 5 chars)</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Personal, Merchant" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Type</label>
            <select value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {PROFILE_TYPE_ENUM.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Auth Type</label>
            <select value={form.profileAuthType} onChange={e => setForm(f => ({ ...f, profileAuthType: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {PROFILE_AUTH_ENUM.map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Login counter max</label>
            <input type="number" min={0} value={form.loginCounterMaxAllowedNo} onChange={e => setForm(f => ({ ...f, loginCounterMaxAllowedNo: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Login reset freq</label>
            <select value={form.loginCounterResetFreq} onChange={e => setForm(f => ({ ...f, loginCounterResetFreq: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {LOGIN_RESET_ENUM.map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Limit message</label>
            <select value={form.limitMessage} onChange={e => setForm(f => ({ ...f, limitMessage: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {LIMIT_MESSAGE_ENUM.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
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
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90" style={{ background: '#37BBA2', fontSize: 14 }}>{profileType ? 'Save Changes' : 'Add Profile Type'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileTypes({ embedded }: { country?: string; embedded?: boolean }) {
  const { countryId } = useParams<{ countryId?: string }>()
  const [types, setTypes] = useState<ProfileType[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editType, setEditType] = useState<ProfileType | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const profileTypeGroupsPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : null

  const loadTypes = () => {
    setLoading(true)
    setError(null)
    listProfileTypes().then(setTypes).catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load profile types') }).finally(() => setLoading(false))
  }
  useEffect(() => { loadTypes() }, [])

  const handleSave = async (data: ProfileType | Omit<ProfileType, 'id'>) => {
    setError(null)
    try {
      if ('id' in data && data.id) await updateProfileType(data.id, data)
      else await createProfileType(data as Omit<ProfileType, 'id'>)
      loadTypes()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateProfileType(deactivateId, { status: 'inactive' })
      loadTypes()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateProfileType(activateId, { status: 'active' })
      loadTypes()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const content = (
    <div>
      {!embedded && (
        <Components.AdminPageHeader title="Profile Types" subtitle="Define core wallet profile types for customers, agents, and businesses" action={{ label: 'Add Profile Type', onClick: () => { setEditType(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }} />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          {profileTypeGroupsPath && (
            <Link
              to={profileTypeGroupsPath}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: '#37BBA2', fontSize: 14 }}
            >
              <Users size={16} />
              Manage Profile Type Groups
            </Link>
          )}
          <button
            onClick={() => { setEditType(null); setDrawerOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white cursor-pointer hover:opacity-90"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            <Plus size={15} /> Add Profile Type
          </button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && (
        <div className="mb-2 inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
          <Loader2 size={16} className="animate-spin" />
          <span>Loading profile types...</span>
        </div>
      )}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Code', 'Auth', 'Login cap', 'Reset freq', 'Limit msg', 'Status', 'Date created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading profile types...</span>
                  </div>
                </td>
              </tr>
            ) : types.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{p.name}</span></td>
                <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: '#EFF6FF', color: '#1E40AF' }}>{p.code}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{p.profileAuthType.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{p.loginCounterMaxAllowedNo}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{p.loginCounterResetFreq}</span></td>
                <td className="px-4 py-3"><span style={{ fontSize: 13 }}>{p.limitMessage}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={p.status} size="sm" /></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{p.dateCreated ? new Date(p.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditType(p); setDrawerOpen(true) }} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="Edit profile type" aria-label="Edit profile type"><Edit2 size={14} /></button>
                    {p.status === 'active' ? (
                      <button onClick={() => setDeactivateId(p.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }} title="Deactivate profile type" aria-label="Deactivate profile type"><PowerOff size={14} /></button>
                    ) : (
                      <button onClick={() => setActivateId(p.id)} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-green-50 cursor-pointer" style={{ color: '#4CAF50' }} title="Activate profile type" aria-label="Activate profile type"><Power size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ProfileTypeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} profileType={editType} onSave={handleSave} />
      <Components.ConfirmModal
        open={deactivateId != null}
        title="Deactivate Profile Type?"
        message={<>Are you sure you want to deactivate this profile type?</>}
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateId(null)}
      />
      <Components.ConfirmModal
        open={activateId != null}
        title="Activate Profile Type?"
        message={<>Are you sure you want to activate this profile type?</>}
        confirmLabel="Activate"
        onConfirm={handleActivate}
        onCancel={() => setActivateId(null)}
      />
    </div>
  )
  return content
}
