'use client'

import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, X } from 'lucide-react'
import { useraccesslevelsApi, type UserAccessLevel } from '@/api/useraccesslevels'
import { useraccessrightsApi, type UserAccessRight } from '@/api/useraccessrights'
import { useAuth } from '@/contexts/AuthContext'
import type { MenuOption } from '@/services/googleAuth'

function normalizeStoredPermissionsToIds(raw: string | undefined, catalog: UserAccessRight[]): string {
  if (!raw?.trim()) return ''
  const byKey = new Map(catalog.map((r) => [r.menuKey, r]))
  const ids = new Set<string>()
  for (const t of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (/^\d+$/.test(t)) {
      ids.add(t)
      continue
    }
    const row = byKey.get(t)
    if (row) ids.add(String(row.menuId))
  }
  return Array.from(ids)
    .sort((a, b) => Number(a) - Number(b))
    .join(', ')
}

function defaultIdsFromSessionMenus(menuOptions: MenuOption[], catalog: UserAccessRight[]): string {
  if (!catalog.length || !menuOptions.length) return ''
  const byKey = new Map(catalog.map((r) => [r.menuKey, r]))
  const ids = new Set<string>()
  for (const m of menuOptions) {
    const fromId = m.id != null && Number(m.id) > 0 ? String(m.id) : null
    if (fromId) {
      ids.add(fromId)
      continue
    }
    const row = byKey.get(m.menuKey)
    if (row) ids.add(String(row.menuId))
  }
  return Array.from(ids)
    .sort((a, b) => Number(a) - Number(b))
    .join(', ')
}

const emptyForm: Omit<UserAccessLevel, 'id'> = {
  name: '',
  description: '',
  allowedPermissions: '',
  status: 'active',
  accessLevelCreatorId: null,
}

interface AccessLevelDrawerProps {
  open: boolean
  onClose: () => void
  level: UserAccessLevel | null
  menuRights: UserAccessRight[]
  existingLevels: UserAccessLevel[]
  onSave: (data: UserAccessLevel | Omit<UserAccessLevel, 'id'>) => void
}

