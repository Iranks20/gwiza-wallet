'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  getStoredAuth,
  setAuthFromResult,
  clearStoredAuth,
  type GoogleAuthResult,
} from '@/services/googleAuth'

export type AuthUser = GoogleAuthResult['user']

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (result: GoogleAuthResult) => void
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

  const refresh = useCallback(() => {
    setAuthState(getStoredAuth())
  }, [])

  const setAuth = useCallback((result: GoogleAuthResult) => {
    setAuthFromResult(result)
    setAuthState(result)
  }, [])

  const signOut = useCallback(() => {
    clearStoredAuth()
    setAuthState(null)
    navigate('/auth', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.access_token ?? null,
      isAuthenticated: Boolean(auth?.user && auth?.access_token),
      setAuth,
      signOut,
      refresh,
    }),
    [auth, setAuth, signOut, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
