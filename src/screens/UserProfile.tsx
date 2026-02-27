'use client'
import React from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function UserProfile() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/auth')
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Logged in as</p>
          <p className="font-semibold" style={{ color: '#04304B', fontSize: 16 }}>Jane Doe</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>+250781234567 · jane@example.com</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: '#FEF2F2' }}
        >
          <LogOut size={18} style={{ color: '#F44336' }} />
        </button>
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>Profile</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Profile type</p>
            <p style={{ color: '#04304B' }}>Personal</p>
          </div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Country</p>
            <p style={{ color: '#04304B' }}>Rwanda</p>
          </div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>KYC tier</p>
            <p style={{ color: '#04304B' }}>Gold</p>
          </div>
          <div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Status</p>
            <p style={{ color: '#4CAF50' }}>Active</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>Limits</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: '#6B7280' }}>Per transaction</span>
            <span style={{ color: '#04304B' }}>KES 50,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: '#6B7280' }}>Daily</span>
            <span style={{ color: '#04304B' }}>KES 100,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: '#6B7280' }}>Monthly</span>
            <span style={{ color: '#04304B' }}>KES 1,000,000</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>Settings</p>
        <button className="w-full text-left py-2 text-sm cursor-pointer border-b" style={{ borderColor: '#F3F4F6', color: '#04304B' }}>
          Change password
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left py-2 text-sm cursor-pointer"
          style={{ color: '#F44336' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

