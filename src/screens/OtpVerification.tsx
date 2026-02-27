'use client'
import React from 'react'
import { Link } from '@/lib'

export default function OtpVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#E5E7EB' }}>
        <h1 className="font-bold mb-2 text-center" style={{ color: '#04304B', fontSize: 20 }}>Enter Verification Code</h1>
        <p className="text-center mb-6" style={{ color: '#6B7280', fontSize: 14 }}>
          We’ve sent a 6-digit code to your email/phone.
        </p>

        <div className="flex justify-between gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              maxLength={1}
              className="w-10 h-10 text-center border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', fontSize: 16 }}
            />
          ))}
        </div>

        <button
          className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer mb-3"
          style={{ background: '#37BBA2', fontSize: 14 }}
        >
          Verify Code
        </button>

        <p className="text-center text-xs mb-1" style={{ color: '#9CA3AF' }}>
          Didn’t receive the code? <span style={{ color: '#37BBA2' }}>Resend in 00:30</span>
        </p>
        <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
          <Link to="/auth" className="cursor-pointer" style={{ color: '#37BBA2' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

