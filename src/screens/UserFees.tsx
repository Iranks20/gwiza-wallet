'use client'
import React from 'react'
import { Link } from '@/lib'

export default function UserFees() {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Fees</h1>
      <p className="mb-4 text-sm" style={{ color: '#6B7280' }}>View fees by transaction or by date range.</p>

      <div className="flex flex-col gap-3 max-w-sm">
        <Link
          to="/user/fees/by-transaction"
          className="block p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <span className="font-medium" style={{ color: '#04304B', fontSize: 14 }}>Fees by Transaction</span>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Enter a transaction ID to list fees</p>
        </Link>
        <Link
          to="/user/fees/by-date-range"
          className="block p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <span className="font-medium" style={{ color: '#04304B', fontSize: 14 }}>Fees by Date Range</span>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Filter fees by start and end date</p>
        </Link>
      </div>
    </div>
  )
}
