'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  const [googleError, setGoogleError] = useState<string | null>(null)

  const isAdmin = tab === 'admin'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setGoogleError(null)

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

  const inputClass = "w-full px-3 py-2.5 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-primary">
            <Wallet size={24} className="text-primary-foreground" />
          </div>
          <h1 className="font-bold text-xl sm:text-2xl text-foreground mb-1">GwizaWallet</h1>
          <p className="text-center text-sm text-muted-foreground">Sign in to continue.</p>
        </div>

        <div className="flex mb-4 p-1 rounded-full border border-border bg-muted">
          {(['admin', 'user'] as TabKey[]).map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null) }}
                className={cn(
                  'flex-1 py-2 text-xs font-medium rounded-full cursor-pointer transition-colors',
                  active ? 'bg-primary-muted text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'admin' ? 'Admin / Backoffice' : 'Wallet User'}
              </button>
            )
          })}
        </div>

        <p className="mb-2 text-xs text-center text-muted-foreground">{demoLine}</p>

        {(error || googleError) && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-error-muted text-error text-sm border border-error/30">
            {error || googleError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isAdmin ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Admin email</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className={inputClass} placeholder="admin@fintech.io" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className={cn(inputClass, 'pr-10')} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Email or phone</label>
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className={inputClass} placeholder="+2507..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={userPassword} onChange={e => setUserPassword(e.target.value)} className={cn(inputClass, 'pr-10')} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-border" />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" className="w-full py-6">
            {isAdmin ? 'Login as admin' : 'Login to wallet'}
          </Button>
        </form>

        <div className="mt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <GoogleSignInButton loginType={isAdmin ? 'admin' : 'user'} onError={err => { console.error('Auth splash Google login error', err); setGoogleError('Google sign-in failed. Please try again.') }} />
        </div>
      </div>
    </div>
  )
}
