'use client'

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'

/**
 * Legacy OAuth redirect callback is no longer used.
 * Google sign-in now uses frontend token flow (GIS + backend verify).
 * Redirect any /auth/callback visits to the login page.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/auth', { replace: true })
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}
    >
      <p className="text-center" style={{ color: '#04304B' }}>
        Redirecting to sign in…
      </p>
    </div>
  )
}
