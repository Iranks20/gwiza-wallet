import React, { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { GoogleLogin } from '@react-oauth/google'
import { FEATURE_FLAGS, GOOGLE_CONFIG } from '@/config/environment'
import { verifyIdTokenWithBackend } from '@/services/googleAuth'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  loginType?: 'admin' | 'user'
  onSuccess?: () => void
  onError?: (error: Error) => void
  onRequires2FA?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  disabled?: boolean
}

const DEFAULT_BUTTON_WIDTH_PX = 384

export default function GoogleSignInButton({
  loginType = 'user',
  onSuccess,
  onError,
  onRequires2FA,
  text = 'continue_with',
  disabled,
}: Props) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonWidthPx, setButtonWidthPx] = useState(DEFAULT_BUTTON_WIDTH_PX)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = Math.floor(el.getBoundingClientRect().width)
      if (w > 0) setButtonWidthPx(w)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!FEATURE_FLAGS.ENABLE_GOOGLE_AUTH || !GOOGLE_CONFIG.CLIENT_ID) {
    return null
  }

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      onError?.(new Error('No credential returned from Google'))
      return
    }
    setLoading(true)
    try {
      const result = await verifyIdTokenWithBackend(idToken)
      if ('requires2FA' in result && result.requires2FA) {
        auth.setPending2FAData({
          mfaChallengeToken: result.mfaChallengeToken,
          user: result.user,
          loginType: loginType ?? 'user',
        })
        onRequires2FA?.()
      } else if ('access_token' in result) {
        auth.setAuth(result)
        onSuccess?.()
        const needs2FASetup = result.user?.mfa_enabled === false
        const target = needs2FASetup
          ? `/auth/setup-2fa?from=${loginType ?? 'user'}`
          : loginType === 'admin'
            ? '/admin/dashboard'
            : '/user/overview'
        navigate(target, { replace: true })
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Google sign-in failed')
      if (FEATURE_FLAGS.ENABLE_CONSOLE_LOGS || FEATURE_FLAGS.DEBUG_MODE) {
        // eslint-disable-next-line no-console
        console.error('Google sign-in error', err)
      }
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handleError = () => {
    onError?.(new Error('Google sign-in was cancelled or failed'))
  }

  const isDisabled = disabled || loading

  return (
    <div
      className={`w-full mt-3 flex justify-center ${isDisabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div
        ref={containerRef}
        className="w-full max-w-sm min-w-0 mx-auto [&_.g_id_signin]:!w-full"
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          size="large"
          type="standard"
          text={text}
          shape="rectangular"
          logo_alignment="center"
          width={buttonWidthPx}
          containerProps={{
            className: 'w-full',
            style: { width: '100%', maxWidth: '100%' },
          }}
        />
      </div>
    </div>
  )
}
