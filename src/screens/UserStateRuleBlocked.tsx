'use client'
import React from 'react'

export default function UserStateRuleBlocked() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm text-center rounded-2xl border px-6 py-8" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
        <p className="text-xs mb-1" style={{ color: '#B91C1C' }}>Transaction blocked</p>
        <h1 className="font-bold mb-2" style={{ color: '#B91C1C', fontSize: 20 }}>Blocked by platform rules</h1>
        <p className="mb-4" style={{ color: '#7F1D1D', fontSize: 13 }}>
          This transaction violates one of our risk or compliance rules and cannot be processed. For your safety, no
          funds have been moved.
        </p>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer mb-2"
          style={{ background: '#FFFFFF', color: '#B91C1C', fontSize: 14 }}
        >
          View details
        </button>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer"
          style={{ background: '#37BBA2', color: '#FFFFFF', fontSize: 14 }}
        >
          Back to home
        </button>
      </div>
    </div>
  )
}

