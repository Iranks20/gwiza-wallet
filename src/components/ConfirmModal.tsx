'use client'
import React from 'react'
import { Trash2 } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm text-center"
        style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
          <Trash2 size={22} style={{ color: '#F44336' }} />
        </div>
        <h3 className="font-bold mb-2" style={{ color: '#04304B', fontSize: 16 }}>{title}</h3>
        <div className="text-sm mb-5" style={{ color: '#6B7280' }}>{message}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: '#F44336', fontSize: 14 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
