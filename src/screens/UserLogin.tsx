'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import TwoFactorVerification from '@/components/TwoFactorVerification'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const DEMO_USER_IDENTIFIER = '+250781234567'
const DEMO_USER_PASSWORD = 'User123!'

export default function UserLogin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const show2FA = auth.pending2FA?.loginType === 'user'
  const [identifier, setIdentifier] = useState(DEMO_USER_IDENTIFIER)
  const [password, setPassword] = useState(DEMO_USER_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (identifier === DEMO_USER_IDENTIFIER && password === DEMO_USER_PASSWORD) {
      navigate('/user/overview')
    } else {
      setError('Invalid wallet credentials. Use +250781234567 / User123!')
    }
  }

  const handleGoogleError = (err: Error) => {
    setGoogleError(err.message || 'Google sign-in failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 sm:p-10 border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-primary">
            <Wallet size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-page-title text-foreground mb-2">Wallet Login</h1>
          <p className="text-center text-caption text-muted-foreground">Sign in to your wallet account.</p>
        </div>

        <p className="mb-4 text-meta text-center text-muted-foreground">
          Demo: <span className="text-foreground font-medium">{DEMO_USER_IDENTIFIER}</span> / <span className="text-foreground font-medium">{DEMO_USER_PASSWORD}</span>
        </p>

        {(error || googleError) && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-error-muted text-error text-body border border-error/30">
            {error || googleError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-caption font-medium mb-1.5 text-foreground">Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-3 border border-input rounded-lg text-body text-foreground bg-background placeholder:text-muted-foreground transition-all duration-150"
              placeholder="+2507..."
            />
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5 text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 border border-input rounded-lg text-body text-foreground bg-background placeholder:text-muted-foreground pr-10 transition-all duration-150"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-meta text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-border" />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full py-3.5 text-body font-medium">
            Login
          </Button>
        </form>

        <div className="mt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-meta font-medium uppercase tracking-wider text-muted-foreground">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <GoogleSignInButton loginType="user" onError={handleGoogleError} />
        </div>

        <TwoFactorVerification
          open={show2FA}
          onClose={() => auth.setPending2FAData(null)}
          onSuccess={() => navigate('/user/overview', { replace: true })}
          loginType="user"
        />

        <p className="mt-5 text-center text-meta text-muted-foreground">
          Admin?{' '}
          <Link to="/auth?from=admin" className="text-foreground hover:underline font-medium">
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  )
}
