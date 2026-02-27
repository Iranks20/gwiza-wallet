'use client'
import React from 'react'
import Components from '../components'

const rows = [
  { id: 'FEE-001', txnId: 'TXN-001842', chargedWallet: 'WLT-00291', creditedWallet: 'SYS-FEES', amount: '450.00', currency: 'KES', status: 'completed', date: '2024-03-20 14:22' },
  { id: 'FEE-002', txnId: 'TXN-001731', chargedWallet: 'WLT-00184', creditedWallet: 'SYS-FEES', amount: '100.00', currency: 'NGN', status: 'completed', date: '2024-03-18 09:15' },
]

export default function AdminFeesLedger() {
  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Fees Ledger"
          subtitle="Accounting view of all fees charged and settled"
        />

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Entry ID', 'Txn ID', 'Charged Wallet', 'Credited Wallet', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{r.id}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#37BBA2', fontSize: 12 }}>{r.txnId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.chargedWallet}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{r.creditedWallet}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#F44336', fontSize: 13 }}>{r.currency} {r.amount}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.date}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Components.AdminLayout>
  )
}

