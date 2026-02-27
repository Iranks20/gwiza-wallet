'use client'
import React from 'react'
import { Link } from '@/lib'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const txns = [
  { id: 'TXN-001842', type: 'Received from John', amount: '+KES 12,500', status: 'completed', time: '2h ago' },
  { id: 'TXN-001841', type: 'Sent to Utility', amount: '-KES 3,200', status: 'completed', time: 'Yesterday' },
  { id: 'TXN-001840', type: 'Cash out ATM', amount: '-KES 1,000', status: 'pending', time: '2 days ago' },
]

export default function UserHome() {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Available balance</p>
          <p className="font-bold" style={{ color: '#04304B', fontSize: 24 }}>KES 45,200.00</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Ledger: KES 45,200.00</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Link
              to="/user/send"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{ background: '#37BBA2', color: '#FFFFFF' }}
            >
              <ArrowUpRight size={14} />
              <span>Send</span>
            </Link>
            <Link
              to="/user/receive"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{ background: '#E8F8F5', color: '#037F67' }}
            >
              <ArrowDownLeft size={14} />
              <span>Receive</span>
            </Link>
          </div>
          <p className="text-[11px]" style={{ color: '#9CA3AF' }}>Quick actions</p>
        </div>
      </div>

      <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
          <span className="text-sm font-medium" style={{ color: '#04304B' }}>Recent transactions</span>
          <Link to="/user/transactions" className="text-xs cursor-pointer" style={{ color: '#37BBA2' }}>
            View all
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
          {txns.map(t => (
            <div key={t.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#04304B' }}>{t.type}</p>
                <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{t.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: t.amount.startsWith('+') ? '#4CAF50' : '#F44336' }}>{t.amount}</p>
                <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{t.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

