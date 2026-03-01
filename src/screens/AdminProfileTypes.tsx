'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react'
import type { ProfileType } from '@/services/profileTypesService'
import { listProfileTypes, createProfileType, updateProfileType, removeProfileType } from '@/services/profileTypesService'
import { listCountries } from '@/services/countriesService'

const emptyForm: Omit<ProfileType, 'id'> = { country: '', name: '', code: '', description: '', status: 'active' }

interface ProfileTypeDrawerProps {
  open: boolean
  onClose: () => void
  profileType: ProfileType | null
  countryOptions: string[]
  onSave: (data: ProfileType | Omit<ProfileType, 'id'>) => void
}

function ProfileTypeDrawer({ open, onClose, profileType, countryOptions, onSave }: ProfileTypeDrawerProps) {
  const [form, setForm] = useState<Omit<ProfileType, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(profileType ? { ...profileType } : { ...emptyForm })
  }, [open, profileType])

  if (!open) return null
  const handleSave = () => {
    if (profileType?.id) {
      const { id, ...rest } = form as ProfileType
      onSave({ ...profileType, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<ProfileType, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {profileType ? 'Edit Profile Type' : 'Add Profile Type'}
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
              <option value="">Select country</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Personal, Merchant"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Code</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="e.g. PERSONAL, MERCHANT"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
              rows={2}
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
            {profileType ? 'Save Changes' : 'Add Profile Type'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileTypes({ country, embedded }: { country?: string; embedded?: boolean }) {
  const { countryId } = useParams<{ countryId?: string }>()
  const [types, setTypes] = useState<ProfileType[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editType, setEditType] = useState<ProfileType | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const profileTypeGroupsPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : null

  const loadTypes = () => listProfileTypes({ country, status: undefined }).then(setTypes)
  useEffect(() => { loadTypes() }, [country])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => c.name))) }, [])

  const handleSave = async (data: ProfileType | Omit<ProfileType, 'id'>) => {
    if ('id' in data && data.id) {
      await updateProfileType(data.id, data)
    } else {
      await createProfileType(data as Omit<ProfileType, 'id'>)
    }
    loadTypes()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeProfileType(deleteId)
      loadTypes()
      setDeleteId(null)
    }
  }

  const filtered = types.filter(t => !country || t.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Profile Types"
          subtitle="Define core wallet profile types for customers, agents, and businesses"
          action={{ label: 'Add Profile Type', onClick: () => { setEditType(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}
      {embedded && profileTypeGroupsPath && (
        <div className="mb-4">
          <Link
            to={profileTypeGroupsPath}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer"
            style={{ background: '#E8F8F5', color: '#037F67', fontSize: 14 }}
          >
            <Users size={16} />
            Manage Profile Type Groups
          </Link>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Profile Type', 'Code', 'Description', 'Status', 'Actions'].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3"
                  style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#F3F4F6' }}
              >
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                    {p.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{p.description}</span>
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={p.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditType(p); setDrawerOpen(true) }}
                      className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                      style={{ color: '#37BBA2' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                      style={{ color: '#F44336' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProfileTypeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} profileType={editType} countryOptions={countryOptions} onSave={handleSave} />
      <Components.ConfirmModal
        open={deleteId != null}
        title="Delete Profile Type?"
        message={<>Are you sure you want to delete this profile type? This action cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )

  if (embedded) return content
  return content
}
