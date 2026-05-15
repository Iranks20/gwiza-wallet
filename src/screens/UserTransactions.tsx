'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import Components from '../components'
import { Table } from '@/components/ui/table'

const rows = [
  { id: 'TXN-001842', type: 'Received from John', amount: '+KES 12,500', status: 'completed', date: '2024-03-20 14:22' },
  { id: 'TXN-001841', type: 'Sent to Utility', amount: '-KES 3,200', status: 'completed', date: '2024-03-19 18:10' },
  { id: 'TXN-001840', type: 'Cash out ATM', amount: '-KES 1,000', status: 'pending', date: '2024-03-18 09:02' },
]

export default function UserTransactions() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = rows.filter(r => {
    const matchDateFrom = !dateFrom || r.date >= dateFrom
    const matchDateTo = !dateTo || r.date <= dateTo
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchDateFrom && matchDateTo && matchStatus
  })

  return (
    <div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Transaction History</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B' }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} results</span>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Txn ID', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-3 py-2" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-3 py-2">
                  <Link to={`/user/transactions/${r.id}`} className="font-mono cursor-pointer" style={{ color: '#37BBA2', fontSize: 11 }}>{r.id}</Link>
                </td>
                <td className="px-3 py-2">
                  <span style={{ color: '#04304B', fontSize: 13 }}>{r.type}</span>
                </td>
                <td className="px-3 py-2">
                  <span style={{ color: r.amount.startsWith('+') ? '#4CAF50' : '#F44336', fontSize: 13 }}>{r.amount}</span>
                </td>
                <td className="px-3 py-2">
                  <Components.StatusBadge status={r.status} size="sm" />
                </td>
                <td className="px-3 py-2">
                  <span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

