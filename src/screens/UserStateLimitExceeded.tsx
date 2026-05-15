'use client'
import React from 'react'

export default function UserStateLimitExceeded() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm text-center rounded-2xl border px-6 py-8" style={{ background: '#FFF7ED', borderColor: '#FDBA74' }}>
        <p className="text-xs mb-1" style={{ color: '#9A3412' }}>Limit exceeded</p>
        <h1 className="font-bold mb-2" style={{ color: '#9A3412', fontSize: 20 }}>Daily transaction limit reached</h1>
        <p className="mb-4" style={{ color: '#7C2D12', fontSize: 13 }}>
          You’ve reached your daily sending limit for this wallet. You can try again tomorrow or contact support to
          upgrade your limits.
        </p>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer mb-2"
          style={{ background: '#FFFFFF', color: '#9A3412', fontSize: 14 }}
        >
          View my limits
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

