'use client'

import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  loginType: 'admin' | 'user'
  children?: React.ReactNode
}

/**
 * Guards admin/user routes. If user is authenticated but doesn't have 2FA enabled,
 * redirects to /auth/setup-2fa to complete mandatory setup.
 */
export default function Require2FASetup({ loginType, children }: Props) {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.isAuthenticated || !auth.user) {
    const loginPath = `/auth?from=${loginType}`
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (!auth.user.mfa_enabled) {
    return <Navigate to={`/auth/setup-2fa?from=${loginType}`} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
