'use client'
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import Components from '../components'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import type { ProfileTypeGroupPermission } from '@/services/groupPermissionsService'
import { listGroupPermissions, createGroupPermission, updateGroupPermission, removeGroupPermission } from '@/services/groupPermissionsService'
import { listPermissionsCatalog } from '@/services/permissionsCatalogService'
import { ApiError } from '@/api/client'

interface DrawerProps {
  open: boolean
  onClose: () => void
  assignment: ProfileTypeGroupPermission | null
  profileTypeGroupId: number
  scopeOptions: string[]
  onSave: (data: { profileTypeGroupId: number; permissionScope: string; status: string }) => void
}

function PermissionDrawer({ open, onClose, assignment, profileTypeGroupId, scopeOptions, onSave }: DrawerProps) {
  const [scope, setScope] = useState(assignment?.permissionScope ?? '')
  const [status, setStatus] = useState(assignment?.status ?? 'active')
  useEffect(() => {
    if (open) {
      setScope(assignment?.permissionScope ?? '')
      setStatus(assignment?.status ?? 'active')
    }
  }, [open, assignment])

  if (!open) return null
  const handleSave = () => {
    const s = scope.trim()
    if (!s) return
    onSave({ profileTypeGroupId, permissionScope: s, status })
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{assignment ? 'Edit Permission' : 'Add Permission'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Permission scope</label>
            {scopeOptions.length > 0 ? (
              <select value={scope} onChange={e => setScope(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                <option value="">Select scope</option>
                {scopeOptions.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            ) : (
              <input value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. wallet, fees_scope" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90" style={{ background: '#37BBA2', fontSize: 14 }}>{assignment ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminGroupPermissions({ embedded, countryId: countryIdProp, groupId: groupIdProp }: { country?: string; embedded?: boolean; countryId?: number; groupId?: number }) {
  const params = useParams<{ groupId?: string; countryId?: string }>()
  const countryId = countryIdProp ?? (params.countryId ? parseInt(params.countryId, 10) : 0)
  const groupIdNum = groupIdProp ?? (params.groupId !== undefined && params.groupId !== '' ? parseInt(params.groupId, 10) : NaN)
  const hasValidGroup = typeof groupIdNum === 'number' && !Number.isNaN(groupIdNum) && groupIdNum >= 0
  const [assignments, setAssignments] = useState<ProfileTypeGroupPermission[]>([])
  const [scopeOptions, setScopeOptions] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editAssignment, setEditAssignment] = useState<ProfileTypeGroupPermission | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const profileTypeGroupsListPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : ''

  const load = () => {
    setError(null)
    if (!hasValidGroup) return setAssignments([])
    setLoading(true)
    listGroupPermissions({ groupId: groupIdNum })
      .then(setAssignments)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load permissions') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [groupIdNum, hasValidGroup])
  useEffect(() => {
    listPermissionsCatalog().then(items => {
      const scopes = [...new Set(items.map(p => p.scope).filter(Boolean))]
      setScopeOptions(scopes)
    }).catch(() => setScopeOptions([]))
  }, [])

  const handleSave = async (data: { profileTypeGroupId: number; permissionScope: string; status: string }) => {
    setError(null)
    try {
      if (editAssignment?.id) await updateGroupPermission(editAssignment.id, { permissionScope: data.permissionScope, status: data.status })
      else await createGroupPermission(data)
      load()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    setError(null)
    try {
      await removeGroupPermission(deleteId)
      load()
      setDeleteId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to delete')
    }
  }

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && profileTypeGroupsListPath && (
        <div className="mb-4">
          <Link to={profileTypeGroupsListPath} className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Back to Profile Type Groups</Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader title="Profile Group Permissions" subtitle="Assign permissions to this profile type group" />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Group Permissions</h2>
          <button onClick={() => { setEditAssignment(null); setDrawerOpen(true) }} disabled={!hasValidGroup} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#37BBA2', fontSize: 14 }}><Plus size={15} /> Add Permission</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && hasValidGroup && <p className="mb-2 text-sm" style={{ color: '#6B7280' }}>Loading permissions…</p>}
      {!hasValidGroup && embedded && !loading && <p className="text-sm" style={{ color: '#6B7280' }}>Select a group to manage permissions.</p>}
      {hasValidGroup && (
        <>
          {!loading && (
            <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                    {['Assignment ID', 'Permission scope', 'Status', 'Date created', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{a.id}</span></td>
                      <td className="px-4 py-3"><span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{a.permissionScope}</span></td>
                      <td className="px-4 py-3"><Components.StatusBadge status={a.status} size="sm" /></td>
                      <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{a.dateCreated ? new Date(a.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditAssignment(a); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <PermissionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} assignment={editAssignment} profileTypeGroupId={hasValidGroup ? groupIdNum : 0} scopeOptions={scopeOptions} onSave={handleSave} />
          <Components.ConfirmModal open={deleteId != null} title="Remove permission?" message={<>Remove this permission from the group?</>} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
        </>
      )}
    </div>
  )
  return content
}
