'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import type { PermissionCatalogItem } from '@/services/permissionsCatalogService'
import {
  listPermissionsCatalog,
  createPermissionCatalog,
  updatePermissionCatalog,
  removePermissionCatalog,
} from '@/services/permissionsCatalogService'

const emptyForm: Omit<PermissionCatalogItem, 'id'> = { code: '', scope: 'wallet', tag: 'read_only', description: '', status: 'active' }

const SCOPES = ['wallet', 'fees_scope', 'rules', 'transactions']
const TAGS = ['read_only', 'write', 'admin']

interface PermissionDrawerProps {
  open: boolean
  onClose: () => void
  permission: PermissionCatalogItem | null
  onSave: (data: PermissionCatalogItem | Omit<PermissionCatalogItem, 'id'>) => void
}

function PermissionDrawer({ open, onClose, permission, onSave }: PermissionDrawerProps) {
  const [form, setForm] = useState<Omit<PermissionCatalogItem, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(permission ? { ...permission } : { ...emptyForm })
  }, [open, permission])

  if (!open) return null
  const handleSave = () => {
    if (permission?.id) {
      const { id, ...rest } = form as PermissionCatalogItem
      onSave({ ...permission, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<PermissionCatalogItem, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {permission ? 'Edit Permission' : 'Add Permission'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Code (permission name)</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="e.g. wallet.view (min 5 characters)"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm font-mono"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Min 5, max 255 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Scope</label>
            <select
              value={form.scope}
              onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              {SCOPES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Tag</label>
            <select
              value={form.tag}
              onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              {TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
            {permission ? 'Save Changes' : 'Add Permission'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPermissions() {
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scopeFilter, setScopeFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editPermission, setEditPermission] = useState<PermissionCatalogItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const loadPermissions = () => {
    setLoading(true)
    setError(null)
    listPermissionsCatalog({
      scope: scopeFilter === 'all' ? undefined : scopeFilter,
      tag: tagFilter === 'all' ? undefined : tagFilter,
      status: undefined,
    })
      .then(setPermissions)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load permissions'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadPermissions() }, [scopeFilter, tagFilter])

  const handleSave = async (data: PermissionCatalogItem | Omit<PermissionCatalogItem, 'id'>) => {
    setError(null)
    try {
      if ('id' in data && data.id) {
        await updatePermissionCatalog(data.id, data)
      } else {
        await createPermissionCatalog(data as Omit<PermissionCatalogItem, 'id'>)
      }
      loadPermissions()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }
  const handleDelete = async () => {
    if (deleteId == null) return
    setError(null)
    try {
      await removePermissionCatalog(deleteId)
      loadPermissions()
      setDeleteId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Profile Permissions"
        subtitle="Fine-grained permissions used to control access across backoffice"
        action={{ label: 'Add Permission', onClick: () => { setEditPermission(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Scopes</option>
          {SCOPES.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Tags</option>
          {TAGS.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{loading ? 'Loading...' : `${permissions.length} results`}</span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Scope', 'Tag', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#6B7280', fontSize: 13 }}>Loading...</td></tr>
            ) : (
              permissions.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{p.code}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#EFF6FF', color: '#1E40AF' }}>{p.scope}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#F3F4F6', color: '#374151' }}>{p.tag}</span>
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={p.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditPermission(p); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      <PermissionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} permission={editPermission} onSave={handleSave} />
      <Components.ConfirmModal
        open={deleteId != null}
        title="Delete Permission?"
        message={<>Are you sure you want to delete this permission? This action cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
