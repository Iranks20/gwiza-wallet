'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Eye, X } from 'lucide-react'

const rows = [
  { id: 1, user: 'admin@fintech.io', action: 'Updated KYC Tier for WLT-00291', entity: 'Wallet', entityId: 'WLT-00291', txnId: 'TXN-001842', date: '2024-03-20 14:22', type: 'update' },
  { id: 2, user: 'ops@fintech.io', action: 'Created Transaction Rule #28', entity: 'Rule', entityId: 'RULE-0028', txnId: null, date: '2024-03-20 13:10', type: 'create' },
  { id: 3, user: 'admin@fintech.io', action: 'Deactivated Wallet WLT-00102', entity: 'Wallet', entityId: 'WLT-00102', txnId: null, date: '2024-03-19 11:00', type: 'delete' },
]

function LogDetailModal({ log, onClose }: { log: typeof rows[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Audit Log Detail</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            ['User', log.user],
            ['Action', log.action],
            ['Entity', log.entity],
            ['Entity ID', log.entityId],
            ['Txn ID', log.txnId ?? '—'],
            ['When', log.date],
            ['Type', log.type],
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
  const [selectedLog, setSelectedLog] = useState<typeof rows[0] | null>(null)

  const filtered = rows.filter(r => {
    const matchTxn = !txnId || (r.txnId && r.txnId.toLowerCase().includes(txnId.toLowerCase()))
    const matchUser = !userId || r.user.toLowerCase().includes(userId.toLowerCase())
    const matchAction = actionFilter === 'all' || r.type === actionFilter
    const matchDateFrom = !dateFrom || r.date >= dateFrom
    const matchDateTo = !dateTo || r.date <= dateTo
    return matchTxn && matchUser && matchAction && matchDateFrom && matchDateTo
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Audit Logs"
        subtitle="Traceable history of configuration and operational actions in the system"
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Txn ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-40" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID / email" className="px-3 py-2 border rounded-lg text-sm outline-none w-48" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} results</span>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['User', 'Action', 'Entity', 'Entity ID', 'When', 'Type', ''].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.user}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.action}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.entity}</span></td>
                <td className="px-4 py-3"><span className="font-mono" style={{ color: '#6B7280', fontSize: 12 }}>{r.entityId}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.date}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.type} label={r.type} size="sm" /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedLog(r)} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="View details"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
