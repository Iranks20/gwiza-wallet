'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Search, Edit2, X } from 'lucide-react'
import { listUserAccounts, updateUserAccount } from '@/services/userAccountsService'
import type { UserAccount } from '@/services/userAccountsService'
import { useraccesslevelsApi, type UserAccessLevel } from '@/api/useraccesslevels'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatDateTime(s: string | null): string {
  if (!s) return '—'
  try {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return s
  }
}

const inputClass = "w-full px-3.5 py-2.5 border border-input rounded-lg text-body text-foreground bg-background placeholder:text-muted-foreground transition-all duration-150"
const selectClass = "w-full px-3.5 py-2.5 border border-input rounded-lg text-body text-foreground bg-background cursor-pointer transition-all duration-150"

interface EditUserDrawerProps {
  open: boolean
  onClose: () => void
  user: UserAccount | null
  accessLevels: UserAccessLevel[]
  onSave: (id: number, data: { accessLevel: number; status: UserAccount['status'] }) => Promise<void>
}

function EditUserDrawer({ open, onClose, user, accessLevels, onSave }: EditUserDrawerProps) {
  const [accessLevel, setAccessLevel] = useState<number>(1)
  const [status, setStatus] = useState<UserAccount['status']>('active')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && user) {
      setAccessLevel(user.accessLevel)
      setStatus(user.status)
    }
  }, [open, user])

  if (!open || !user) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(user.id, { accessLevel, status })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-card h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-section text-foreground">
            Edit User Account
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div>
            <p className="text-meta mb-1.5 text-muted-foreground">User</p>
            <p className="text-body font-medium text-foreground">
              {user.fullName || user.userName}
            </p>
            <p className="text-caption text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5 text-foreground">
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(Number(e.target.value))}
              className={selectClass}
            >
              {accessLevels.length === 0 ? (
                <option value={user.accessLevel}>Level {user.accessLevel}</option>
              ) : (
                accessLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5 text-foreground">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserAccount['status'])}
              className={selectClass}
            >
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-body font-medium cursor-pointer hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-body font-medium bg-primary text-primary-foreground cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserAccounts() {
  const [items, setItems] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'active' | 'inactive' | 'suspended'>('all')
  const [search, setSearch] = useState('')
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserAccount | null>(null)
  const [accessLevels, setAccessLevels] = useState<UserAccessLevel[]>([])

  const listParams = useMemo(() => {
    const q = search.trim()
    const userId = /^\d+$/.test(q) ? parseInt(q, 10) : undefined
    const email = q.includes('@') ? q : undefined
    return {
      page,
      limit: 20,
      status: statusFilter,
      userId: userId && userId > 0 ? userId : undefined,
      email: email && !userId ? email : undefined,
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    useraccesslevelsApi.list({ page: 1, limit: 100 }).then((r) => setAccessLevels(r.items)).catch(() => setAccessLevels([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listUserAccounts(listParams)
      .then(res => {
        if (cancelled) return
        setItems(res.items)
        setPagination(res.pagination ?? null)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load user accounts')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [listParams])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    if (/^\d+$/.test(q) || q.includes('@')) return items
    return items.filter(u =>
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q))
    )
  }, [items, search])

  const resetFilters = () => {
    setStatusFilter('all')
    setSearch('')
    setPage(1)
  }

  const handleUpdateUser = async (id: number, data: { accessLevel: number; status: UserAccount['status'] }) => {
    setError(null)
    try {
      await updateUserAccount(id, data)
      const res = await listUserAccounts(listParams)
      setItems(res.items)
      setPagination(res.pagination ?? null)
      setEditDrawerOpen(false)
      setEditUser(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
      throw e
    }
  }

  return (
    <div>
      <Components.AdminPageHeader
        title="User Management"
        subtitle="View, filter, and update backoffice user accounts"
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-error/30 bg-error-muted text-error flex items-center justify-between">
          <span className="text-body">{error}</span>
          <button onClick={() => setError(null)} className="text-body font-medium hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-4 mb-6">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, email, or name…"
            className={cn(inputClass, 'pl-9')}
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-meta font-medium mb-1.5 text-muted-foreground">Status</label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <Button variant="outline" onClick={resetFilters} className="shrink-0">
          Reset filters
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/30">
          <span className="text-caption text-muted-foreground">
            {loading ? 'Loading...' : `${filtered.length} users${pagination?.total ? ` · ${pagination.total} total` : ''}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Name', 'Email', 'Auth', 'Access', 'Status', 'Last login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-meta font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {              loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-body">Loading users…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-body">No users found for the selected filters.</td>
                </tr>
              ) : (
                filtered.map(u => {
                  const accessLevelName = accessLevels.find((l) => l.id === u.accessLevel)?.name ?? String(u.accessLevel)
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4"><span className="font-mono font-semibold text-primary text-caption tabular-nums">{u.id}</span></td>
                      <td className="px-5 py-4"><span className="text-foreground text-body">{u.fullName || u.userName}</span></td>
                      <td className="px-5 py-4"><span className="text-foreground text-body">{u.email}</span></td>
                      <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-md text-meta font-medium bg-info-muted text-info">{u.authType}</span></td>
                      <td className="px-5 py-4"><span className="text-foreground text-body">{accessLevelName}</span></td>
                      <td className="px-5 py-4"><Components.StatusBadge status={u.status} size="sm" /></td>
                      <td className="px-5 py-4"><span className="text-muted-foreground text-caption tabular-nums">{formatDateTime(u.lastLoginAt)}</span></td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => { setEditUser(u); setEditDrawerOpen(true) }}
                          className="p-1.5 rounded-lg hover:bg-primary-muted cursor-pointer text-primary"
                          title="Edit user"
                          aria-label="Edit user"
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
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-border">
            <span className="text-caption text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-body font-medium cursor-pointer transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0',
                    p === page ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditUserDrawer
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditUser(null) }}
        user={editUser}
        accessLevels={accessLevels}
        onSave={handleUpdateUser}
      />
    </div>
  )
}
