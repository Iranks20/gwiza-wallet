'use client'
import React from 'react'

export default function UserStatePending() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm text-center rounded-2xl border px-6 py-8" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
        <p className="text-xs mb-1" style={{ color: '#1D4ED8' }}>Pending</p>
        <h1 className="font-bold mb-2" style={{ color: '#1D4ED8', fontSize: 20 }}>Transaction is processing</h1>
        <p className="mb-4" style={{ color: '#1E3A8A', fontSize: 13 }}>
          Your transaction has been received and is being processed. You’ll see the final status in your activity
          shortly.
        </p>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer mb-2"
          style={{ background: '#FFFFFF', color: '#1D4ED8', fontSize: 14 }}
        >
          View in activity
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

