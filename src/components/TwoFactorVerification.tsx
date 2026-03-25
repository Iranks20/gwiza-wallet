'use client'

import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Shield, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  loginType: 'admin' | 'user'
}

export default function TwoFactorVerification({
  open,
  onClose,
  onSuccess,
  loginType,
}: Props) {
  const auth = useAuth()
  const navigate = useNavigate()
  const pending = auth.pending2FA
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = code.replace(/\D/g, '').slice(0, 6)
    if (digits.length !== 6 || !pending) {
      setError('Enter the 6-digit code from your authenticator app')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await authApi.mfaCompleteLogin(pending.mfaChallengeToken, digits)
      auth.complete2FALogin({
        user: result.user,
        access_token: result.access_token,
        token_type: result.token_type ?? 'Bearer',
        expires_in: result.expires_in ?? 0,
        scope: result.scope ?? '',
      })
      setCode('')
      onSuccess()
      const target = loginType === 'admin' ? '/admin/dashboard' : '/user/overview'
      navigate(target, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    auth.setPending2FAData(null)
    setCode('')
    setError(null)
    onClose()
  }

  if (!pending) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to complete sign in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError(null)
              }}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || code.length !== 6}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
