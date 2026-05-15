'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'

export default function UserSend() {
  const [amount, setAmount] = useState('0')

  return (
    <div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Send money</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Recipient (Wallet ID / Account / MSISDN)</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
            style={{ borderColor: '#E5E7EB', fontSize: 13 }}
            placeholder="WLT-00291 or +2507..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
            style={{ borderColor: '#E5E7EB', fontSize: 13 }}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Note (optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
            style={{ borderColor: '#E5E7EB', fontSize: 13 }}
            placeholder="e.g. Rent payment"
          />
        </div>

        <div className="rounded-xl border p-3 text-sm" style={{ background: '#FAFBFC', borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ color: '#6B7280' }}>Amount</span>
            <span style={{ color: '#04304B' }}>KES {Number(amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span style={{ color: '#6B7280' }}>Estimated fee</span>
            <span style={{ color: '#F44336' }}>KES 15.00</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#04304B', fontWeight: 600 }}>Total</span>
            <span style={{ color: '#04304B', fontWeight: 600 }}>
              KES {(Number(amount || 0) + 15).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer"
          style={{ background: '#37BBA2', fontSize: 14 }}
        >
          Continue
        </button>

        <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
          Transfers are subject to your{' '}
          <Link to="/user/profile" className="cursor-pointer" style={{ color: '#37BBA2' }}>
            limits and rules
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

