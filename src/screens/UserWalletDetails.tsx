'use client'
import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Link } from '@/lib'
import Components from '../components'

const stubWallet = { id: 'WLT-001', currency: 'KES', balance: '45,200.00', ledgerBalance: '45,200.00', status: 'active' }
const stubTxns = [
  { id: 'TXN-001842', type: 'Received', amount: '+12,500', status: 'completed', date: '2024-03-20' },
  { id: 'TXN-001841', type: 'Sent', amount: '-3,200', status: 'completed', date: '2024-03-19' },
]
const stubFees = [
  { txnId: 'TXN-001842', amount: 'KES 25.00', type: 'Transfer fee', date: '2024-03-20' },
  { txnId: 'TXN-001841', amount: 'KES 15.00', type: 'Transfer fee', date: '2024-03-19' },
]

export default function UserWalletDetails() {
  const { walletId } = useParams<{ walletId: string }>()
  const [tab, setTab] = useState<'overview' | 'transactions' | 'fees'>('overview')
  const w = stubWallet

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/user/wallets" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← My Wallets</Link>
      </div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Wallet {walletId ?? w.id}</h1>

      <div className="rounded-xl border p-5 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Wallet ID</p>
            <p className="font-mono font-medium" style={{ color: '#04304B', fontSize: 14 }}>{w.id}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Currency</p>
            <p style={{ color: '#04304B', fontSize: 14 }}>{w.currency}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Available Balance</p>
            <p className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{w.balance}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Ledger Balance</p>
            <p style={{ color: '#04304B', fontSize: 14 }}>{w.ledgerBalance}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Status</p>
            <Components.StatusBadge status={w.status} size="sm" />
          </div>
        </div>
      </div>

      {/* Optional tabs: Transactions | Fees */}
      <div className="flex gap-2 mb-4 border-b" style={{ borderColor: '#E5E7EB' }}>
        {(['overview', 'transactions', 'fees'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-3 py-2 text-sm font-medium rounded-t-lg cursor-pointer capitalize"
            style={{
              color: tab === t ? '#037F67' : '#6B7280',
              borderBottom: tab === t ? '2px solid #37BBA2' : '2px solid transparent',
              background: tab === t ? '#E8F8F5' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
            <span className="text-sm font-medium" style={{ color: '#04304B' }}>Recent transactions</span>
          </div>
          <div className="p-4 text-center text-sm" style={{ color: '#9CA3AF' }}>Summary (stub). Use Transactions tab for list.</div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Txn ID', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-3 py-2" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stubTxns.map(t => (
                <tr key={t.id} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-3 py-2">
                    <Link to={`/user/transactions/${t.id}`} className="font-mono cursor-pointer" style={{ color: '#37BBA2', fontSize: 11 }}>{t.id}</Link>
                  </td>
                  <td className="px-3 py-2" style={{ color: '#04304B', fontSize: 13 }}>{t.type}</td>
                  <td className="px-3 py-2" style={{ color: t.amount.startsWith('+') ? '#4CAF50' : '#F44336', fontSize: 13 }}>{w.currency} {t.amount}</td>
                  <td className="px-3 py-2"><Components.StatusBadge status={t.status} size="sm" /></td>
                  <td className="px-3 py-2" style={{ color: '#9CA3AF', fontSize: 11 }}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fees' && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Txn ID', 'Type', 'Amount', 'Date'].map(h => (
                  <th key={h} className="text-left px-3 py-2" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stubFees.map((f, i) => (
                <tr key={i} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-3 py-2"><Link to={`/user/transactions/${f.txnId}`} className="font-mono cursor-pointer" style={{ color: '#37BBA2', fontSize: 11 }}>{f.txnId}</Link></td>
                  <td className="px-3 py-2" style={{ color: '#04304B', fontSize: 13 }}>{f.type}</td>
                  <td className="px-3 py-2" style={{ color: '#04304B', fontSize: 13 }}>{f.amount}</td>
                  <td className="px-3 py-2" style={{ color: '#9CA3AF', fontSize: 11 }}>{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
