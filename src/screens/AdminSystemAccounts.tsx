'use client'
import React from 'react'
import Components from '../components'

const rows = [
  { id: 'SYS-FEES', name: 'Fees Ledger Account', country: 'Kenya', currency: 'KES', walletId: 'WLT-SYS-001', status: 'active' },
  { id: 'SYS-SETTLE', name: 'Settlement Account', country: 'Nigeria', currency: 'NGN', walletId: 'WLT-SYS-002', status: 'active' },
]

export default function AdminSystemAccounts({ country, embedded }: { country?: string; embedded?: boolean }) {
  const filtered = rows.filter(r => !country || r.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="System Accounts"
          subtitle="Internal ledger accounts powering the wallet and fee engine"
        />
      )}

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Account Code', 'Name', 'Country', 'Currency', 'Linked Wallet', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{r.id}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.name}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.country}</span></td>
                  <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currency}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{r.walletId}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )

  if (embedded) return content
  return <Components.AdminLayout>{content}</Components.AdminLayout>
}

