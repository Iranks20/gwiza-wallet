'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { Button } from '@/components/ui/button'

const DEMO_USER_IDENTIFIER = '+250781234567'
const DEMO_USER_PASSWORD = 'User123!'

export default function UserLogin() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-primary">
            <Wallet size={24} className="text-primary-foreground" />
          </div>
          <h1 className="font-bold text-xl sm:text-2xl text-foreground mb-1">Wallet Login</h1>
          <p className="text-center text-sm text-muted-foreground">Sign in to your wallet account.</p>
        </div>

        <p className="mb-3 text-xs text-center text-muted-foreground">
          Demo: <span className="text-foreground font-medium">{DEMO_USER_IDENTIFIER}</span> / <span className="text-foreground font-medium">{DEMO_USER_PASSWORD}</span>
        </p>

        {(error || googleError) && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-error-muted text-error text-sm border border-error/30">
            {error || googleError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="+2507..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 transition-colors"
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
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-border" />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full py-6">
            Login
          </Button>
        </form>

        <div className="mt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <GoogleSignInButton loginType="user" onError={handleGoogleError} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Admin?{' '}
          <Link to="/admin/login" className="text-foreground hover:underline font-medium">
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  )
}
