'use client'

import React, { useState } from 'react'
import { Link } from 'react-router'
import { Shield, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

type Props = {
  profilePath?: string
  className?: string
}

export default function TwoFactorRequirementBanner({ profilePath = '/user/profile', className }: Props) {
  const auth = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const mfaEnabled = auth.user?.mfa_enabled ?? false
  if (mfaEnabled || dismissed) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-error/30 bg-error-muted text-error',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Shield size={18} className="shrink-0" />
        <p className="text-sm font-medium">
          Enable Two-Factor Authentication to secure your account.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={profilePath}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-error text-white hover:bg-error/90 transition-colors"
        >
          Enable 2FA Now
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded hover:bg-error/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
