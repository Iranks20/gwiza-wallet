'use client'
import React from 'react'
import { Copy } from 'lucide-react'

export default function UserReceive() {
  const walletId = 'WLT-00291'
  const accountNo = 'ACC-8821029'

  return (
    <div>
      <h1 className="font-semibold mb-3" style={{ color: '#04304B', fontSize: 18 }}>Receive money</h1>

      <div className="rounded-xl border p-4 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Wallet ID</p>
        <div className="flex items-center justify-between">
          <span className="font-mono font-semibold" style={{ color: '#04304B' }}>{walletId}</span>
          <button className="px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer" style={{ background: '#F3F4F6', color: '#6B7280' }}>
            <Copy size={12} /> Copy
          </button>
        </div>
        <p className="text-xs mt-3 mb-1" style={{ color: '#6B7280' }}>Account number</p>
        <div className="flex items-center justify-between">
          <span className="font-mono" style={{ color: '#04304B' }}>{accountNo}</span>
          <button className="px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer" style={{ background: '#F3F4F6', color: '#6B7280' }}>
            <Copy size={12} /> Copy
          </button>
        </div>
      </div>

      <div className="rounded-xl border p-4 text-center" style={{ background: '#FAFBFC', borderColor: '#E5E7EB' }}>
        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>QR code (placeholder)</p>
        <div className="w-32 h-32 mx-auto rounded-lg border border-dashed" style={{ borderColor: '#D1D5DB', background: '#FFFFFF' }} />
        <p className="text-[11px] mt-3" style={{ color: '#9CA3AF' }}>
          Share this QR or your wallet details to receive money.
        </p>
      </div>
    </div>
  )
}

