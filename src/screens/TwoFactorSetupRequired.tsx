'use client'

import React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Shield, Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { TwoFactorEnrollment } from '@/components/TwoFactorEnrollment'

export default function TwoFactorSetupRequired() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = useAuth()
  const from = searchParams.get('from') ?? 'user'

  if (!auth.isAuthenticated || !auth.user) {
    navigate('/auth', { replace: true })
    return null
  }

  if (auth.user.mfa_enabled) {
    const target = from === 'admin' ? '/admin/dashboard' : '/user/overview'
    navigate(target, { replace: true })
    return null
  }

  const handleSuccess = () => {
    navigate(from === 'admin' ? '/admin/dashboard' : '/user/overview', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-primary/10">
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Complete Your Account Setup
          </h1>
          <p className="text-body text-muted-foreground max-w-md">
            Two-factor authentication is required to secure your account. Set it up now to continue.
          </p>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {auth.user.full_name ?? auth.user.email_address}
            </p>
            <p className="text-xs text-muted-foreground truncate">{auth.user.email_address}</p>
          </div>
        </div>

        {/* Enrollment flow */}
        <TwoFactorEnrollment onSuccess={handleSuccess} required />

        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Sign out and complete later
          </button>
        </p>
      </div>
    </div>
  )
}
