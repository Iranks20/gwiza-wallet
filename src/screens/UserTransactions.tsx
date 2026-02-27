'use client'
import React from 'react'
import Components from '../components'

const rows = [
  { id: 'TXN-001842', type: 'Received from John', amount: '+KES 12,500', status: 'completed', date: '2024-03-20 14:22' },
  { id: 'TXN-001841', type: 'Sent to Utility', amount: '-KES 3,200', status: 'completed', date: '2024-03-19 18:10' },
  { id: 'TXN-001840', type: 'Cash out ATM', amount: '-KES 1,000', status: 'pending', date: '2024-03-18 09:02' },
]

export default function UserTransactions() {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Transactions</h1>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <table className="w-full">
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
            {rows.map(r => (
              <tr key={r.id} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-3 py-2">
                  <span className="font-mono" style={{ color: '#04304B', fontSize: 11 }}>{r.id}</span>
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
        </table>
      </div>
    </div>
  )
}

