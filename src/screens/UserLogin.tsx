'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'

const DEMO_USER_IDENTIFIER = '+250781234567'
const DEMO_USER_PASSWORD = 'User123!'

export default function UserLogin() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState(DEMO_USER_IDENTIFIER)
  const [password, setPassword] = useState(DEMO_USER_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (identifier === DEMO_USER_IDENTIFIER && password === DEMO_USER_PASSWORD) {
      navigate('/user/home')
    } else {
      setError('Invalid wallet credentials. Use +250781234567 / User123!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#37BBA2' }}>
            <Wallet size={24} color="white" />
          </div>
          <h1 className="font-bold mb-1" style={{ color: '#04304B', fontSize: 22 }}>Wallet Login</h1>
          <p className="text-center" style={{ color: '#6B7280', fontSize: 14 }}>Sign in to your wallet account.</p>
        </div>

        <div className="mb-3 text-xs text-center" style={{ color: '#9CA3AF' }}>
          Demo login: <span style={{ color: '#04304B' }}>{DEMO_USER_IDENTIFIER}</span> / <span style={{ color: '#04304B' }}>{DEMO_USER_PASSWORD}</span>
        </div>

        {error && (
          <div className="mb-3 text-xs px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#04304B', fontSize: 13 }}>Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', fontSize: 13 }}
              placeholder="+2507..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#04304B', fontSize: 13 }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none pr-10"
                style={{ borderColor: '#E5E7EB', fontSize: 13 }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: '#6B7280' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border" style={{ borderColor: '#E5E7EB' }} />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="cursor-pointer" style={{ color: '#37BBA2' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer mt-2"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: '#9CA3AF' }}>
          Admin?{' '}
          <Link to="/admin/login" className="cursor-pointer" style={{ color: '#04304B' }}>
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  )
}

