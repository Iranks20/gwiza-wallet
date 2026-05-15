'use client'
import React from 'react'

export default function UserStateSuccess() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm text-center rounded-2xl border px-6 py-8" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
        <p className="text-xs mb-1" style={{ color: '#166534' }}>Success</p>
        <h1 className="font-bold mb-2" style={{ color: '#166534', fontSize: 20 }}>Transaction completed</h1>
        <p className="mb-4" style={{ color: '#15803D', fontSize: 13 }}>
          Your payment has been sent successfully. The recipient will receive funds shortly.
        </p>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer mb-2"
          style={{ background: '#37BBA2', color: '#FFFFFF', fontSize: 14 }}
        >
          Done
        </button>
        <button
          className="w-full py-2.5 rounded-lg font-medium cursor-pointer"
          style={{ background: '#FFFFFF', color: '#166534', fontSize: 14 }}
        >
          View transaction
        </button>
      </div>
    </div>
  )
}

