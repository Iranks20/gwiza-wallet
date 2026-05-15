'use client'

import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, X, Loader2 } from 'lucide-react'
import { useraccessrightsApi, type UserAccessRight } from '@/api/useraccessrights'
import { Table } from '@/components/ui/table'

type FormState = {
  menuLabel: string
  menuKey: string
  routePath: string
  menuScope: string
  parentKey: string
  sortOrder: string
  isGroup: boolean
  onMenu: 'Yes' | 'No'
  css: string
}

const emptyForm: FormState = {
  menuLabel: '',
  menuKey: '',
  routePath: '',
  menuScope: '',
  parentKey: '',
  sortOrder: '',
  isGroup: false,
  onMenu: 'Yes',
  css: '',
}

function toForm(r: UserAccessRight): FormState {
  return {
    menuLabel: r.menuLabel,
    menuKey: r.menuKey,
    routePath: r.routePath ?? '',
    menuScope: r.menuScope ?? '',
    parentKey: r.parentKey ?? '',
    sortOrder: r.sortOrder != null ? String(r.sortOrder) : '',
    isGroup: r.isGroup,
    onMenu: r.onMenu === 'No' ? 'No' : 'Yes',
    css: r.css ?? '',
  }
}

function RightDrawer({
  open,
  onClose,
  row,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  row: UserAccessRight | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setErr(null)
      setForm(row ? toForm(row) : emptyForm)
    }
  }, [open, row])

  if (!open) return null

  const handleSave = async () => {
    setErr(null)
    const menuKey = form.menuKey.trim()
    const menuLabel = form.menuLabel.trim()
    if (!menuKey || !menuLabel) {
      setErr('menu_key and menu_label are required.')
      return
    }
    const sortOrder = form.sortOrder.trim() ? parseInt(form.sortOrder, 10) : null
    if (form.sortOrder.trim() && Number.isNaN(sortOrder)) {
      setErr('Sort order must be a number.')
      return
    }
    setSaving(true)
    try {
      if (row) {
        await useraccessrightsApi.update(row.menuId, {
          menuLabel,
          menuKey,
          routePath: form.isGroup ? null : form.routePath.trim() || null,
          menuScope: form.menuScope.trim() || null,
          parentKey: form.parentKey.trim() || null,
          sortOrder,
          isGroup: form.isGroup,
          onMenu: form.onMenu,
          css: form.css.trim() || null,
        })
      } else {
        await useraccessrightsApi.create({
          menuLabel,
          menuKey,
          routePath: form.isGroup ? null : form.routePath.trim() || null,
          menuScope: form.menuScope.trim() || '',
          onMenu: form.onMenu,
          parentKey: form.parentKey.trim() || null,
          sortOrder,
          isGroup: form.isGroup,
          css: form.css.trim() || null,
        })
      }
      onSaved()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {row ? 'Edit access right' : 'Add access right'}
          </h2>
          <button type="button" onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {err && (
            <div className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
              {err}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              menu_key *
            </label>
            <input
              value={form.menuKey}
              onChange={(e) => setForm((f) => ({ ...f, menuKey: e.target.value }))}
              disabled={!!row}
              placeholder="e.g. admin.dashboard"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm font-mono disabled:opacity-70"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              menu_label *
            </label>
            <input
              value={form.menuLabel}
              onChange={(e) => setForm((f) => ({ ...f, menuLabel: e.target.value }))}
              placeholder="Display label"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isGroup}
              onChange={(e) => setForm((f) => ({ ...f, isGroup: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#37BBA2' }}
            />
            <span className="text-sm" style={{ color: '#04304B' }}>
              is_group (section header, no route)
            </span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              route_path
            </label>
            <input
              value={form.routePath}
              onChange={(e) => setForm((f) => ({ ...f, routePath: e.target.value }))}
              disabled={form.isGroup}
              placeholder="/admin/..."
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm disabled:opacity-50"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              menu_scope
            </label>
            <input
              value={form.menuScope}
              onChange={(e) => setForm((f) => ({ ...f, menuScope: e.target.value }))}
              placeholder="e.g. admin"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              parent_key
            </label>
            <input
              value={form.parentKey}
              onChange={(e) => setForm((f) => ({ ...f, parentKey: e.target.value }))}
              placeholder="e.g. admin.settings"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm font-mono"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              sort_order
            </label>
            <input
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              placeholder="10"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              on_menu
            </label>
            <select
              value={form.onMenu}
              onChange={(e) => setForm((f) => ({ ...f, onMenu: e.target.value as 'Yes' | 'No' }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              css
            </label>
            <input
              value={form.css}
              onChange={(e) => setForm((f) => ({ ...f, css: e.target.value }))}
              placeholder="Optional"
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {saving ? 'Saving…' : row ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserAccessRights() {
  const [items, setItems] = useState<UserAccessRight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRow, setEditRow] = useState<UserAccessRight | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    useraccessrightsApi
      .list({ page, limit: 20 })
      .then((res) => {
        setItems(res.items)
        setPagination(res.pagination ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load access rights'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  return (
    <div>
      <Components.AdminPageHeader
        title="User Access Rights"
        subtitle="Catalog of menu keys and routes used for access control and User Access Levels"
        action={{
          label: 'Add right',
          onClick: () => {
            setEditRow(null)
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
          <button type="button" onClick={() => setError(null)} className="text-sm font-medium">
            Dismiss
          </button>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div>
          <Table className="min-w-[900px]">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Label', 'menu_key', 'Route', 'parent_key', 'sort', 'Group', 'On menu', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 whitespace-nowrap" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading access rights...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.menuId} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-3">
                      <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{r.menuLabel || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: '#374151' }}>
                        {r.menuKey}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-xs truncate block" style={{ color: '#6B7280' }}>
                        {r.routePath || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: '#6B7280' }}>
                        {r.parentKey || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: '#6B7280', fontSize: 12 }}>{r.sortOrder ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: '#6B7280', fontSize: 12 }}>{r.isGroup ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: '#6B7280', fontSize: 12 }}>{r.onMenu}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditRow(r)
                          setDrawerOpen(true)
                        }}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer"
                        style={{ color: '#37BBA2' }}
                        title="Edit access right"
                        aria-label="Edit access right"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

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
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#E5E7EB', color: '#04304B' }}
              >
                Previous
              </button>
              <button
                type="button"
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

      <RightDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={editRow}
        onSaved={load}
      />
    </div>
  )
}
