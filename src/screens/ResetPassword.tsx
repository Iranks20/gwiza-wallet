'use client'
import React from 'react'
import { Link } from '@/lib'

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFBFC' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#E5E7EB' }}>
        <h1 className="font-bold mb-2 text-center" style={{ color: '#04304B', fontSize: 20 }}>Reset Password</h1>
        <p className="text-center mb-6" style={{ color: '#6B7280', fontSize: 14 }}>
          Choose a new password for your account.
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#04304B', fontSize: 13 }}>New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', fontSize: 13 }}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#04304B', fontSize: 13 }}>Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', fontSize: 13 }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            Reset password
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

