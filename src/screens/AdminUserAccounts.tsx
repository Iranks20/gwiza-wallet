'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Search } from 'lucide-react'
import { listUserAccounts } from '@/services/userAccountsService'
import type { UserAccount } from '@/services/userAccountsService'

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

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="User Management"
        subtitle="View and filter backoffice user accounts"
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, name, email…"
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none"
            style={{ borderColor: '#E5E7EB', fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = '#37BBA2' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
            className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>User ID</label>
          <input
            type="text"
            value={userIdFilter}
            onChange={e => setUserIdFilter(e.target.value)}
            placeholder="e.g. 1"
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            onBlur={() => setPage(1)}
          />
        </div>
        <div className="w-56">
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Email</label>
          <input
            type="email"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            onBlur={() => setPage(1)}
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="px-4 py-2.5 border rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
        >
          Reset filters
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>
            {loading ? 'Loading...' : `${filtered.length} users${pagination && pagination.total ? ` · ${pagination.total} total` : ''}`}
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              {['ID', 'Name', 'Email', 'Auth', 'Access', 'Status', 'Last login'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                  No users found for the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{u.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#04304B', fontSize: 13 }}>{u.fullName || u.userName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#04304B', fontSize: 13 }}>{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                      {u.authType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#04304B', fontSize: 13 }}>{u.accessLevel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={u.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#6B7280', fontSize: 12 }}>{formatDateTime(u.lastLoginAt)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ background: p === page ? '#37BBA2' : '#F9FAFB', color: p === page ? 'white' : '#6B7280', fontSize: 13 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

