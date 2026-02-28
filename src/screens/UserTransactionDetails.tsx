'use client'
import React from 'react'
import { useParams } from 'react-router'
import { Link } from '@/lib'
import Components from '../components'

const stub = { id: 'TXN-001842', type: 'Received from John', amount: '+KES 12,500', status: 'completed', date: '2024-03-20 14:22', fees: 'KES 25.00' }

export default function UserTransactionDetails() {
  const { txnId } = useParams<{ txnId: string }>()
  const t = stub

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/user/transactions" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Transaction History</Link>
      </div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Transaction {txnId ?? t.id}</h1>

      <div className="rounded-xl border p-5 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Transaction ID</p>
            <p className="font-mono font-medium" style={{ color: '#04304B', fontSize: 14 }}>{t.id}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Type</p>
            <p style={{ color: '#04304B', fontSize: 14 }}>{t.type}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Amount</p>
            <p className="font-semibold" style={{ color: t.amount.startsWith('+') ? '#4CAF50' : '#F44336', fontSize: 18 }}>{t.amount}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Status</p>
            <Components.StatusBadge status={t.status} size="sm" />
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Date</p>
            <p style={{ color: '#04304B', fontSize: 14 }}>{t.date}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Fees</p>
            <p style={{ color: '#04304B', fontSize: 14 }}>{t.fees}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
