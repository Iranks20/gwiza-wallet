'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Eye, X } from 'lucide-react'

const rows = [
  { id: 'FEE-001', txnId: 'TXN-001842', chargedWallet: 'WLT-00291', creditedWallet: 'SYS-FEES', amount: '450.00', currency: 'KES', status: 'completed', date: '2024-03-20 14:22' },
  { id: 'FEE-002', txnId: 'TXN-001731', chargedWallet: 'WLT-00184', creditedWallet: 'SYS-FEES', amount: '100.00', currency: 'NGN', status: 'completed', date: '2024-03-18 09:15' },
  { id: 'FEE-003', txnId: 'TXN-001620', chargedWallet: 'WLT-00392', creditedWallet: 'SYS-FEES', amount: '50.00', currency: 'GHS', status: 'pending', date: '2024-03-15 16:40' },
]

function FeeDetailModal({ fee, onClose }: { fee: typeof rows[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Fee Entry Detail</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            ['Entry ID', fee.id],
            ['Txn ID', fee.txnId],
            ['Charged Wallet', fee.chargedWallet],
            ['Credited Wallet', fee.creditedWallet],
            ['Amount', `${fee.currency} ${fee.amount}`],
            ['Status', fee.status],
            ['Date', fee.date],
          ].map(([k, v], i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>{k}</span>
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
  const [selectedFee, setSelectedFee] = useState<typeof rows[0] | null>(null)

  const filtered = rows.filter(r => {
    const matchTxn = !txnId || r.txnId.toLowerCase().includes(txnId.toLowerCase())
    const matchDateFrom = !dateFrom || r.date >= dateFrom
    const matchDateTo = !dateTo || r.date <= dateTo
    const matchCharged = !chargedWallet || r.chargedWallet.toLowerCase().includes(chargedWallet.toLowerCase())
    const matchCredited = !creditedWallet || r.creditedWallet.toLowerCase().includes(creditedWallet.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchTxn && matchDateFrom && matchDateTo && matchCharged && matchCredited && matchStatus
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Fees Ledger"
        subtitle="Accounting view of all fees charged and settled"
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Txn ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-36" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input value={chargedWallet} onChange={e => setChargedWallet(e.target.value)} placeholder="Charged wallet" className="px-3 py-2 border rounded-lg text-sm outline-none w-32" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input value={creditedWallet} onChange={e => setCreditedWallet(e.target.value)} placeholder="Credited wallet" className="px-3 py-2 border rounded-lg text-sm outline-none w-32" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} results</span>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Entry ID', 'Txn ID', 'Charged Wallet', 'Credited Wallet', 'Amount', 'Status', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{r.id}</span></td>
                <td className="px-4 py-3"><span className="font-mono" style={{ color: '#37BBA2', fontSize: 12 }}>{r.txnId}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.chargedWallet}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.creditedWallet}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#F44336', fontSize: 13 }}>{r.currency} {r.amount}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.date}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedFee(r)} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="View details"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFee && <FeeDetailModal fee={selectedFee} onClose={() => setSelectedFee(null)} />}
    </div>
  )
}
