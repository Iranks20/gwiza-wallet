'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  getStoredAuth,
  setAuthFromResult,
  clearStoredAuth,
  updateStoredUser,
  type GoogleAuthResult,
  type MenuOption,
} from '@/services/googleAuth'

export type AuthUser = GoogleAuthResult['user']

export type Pending2FAData = {
  mfaChallengeToken: string
  user: AuthUser
  loginType: 'admin' | 'user'
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  menuOptions: MenuOption[]
  pending2FA: Pending2FAData | null
  setAuth: (result: GoogleAuthResult) => void
  setPending2FAData: (data: Pending2FAData | null) => void
  complete2FALogin: (result: GoogleAuthResult) => void
  setUserMfaEnabled: (enabled: boolean) => void
  signOut: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}

/** Derive initials from full_name, e.g. "IRANKUNDA INNOCENT" -> "II" */
export function getUserInitials(fullName: string | undefined): string {
  if (!fullName?.trim()) return '?'
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return fullName.slice(0, 2).toUpperCase()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [auth, setAuthState] = useState<GoogleAuthResult | null>(() => getStoredAuth())
  const [pending2FA, setPending2FA] = useState<Pending2FAData | null>(null)

  const refresh = useCallback(() => {
    setAuthState(getStoredAuth())
  }, [])

  const setAuth = useCallback((result: GoogleAuthResult) => {
    setAuthFromResult(result)
    setAuthState(result)
  }, [])

  const setPending2FAData = useCallback((data: Pending2FAData | null) => {
    setPending2FA(data)
  }, [])

  const complete2FALogin = useCallback((result: GoogleAuthResult) => {
    const finalResult: GoogleAuthResult = {
      ...result,
      menuOptions: result.menuOptions ?? [],
    }
    setAuthFromResult(finalResult)
    setAuthState(finalResult)
    setPending2FA(null)
  }, [])

  const setUserMfaEnabled = useCallback((enabled: boolean) => {
    updateStoredUser({ mfa_enabled: enabled })
    setAuthState((prev) =>
      prev?.user ? { ...prev, user: { ...prev.user, mfa_enabled: enabled } } : prev
    )
  }, [])

  const signOut = useCallback(() => {
    clearStoredAuth()
    setAuthState(null)
    setPending2FA(null)
    navigate('/auth', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.access_token ?? null,
      isAuthenticated: Boolean(auth?.user && auth?.access_token),
      menuOptions: auth?.menuOptions ?? [],
      pending2FA,
      setAuth,
      setPending2FAData,
      complete2FALogin,
      setUserMfaEnabled,
      signOut,
      refresh,
    }),
    [auth, pending2FA, setAuth, setPending2FAData, complete2FALogin, setUserMfaEnabled, signOut, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
