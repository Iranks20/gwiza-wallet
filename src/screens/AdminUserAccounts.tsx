'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Search, Pencil } from 'lucide-react'
import { listUserAccounts, updateUserAccount, type UpdateUserAccountBody } from '@/services/userAccountsService'
import type { UserAccount } from '@/services/userAccountsService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

const inputClass = "w-full px-3 py-2 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
const selectClass = "w-full px-3 py-2 border border-input rounded-lg text-sm text-foreground bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"

export default function AdminUserAccounts() {
  const [items, setItems] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'active' | 'inactive' | 'suspended'>('all')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [search, setSearch] = useState('')

  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [editForm, setEditForm] = useState<UpdateUserAccountBody>({
    access_level: 1,
    country_id: 0,
    user_profile_type: '',
    user_account_status: 'active',
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const listParams = useMemo(() => {
    const userId = userIdFilter.trim() ? parseInt(userIdFilter.trim(), 10) : undefined
    const email = emailFilter.trim() || undefined
    return {
      page,
      limit: 20,
      status: statusFilter,
      userId: userId && !Number.isNaN(userId) ? userId : undefined,
      email,
    }
  }, [page, statusFilter, userIdFilter, emailFilter])

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
    return items.filter(u =>
      String(u.id).includes(q) ||
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q)
    )
  }, [items, search])

  const resetFilters = () => {
    setStatusFilter('all')
    setUserIdFilter('')
    setEmailFilter('')
    setSearch('')
    setPage(1)
  }

  const openEdit = (u: UserAccount) => {
    setEditingUser(u)
    setEditForm({
      access_level: u.accessLevel,
      country_id: 0,
      user_profile_type: '',
      user_account_status: u.status,
    })
    setEditError(null)
  }

  const closeEdit = () => {
    setEditingUser(null)
    setEditError(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      await updateUserAccount(editingUser.id, editForm)
      setItems(prev =>
        prev.map(it =>
          it.id === editingUser.id
            ? {
                ...it,
                accessLevel: editForm.access_level,
                status: editForm.user_account_status,
              }
            : it
        )
      )
      closeEdit()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="font-sans">
      <Components.AdminPageHeader
        title="User Management"
        subtitle="View and filter backoffice user accounts"
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-error/30 bg-error-muted text-error flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 mb-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, name, email…"
            className={cn(inputClass, 'pl-9')}
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
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
        <div className="w-full sm:w-32">
          <label className="block text-xs font-medium mb-1 text-muted-foreground">User ID</label>
          <input type="text" value={userIdFilter} onChange={e => setUserIdFilter(e.target.value)} placeholder="e.g. 1" className={inputClass} onBlur={() => setPage(1)} />
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Email</label>
          <input type="email" value={emailFilter} onChange={e => setEmailFilter(e.target.value)} placeholder="user@example.com" className={inputClass} onBlur={() => setPage(1)} />
        </div>
        <Button variant="outline" onClick={resetFilters} className="shrink-0">
          Reset filters
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filtered.length} users${pagination?.total ? ` · ${pagination.total} total` : ''}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Name', 'Email', 'Auth', 'Access', 'Status', 'Last login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">Loading users…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">No users found for the selected filters.</td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono font-semibold text-primary text-xs">{u.id}</span></td>
                    <td className="px-4 py-3"><span className="text-foreground text-sm">{u.fullName || u.userName}</span></td>
                    <td className="px-4 py-3"><span className="text-foreground text-sm">{u.email}</span></td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-info-muted text-info">{u.authType}</span></td>
                    <td className="px-4 py-3"><span className="text-foreground text-sm">{u.accessLevel}</span></td>
                    <td className="px-4 py-3"><Components.StatusBadge status={u.status} size="sm" /></td>
                    <td className="px-4 py-3"><span className="text-muted-foreground text-xs">{formatDateTime(u.lastLoginAt)}</span></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="text-muted-foreground hover:text-foreground" aria-label="Edit user">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0',
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

      <Dialog open={!!editingUser} onOpenChange={open => !open && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user account</DialogTitle>
            {editingUser && (
              <p className="text-sm text-muted-foreground">
                {editingUser.fullName || editingUser.userName} · {editingUser.email}
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="px-3 py-2 rounded-lg border border-error/30 bg-error-muted text-error text-sm">
                {editError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Access level</label>
              <input
                type="number"
                min={0}
                value={editForm.access_level}
                onChange={e => setEditForm(f => ({ ...f, access_level: parseInt(e.target.value, 10) || 0 }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Country ID</label>
              <input
                type="number"
                min={0}
                value={editForm.country_id}
                onChange={e => setEditForm(f => ({ ...f, country_id: parseInt(e.target.value, 10) || 0 }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">User profile type</label>
              <input
                type="text"
                value={editForm.user_profile_type}
                onChange={e => setEditForm(f => ({ ...f, user_profile_type: e.target.value }))}
                className={inputClass}
                placeholder="e.g. admin, user"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
              <select
                value={editForm.user_account_status}
                onChange={e =>
                  setEditForm(f => ({ ...f, user_account_status: e.target.value as UpdateUserAccountBody['user_account_status'] }))
                }
                className={selectClass}
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEdit} disabled={editSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
