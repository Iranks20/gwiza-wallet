'use client'
import React from 'react'
import { Link } from '@/lib'
import Components from '../components'

const wallets = [
  { id: 'WLT-001', currency: 'KES', balance: '45,200.00', ledgerBalance: '45,200.00', status: 'active' },
  { id: 'WLT-002', currency: 'USD', balance: '120.50', ledgerBalance: '120.50', status: 'active' },
]

export default function UserWallets() {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>My Wallets</h1>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Wallet ID', 'Currency', 'Balance', 'Ledger Balance', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-2" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wallets.map(w => (
              <tr key={w.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-3 py-2">
                  <Link to={`/user/wallets/${w.id}`} className="font-mono cursor-pointer" style={{ color: '#37BBA2', fontSize: 13 }}>{w.id}</Link>
                </td>
                <td className="px-3 py-2"><span style={{ color: '#04304B', fontSize: 13 }}>{w.currency}</span></td>
                <td className="px-3 py-2"><span style={{ color: '#04304B', fontSize: 13 }}>{w.balance}</span></td>
                <td className="px-3 py-2"><span style={{ color: '#6B7280', fontSize: 13 }}>{w.ledgerBalance}</span></td>
                <td className="px-3 py-2"><Components.StatusBadge status={w.status} size="sm" /></td>
                <td className="px-3 py-2">
                  <Link to={`/user/wallets/${w.id}`} className="text-xs font-medium cursor-pointer" style={{ color: '#37BBA2' }}>Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
