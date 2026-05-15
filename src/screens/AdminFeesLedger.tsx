'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Eye, X, Loader2 } from 'lucide-react'
import { listFeesLedgerEntries } from '@/services/feesLedgerService'
import type { TxnFeesLedgerEntry } from '@/services/feesLedgerService'
import { Table } from '@/components/ui/table'

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString()
  } catch {
    return s
  }
}

function FeeDetailModal({ fee, onClose }: { fee: TxnFeesLedgerEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Fee Entry Detail</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
            {[
              ['Entry ID', fee.id],
              ['Txn ID', fee.txnId ?? '—'],
              ['Charged Wallet ID', fee.chargedWalletId],
              ['Credited Wallet ID', fee.creditedWalletId],
              ['Amount', formatAmount(fee.feeAmount, fee.currencyCode)],
              ['Status', fee.status],
              ['Date', formatDate(fee.entryDate)],
            ].map(([k, v], i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
              <span style={{ color: '#6B7280', fontSize: 13 }}>{k}</span>
                {k === 'Status' ? <Components.StatusBadge status={fee.status} size="sm" /> : <span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{String(v)}</span>}
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

export default function AdminFeesLedger() {
  const [txnId, setTxnId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [chargedWallet, setChargedWallet] = useState('')
  const [creditedWallet, setCreditedWallet] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedFee, setSelectedFee] = useState<TxnFeesLedgerEntry | null>(null)
  const [entries, setEntries] = useState<TxnFeesLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [page, setPage] = useState(1)

  const listParams = useMemo(() => {
    const txn = txnId.trim() ? parseInt(txnId.trim(), 10) : NaN
    const txnNum = !Number.isNaN(txn) && txn > 0 ? txn : undefined
    const chargedId = chargedWallet.trim() ? parseInt(chargedWallet.trim(), 10) : NaN
    const chargedNum = !Number.isNaN(chargedId) && chargedId > 0 ? chargedId : undefined
    const creditedId = creditedWallet.trim() ? parseInt(creditedWallet.trim(), 10) : NaN
    const creditedNum = !Number.isNaN(creditedId) && creditedId > 0 ? creditedId : undefined
    const startDate = dateFrom.trim() || undefined
    const endDate = dateTo.trim() || undefined
    const status = statusFilter as 'completed' | 'pending' | 'reversed' | 'failed' | 'all'
    return { page, limit: 20, txnId: txnNum, chargedWalletId: chargedNum, creditedWalletId: creditedNum, startDate, endDate, status }
  }, [page, txnId, chargedWallet, creditedWallet, dateFrom, dateTo, statusFilter])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listFeesLedgerEntries(listParams)
      .then(({ items, pagination: p }) => {
        if (cancelled) return
        setEntries(items)
        setPagination(p ?? null)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load fees ledger')
        setEntries([])
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
    if (!entries.length) return entries
    return entries
  }, [entries])

  return (
    <div>
      <Components.AdminPageHeader
        title="Fees Ledger"
        subtitle="Accounting view of all fees charged and settled"
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input value={txnId} onChange={e => { setTxnId(e.target.value); setPage(1) }} placeholder="Txn ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-36" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input value={chargedWallet} onChange={e => setChargedWallet(e.target.value)} placeholder="Charged wallet ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-32" style={{ borderColor: '#E5E7EB', color: '#04304B' }} onBlur={() => setPage(1)} />
        <input value={creditedWallet} onChange={e => setCreditedWallet(e.target.value)} placeholder="Credited wallet ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-32" style={{ borderColor: '#E5E7EB', color: '#04304B' }} onBlur={() => setPage(1)} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <span style={{ color: '#6B7280', fontSize: 13 }}>{loading ? 'Loading fees ledger...' : `${filtered.length} results`}</span>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Entry ID', 'Txn ID', 'Charged Wallet', 'Credited Wallet', 'Amount', 'Status', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading fees ledger...</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{r.id}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#37BBA2', fontSize: 12 }}>{r.txnId ?? '—'}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.chargedWalletId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.creditedWalletId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#F44336', fontSize: 13 }}>{formatAmount(r.feeAmount, r.currencyCode)}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{formatDate(r.entryDate)}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedFee(r)} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="View details" aria-label="View fee details"><Eye size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {pagination && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>
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

      {selectedFee && <FeeDetailModal fee={selectedFee} onClose={() => setSelectedFee(null)} />}
    </div>
  )
}
