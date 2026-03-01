'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Edit2, Trash2, Settings2, X } from 'lucide-react'
import type { ProfileTypeGroup } from '@/services/profileTypeGroupsService'
import { listProfileTypeGroups, createProfileTypeGroup, updateProfileTypeGroup, removeProfileTypeGroup } from '@/services/profileTypeGroupsService'
import { listCountries } from '@/services/countriesService'
import { listProfileTypes } from '@/services/profileTypesService'

const emptyForm: Omit<ProfileTypeGroup, 'id'> = { name: '', country: '', profileType: '', isDefault: false, status: 'active' }

interface GroupDrawerProps {
  open: boolean
  onClose: () => void
  group: ProfileTypeGroup | null
  countryOptions: string[]
  profileTypeOptions: string[]
  onSave: (data: ProfileTypeGroup | Omit<ProfileTypeGroup, 'id'>) => void
}

function GroupDrawer({ open, onClose, group, countryOptions, profileTypeOptions, onSave }: GroupDrawerProps) {
  const [form, setForm] = useState<Omit<ProfileTypeGroup, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(group ? { ...group } : { ...emptyForm })
  }, [open, group])

  if (!open) return null
  const handleSave = () => {
    if (group?.id) {
      const { id, ...rest } = form as ProfileTypeGroup
      onSave({ ...group, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<ProfileTypeGroup, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {group ? 'Edit Profile Type Group' : 'Add Profile Type Group'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Group Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Retail - Default"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Type</label>
            <select
              value={form.profileType}
              onChange={e => setForm(f => ({ ...f, profileType: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select profile type</option>
              {profileTypeOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="rounded border cursor-pointer"
              style={{ borderColor: '#E5E7EB' }}
            />
            <label htmlFor="isDefault" className="text-sm cursor-pointer" style={{ color: '#04304B', fontSize: 13 }}>Default group</label>
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
            {group ? 'Save Changes' : 'Add Group'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProfileGroups({ country, embedded }: { country?: string; embedded?: boolean }) {
  const { countryId } = useParams<{ countryId?: string }>()
  const [groups, setGroups] = useState<ProfileTypeGroup[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [profileTypeOptions, setProfileTypeOptions] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<ProfileTypeGroup | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const configureBase = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : ''
  const profileTypesPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types` : null

  const loadGroups = () => listProfileTypeGroups({ country, status: undefined }).then(setGroups)
  useEffect(() => { loadGroups() }, [country])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => c.name))) }, [])
  useEffect(() => { listProfileTypes().then(pts => setProfileTypeOptions(pts.map(p => p.name))) }, [])

  const handleSave = async (data: ProfileTypeGroup | Omit<ProfileTypeGroup, 'id'>) => {
    if ('id' in data && data.id) {
      await updateProfileTypeGroup(data.id, data)
    } else {
      await createProfileTypeGroup(data as Omit<ProfileTypeGroup, 'id'>)
    }
    loadGroups()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeProfileTypeGroup(deleteId)
      loadGroups()
      setDeleteId(null)
    }
  }

  const filtered = groups.filter(g => !country || g.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && profileTypesPath && (
        <div className="mb-4">
          <Link to={profileTypesPath} className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Back to Profile Types</Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader
          title="Profile Type Groups"
          subtitle="Group profile types by country and use them in rules, fees, and limits"
          action={{ label: 'Add Group', onClick: () => { setEditGroup(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Profile Type Groups</h2>
          <button onClick={() => { setEditGroup(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}>
            <Plus size={15} /> Add Group
          </button>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Group Name', 'Country', 'Profile Type', 'Default', 'Status', 'Actions'].map(h => (
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
            {filtered.map(g => (
              <tr
                key={g.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#F3F4F6' }}
              >
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{g.country}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{g.profileType}</span>
                </td>
                <td className="px-4 py-3">
                  {g.isDefault && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>
                      Default
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={g.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {configureBase && (
                      <Link
                        to={`${configureBase}/${g.id}/permissions`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background: '#E8F8F5', color: '#037F67' }}
                      >
                        <Settings2 size={12} />
                        Configure
                      </Link>
                    )}
                    <button
                      onClick={() => { setEditGroup(g); setDrawerOpen(true) }}
                      className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                      style={{ color: '#37BBA2' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(g.id)}
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

      <GroupDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} group={editGroup} countryOptions={countryOptions} profileTypeOptions={profileTypeOptions} onSave={handleSave} />
      <Components.ConfirmModal
        open={deleteId != null}
        title="Delete Profile Type Group?"
        message={<>Are you sure you want to delete this group? This action cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )

  if (embedded) return content
  return content
}
