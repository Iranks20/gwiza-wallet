'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'

export default function UserFeesByDateRange() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  return (
    <div>
      <div className="mb-4">
        <Link to="/user/fees" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Fees</Link>
      </div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Fees by Date Range</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B' }}
        />
        <input
          type="date"
          value={end}
          onChange={e => setEnd(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B' }}
        />
        <button
          type="button"
          className="px-4 py-2 rounded-lg font-medium text-white cursor-pointer"
          style={{ background: '#37BBA2' }}
        >
          Search
        </button>
      </div>

      <div className="rounded-xl border p-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <p className="text-sm text-center" style={{ color: '#9CA3AF' }}>Fees in date range (stub). API can be wired later.</p>
      </div>
    </div>
  )
}
