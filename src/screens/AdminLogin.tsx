'use client'
import React, { useState } from 'react'
import { Link } from '@/lib'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { Button } from '@/components/ui/button'

const DEMO_ADMIN_EMAIL = 'admin@fintech.io'
const DEMO_ADMIN_PASSWORD = 'Admin123!'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL)
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      navigate('/admin/dashboard')
    } else {
      setError('Invalid admin credentials. Use admin@fintech.io / Admin123!')
    }
  }

  const handleGoogleError = (err: Error) => {
    console.error('Admin Google login error', err)
    setGoogleError('Google sign-in failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-secondary">
            <Wallet size={24} className="text-secondary-foreground" />
          </div>
          <h1 className="font-bold text-xl sm:text-2xl text-foreground mb-1">Admin Login</h1>
          <p className="text-center text-sm text-muted-foreground">Sign in to the backoffice dashboard.</p>
        </div>

        <p className="mb-3 text-xs text-center text-muted-foreground">
          Demo: <span className="text-foreground font-medium">{DEMO_ADMIN_EMAIL}</span> / <span className="text-foreground font-medium">{DEMO_ADMIN_PASSWORD}</span>
        </p>

        {(error || googleError) && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-error-muted text-error text-sm border border-error/30">
            {error || googleError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="admin@fintech.io"
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

          <Button type="submit" className="w-full py-6 bg-secondary hover:bg-secondary/90">
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
          <GoogleSignInButton loginType="admin" onError={handleGoogleError} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Not an admin?{' '}
          <Link to="/user/login" className="text-primary hover:underline font-medium">
            Go to wallet login
          </Link>
        </p>
      </div>
    </div>
  )
}
