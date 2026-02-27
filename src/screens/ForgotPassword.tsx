'use client'
import React from 'react'
import { Link } from '@/lib'
import { Mail } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#E8F8F5' }}>
            <Mail size={24} style={{ color: '#37BBA2' }} />
          </div>
          <h1 className="font-bold mb-1" style={{ color: '#04304B', fontSize: 20 }}>Forgot Password</h1>
          <p className="text-center" style={{ color: '#6B7280', fontSize: 14 }}>Enter your email or phone to receive a reset link or code.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#04304B', fontSize: 13 }}>Email or Phone</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', fontSize: 13 }}
              placeholder="you@example.com or +2507..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            Send reset code
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: '#9CA3AF' }}>
          Remembered your password?{' '}
          <Link to="/auth" className="cursor-pointer" style={{ color: '#37BBA2' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

