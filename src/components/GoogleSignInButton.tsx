import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { GoogleLogin } from '@react-oauth/google'
import { FEATURE_FLAGS, GOOGLE_CONFIG } from '@/config/environment'
import { verifyIdTokenWithBackend } from '@/services/googleAuth'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  loginType?: 'admin' | 'user'
  onSuccess?: () => void
  onError?: (error: Error) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  disabled?: boolean
}

export default function GoogleSignInButton({
  loginType,
  onSuccess,
  onError,
  text = 'continue_with',
  disabled,
}: Props) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)

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
      auth.setAuth(result)
      onSuccess?.()
      const target = loginType === 'admin' ? '/admin/dashboard' : '/user/overview'
      navigate(target, { replace: true })
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
      className={`w-full mt-3 flex justify-center [&_.g_id_signin]:!w-full ${isDisabled ? 'pointer-events-none opacity-60' : ''}`}
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
        width="100%"
        containerProps={{
          style: { width: '100%' },
        }}
      />
    </div>
  )
}