function AccessLevelDrawer({ open, onClose, level, menuRights, existingLevels, onSave }: AccessLevelDrawerProps) {
  const auth = useAuth()
  const [form, setForm] = useState<Omit<UserAccessLevel, 'id'> & { id?: number }>({ ...emptyForm })
  const [allLevelsForDropdown, setAllLevelsForDropdown] = useState<UserAccessLevel[]>([])

  useEffect(() => {
    if (!open) return
    if (level) {
      setForm({
        ...level,
        accessLevelCreatorId: level.accessLevelCreatorId ?? null,
        allowedPermissions: normalizeStoredPermissionsToIds(level.allowedPermissions, menuRights),
      })
    } else {
      setForm({
        ...emptyForm,
        allowedPermissions: defaultIdsFromSessionMenus(auth.menuOptions ?? [], menuRights),
      })
    }
  }, [open, level, menuRights])

  useEffect(() => {
    if (open) {
      useraccesslevelsApi.list({ page: 1, limit: 500 }).then((r) => setAllLevelsForDropdown(r.items))
    }
  }, [open])

  const creatorOptions = (allLevelsForDropdown.length > 0 ? allLevelsForDropdown : existingLevels).filter(
    (l) => l.id !== level?.id
  )

  if (!open) return null

  const selectedValues = form.allowedPermissions
    ? form.allowedPermissions.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const isSelected = (r: UserAccessRight) => selectedValues.includes(String(r.menuId))

  const toggleMenuId = (r: UserAccessRight) => {
    const idStr = String(r.menuId)
    const set = new Set(selectedValues)
    if (set.has(idStr)) set.delete(idStr)
    else set.add(idStr)
    const sorted = Array.from(set).sort((a, b) => Number(a) - Number(b))
    setForm((f) => ({ ...f, allowedPermissions: sorted.join(', ') }))
  }

  const handleSave = () => {
    if (level?.id) {
      const { id, ...rest } = form as UserAccessLevel
      onSave({ ...level, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<UserAccessLevel, 'id'>)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {level ? 'Edit Access Level' : 'Add Access Level'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Create from (Access Level)
            </label>
            <select
              value={form.accessLevelCreatorId != null && form.accessLevelCreatorId > 0 ? form.accessLevelCreatorId : ''}
              onChange={(e) => {
                const v = e.target.value
                setForm((f) => ({
                  ...f,
                  accessLevelCreatorId: v === '' ? null : Number(v),
                }))
              }}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select create from</option>
              {creatorOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Admin, Viewer, Operator"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={(e) => (e.target.style.borderColor = '#37BBA2')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description of this access level"
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm resize-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={(e) => (e.target.style.borderColor = '#37BBA2')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Allowed menu keys (User Access Rights)
            </label>
            <div
              className="min-h-[14rem] max-h-[min(28rem,55vh)] overflow-y-auto border rounded-lg p-2 space-y-1.5"
              style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}
            >
              {menuRights.length === 0 ? (
                <p className="text-xs py-2" style={{ color: '#9CA3AF' }}>
                  No menu rights loaded. Configure catalog under Settings → User Access Rights.
                </p>
              ) : (
                menuRights.map((r) => (
                  <label
                    key={r.menuId}
                    className="flex items-start gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(r)}
                      onChange={() => toggleMenuId(r)}
                      className="w-4 h-4 rounded cursor-pointer mt-0.5 shrink-0"
                      style={{ accentColor: '#37BBA2' }}
                    />
                    <span className="text-sm min-w-0" style={{ color: '#04304B' }}>
                      <span className="text-[11px] font-medium" style={{ color: '#6B7280' }}>
                        id {r.menuId}
                      </span>{' '}
                      <span className="font-mono text-xs">{r.menuKey}</span>
                      {r.menuLabel ? (
                        <span className="block text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>
                          {r.menuLabel}
                          {r.routePath ? ` · ${r.routePath}` : ''}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              Stored as comma-separated <code className="text-[11px]">menu_id</code> values in{' '}
              <code className="text-[11px]">access_level_allowed_permissions</code>. Add mode pre-selects ids from your current session
              menus; existing <code className="text-[11px]">menu_key</code> values in saved data are converted to ids when you open
              edit.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {level ? 'Save Changes' : 'Add Access Level'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserAccessLevels() {
  const [levels, setLevels] = useState<UserAccessLevel[]>([])
  const [menuRights, setMenuRights] = useState<UserAccessRight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerNonce, setDrawerNonce] = useState(0)
  const [editLevel, setEditLevel] = useState<UserAccessLevel | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  useEffect(() => {
    useraccessrightsApi
      .list({ page: 1, limit: 500 })
      .then((r) => setMenuRights(r.items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
      .catch(() => setMenuRights([]))
  }, [])

  const loadLevels = () => {
    setLoading(true)
    setError(null)
    useraccesslevelsApi
      .list({ page, limit: 20 })
      .then((res) => {
        setLevels(res.items)
        setPagination(res.pagination ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load access levels'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLevels()
  }, [page])

  const handleSave = async (data: UserAccessLevel | Omit<UserAccessLevel, 'id'>) => {
    setError(null)
    try {
      if ('id' in data && data.id) {
        await useraccesslevelsApi.update(data.id, {
          ...data,
          accessLevelCreatorId:
            data.accessLevelCreatorId != null && data.accessLevelCreatorId > 0 ? data.accessLevelCreatorId : null,
        })
      } else {
        await useraccesslevelsApi.create({
          name: data.name,
          description: data.description,
          allowedPermissions: data.allowedPermissions,
          status: data.status,
          accessLevelCreatorId:
            data.accessLevelCreatorId != null && data.accessLevelCreatorId > 0 ? data.accessLevelCreatorId : null,
        })
      }
      loadLevels()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="User Access Levels"
        subtitle="Define access levels and their allowed permissions for user accounts"
        action={{
          label: 'Add Access Level',
          onClick: () => {
            setEditLevel(null)
            setDrawerNonce((n) => n + 1)
            setDrawerOpen(true)
          },
          icon: <Plus size={15} />,
        }}
      />

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between"
          style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}
        >
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">
            Dismiss
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
              {['Name', 'Created from', 'Description', 'Allowed Permissions', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                  Loading...
                </td>
              </tr>
            ) : (
              levels.map((l) => {
                const creatorName =
                  l.accessLevelCreatorId && l.accessLevelCreatorId > 0
                    ? levels.find((x) => x.id === l.accessLevelCreatorId)?.name ?? `#${l.accessLevelCreatorId}`
                    : '—'
                return (
                <tr key={l.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3">
                    <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{l.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#6B7280', fontSize: 12 }}>{creatorName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-2" style={{ color: '#6B7280', fontSize: 12 }}>
                      {l.description || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono truncate max-w-[200px] block" style={{ color: '#374151' }}>
                      {l.allowedPermissions || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={l.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setEditLevel(l)
                        setDrawerNonce((n) => n + 1)
                        setDrawerOpen(true)
                      }}
                      className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                      style={{ color: '#37BBA2' }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              )
              })
            )}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}
          >
            <span style={{ color: '#6B7280', fontSize: 13 }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#E5E7EB', color: '#04304B' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#E5E7EB', color: '#04304B' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AccessLevelDrawer
        key={`${editLevel?.id ?? 'add'}-${drawerNonce}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        level={editLevel}
        menuRights={menuRights}
        existingLevels={levels}
        onSave={handleSave}
      />
    </div>
  )
}
