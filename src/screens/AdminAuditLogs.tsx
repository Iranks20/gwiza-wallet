'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Eye, X } from 'lucide-react'
import { listAuditLogs } from '@/services/transactionAuditLogsService'
import type { TxnAuditLog } from '@/services/transactionAuditLogsService'

function LogDetailModal({ log, onClose }: { log: TxnAuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Audit Log Detail</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
            {[
              ['User', log.performedBy],
              ['Action', log.action],
              ['Performed by type', log.performedByType],
              ['Txn ID', log.txnId ?? '—'],
              ['Previous status', log.previousStatus || '—'],
              ['New status', log.newStatus || '—'],
              ['IP address', log.ipAddress || '—'],
              ['When', log.dateCreated ? new Date(log.dateCreated).toLocaleString() : '—'],
            ].map(([k, v], i) => (
            <div key={i} className="flex justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>{k}</span>
              <span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{String(v)}</span>
            </div>
          ))}
        </div>
        <div className="p-6 border-t" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminAuditLogs() {
  const [txnId, setTxnId] = useState('')
  const [userId, setUserId] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState<TxnAuditLog | null>(null)
  const [logs, setLogs] = useState<TxnAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [page, setPage] = useState(1)

  const listParams = useMemo(() => {
    const txn = txnId.trim() ? parseInt(txnId.trim(), 10) : NaN
    const txnNum = !Number.isNaN(txn) && txn > 0 ? txn : undefined
    const startDate = dateFrom.trim() || undefined
    const endDate = dateTo.trim() || undefined
    const user = userId.trim() || undefined
    return { page, limit: 20, txnId: txnNum, userId: user, startDate, endDate }
  }, [page, txnId, userId, dateFrom, dateTo])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listAuditLogs(listParams)
      .then(({ items, pagination: p }) => {
        if (cancelled) return
        setLogs(items)
        setPagination(p ?? null)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load audit logs')
        setLogs([])
        setPagination(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [listParams])

  const filtered = useMemo(() => {
    let list = logs
    const action = actionFilter
    if (action !== 'all') {
      const a = action.toLowerCase()
      list = list.filter(l => l.action.toLowerCase().includes(a))
    }
    return list
  }, [logs, actionFilter])

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Audit Logs"
        subtitle="Traceable history of configuration and operational actions in the system"
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input value={txnId} onChange={e => { setTxnId(e.target.value); setPage(1) }} placeholder="Txn ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-40" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input value={userId} onChange={e => { setUserId(e.target.value); setPage(1) }} placeholder="User ID / email" className="px-3 py-2 border rounded-lg text-sm outline-none w-48" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{loading ? '...' : `${filtered.length} results`}</span>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['User', 'Action', 'Txn ID', 'Previous status', 'New status', 'When', ''].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#6B7280', fontSize: 14 }}>Loading audit logs...</td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.performedBy}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.action}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#37BBA2', fontSize: 12 }}>{r.txnId ?? '—'}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{r.previousStatus || '—'}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{r.newStatus || '—'}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.dateCreated ? new Date(r.dateCreated).toLocaleString() : '—'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedLog(r)} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="View details"><Eye size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && !loading && (
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
                  style={{ background: p === page ? '#37BBA2' : '#F9FAFB', color: p === page ? 'white' : '#6B7280', fontSize: 12 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
