'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'

const DEMO_ADMIN_EMAIL = 'admin@fintech.io'
const DEMO_ADMIN_PASSWORD = 'Admin123!'
const DEMO_USER_IDENTIFIER = '+250781234567'
const DEMO_USER_PASSWORD = 'User123!'

type TabKey = 'admin' | 'user'

export default function AuthSplash() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [adminEmail, setAdminEmail] = useState(DEMO_ADMIN_EMAIL)
  const [adminPassword, setAdminPassword] = useState(DEMO_ADMIN_PASSWORD)
  const [userId, setUserId] = useState(DEMO_USER_IDENTIFIER)
  const [userPassword, setUserPassword] = useState(DEMO_USER_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = tab === 'admin'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isAdmin) {
      if (adminEmail === DEMO_ADMIN_EMAIL && adminPassword === DEMO_ADMIN_PASSWORD) {
        navigate('/admin/dashboard')
      } else {
        setError('Invalid admin credentials. Use admin@fintech.io / Admin123!')
      }
    } else {
      if (userId === DEMO_USER_IDENTIFIER && userPassword === DEMO_USER_PASSWORD) {
        navigate('/user/overview')
      } else {
        setError('Invalid wallet credentials. Use +250781234567 / User123!')
      }
    }
  }

  const demoLine = isAdmin
    ? `Demo: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`
    : `Demo: ${DEMO_USER_IDENTIFIER} / ${DEMO_USER_PASSWORD}`

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border"
        style={{ borderColor: '#E5E7EB' }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ background: '#37BBA2' }}
          >
            <Wallet size={24} color="white" />
          </div>
          <h1
            className="font-bold mb-1"
            style={{ color: '#04304B', fontSize: 22 }}
          >
            GwizaWallet
          </h1>
          <p
            className="text-center"
            style={{ color: '#6B7280', fontSize: 14 }}
          >
            Sign in to continue.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex mb-4 p-1 rounded-full border"
          style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}
        >
          {([
            { key: 'admin', label: 'Admin / Backoffice' },
            { key: 'user', label: 'Wallet User' },
          ] as { key: TabKey; label: string }[]).map(t => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key)
                  setError(null)
                }}
                className="flex-1 py-2 text-xs font-medium rounded-full cursor-pointer transition-colors"
                style={{
                  background: active ? '#E8F8F5' : 'transparent',
                  color: active ? '#037F67' : '#6B7280',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Demo hint */}
        <p
          className="mb-2 text-xs text-center"
          style={{ color: '#9CA3AF' }}
        >
          {demoLine}
        </p>

        {/* Error */}
        {error && (
          <div
            className="mb-3 text-xs px-3 py-2 rounded-lg"
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isAdmin ? (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#04304B', fontSize: 13 }}
                >
                  Admin email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#E5E7EB', fontSize: 13 }}
                  placeholder="admin@fintech.io"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#04304B', fontSize: 13 }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
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
            </>
          ) : (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#04304B', fontSize: 13 }}
                >
                  Email or phone
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#E5E7EB', fontSize: 13 }}
                  placeholder="+2507..."
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#04304B', fontSize: 13 }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
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
            </>
          )}

          <div
            className="flex items-center justify-between text-xs"
            style={{ color: '#6B7280' }}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border"
                style={{ borderColor: '#E5E7EB' }}
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="cursor-pointer"
              style={{ color: '#37BBA2' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer mt-1"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {isAdmin ? 'Login as admin' : 'Login to wallet'}
          </button>
        </form>
      </div>
    </div>
  )
}


