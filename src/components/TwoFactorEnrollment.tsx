'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Loader2, Copy, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { mfaApi } from '@/api/mfa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function getUserAccountId(user: { user_account_id?: string | number } | null): string {
  if (!user?.user_account_id) return ''
  return String(user.user_account_id)
}

type Props = {
  onSuccess: () => void
  /** If true, no cancel button - user must complete */
  required?: boolean
  /** Compact layout for inline/card use */
  compact?: boolean
  className?: string
}

export function TwoFactorEnrollment({ onSuccess, required = false, compact = false, className }: Props) {
  const auth = useAuth()
  const user = auth.user
  const userAccountId = getUserAccountId(user)

  const [enrollStep, setEnrollStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [manualKey, setManualKey] = useState<string | null>(null)
  const [enrollToken, setEnrollToken] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [codesCopied, setCodesCopied] = useState(false)
  const [autoStarted, setAutoStarted] = useState(false)

  useEffect(() => {
    if (required && userAccountId && !autoStarted && !qrCode && !mfaLoading) {
      setAutoStarted(true)
      setMfaLoading(true)
      mfaApi
        .enrollStart(userAccountId)
        .then((res) => {
          setQrCode(res.qr_data_url ?? null)
          setManualKey(res.manual_key ?? null)
          setEnrollToken(res.manual_key ?? null)
        })
        .catch((e) => {
          setEnrollError(e instanceof Error ? e.message : 'Failed to start 2FA enrollment')
          setAutoStarted(false)
        })
        .finally(() => setMfaLoading(false))
    }
  }, [required, userAccountId, autoStarted, qrCode, mfaLoading])

  const handleEnrollStart = async () => {
    if (!userAccountId) return
    setEnrollStep('qr')
    setQrCode(null)
    setManualKey(null)
    setEnrollToken(null)
    setBackupCodes([])
    setEnrollCode('')
    setEnrollError(null)
    setMfaLoading(true)
    try {
      const res = await mfaApi.enrollStart(userAccountId)
      setQrCode(res.qr_data_url ?? null)
      setManualKey(res.manual_key ?? null)
      setEnrollToken(res.manual_key ?? null)
    } catch (e) {
      setEnrollError(e instanceof Error ? e.message : 'Failed to start 2FA enrollment')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleEnrollVerify = async () => {
    const code = enrollCode.replace(/\D/g, '').slice(0, 6)
    if (!enrollToken || code.length !== 6) {
      setEnrollError(enrollToken ? 'Enter the 6-digit code from your authenticator app' : 'Session expired. Please start again.')
      return
    }
    setEnrollSubmitting(true)
    setEnrollError(null)
    try {
      const res = await mfaApi.enrollVerify(userAccountId, enrollToken, code)
      if (res.backup_codes && res.backup_codes.length > 0) {
        setBackupCodes(res.backup_codes)
        setEnrollStep('backup')
      } else {
        auth.setUserMfaEnabled(true)
        onSuccess()
      }
    } catch (e) {
      setEnrollError(e instanceof Error ? e.message : 'Invalid code. Please try again.')
    } finally {
      setEnrollSubmitting(false)
    }
  }

  const handleCopyBackupCodes = async () => {
    if (backupCodes.length === 0) return
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      setCodesCopied(true)
      setTimeout(() => setCodesCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleBackupCodesSaved = () => {
    auth.setUserMfaEnabled(true)
    onSuccess()
  }

  const stepLabels = ['Add authenticator', 'Verify code', 'Save backup codes']
  const currentStepIndex = enrollStep === 'qr' ? 0 : enrollStep === 'verify' ? 1 : 2

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      {!compact && (
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    i < currentStepIndex && 'bg-success text-white',
                    i === currentStepIndex && 'bg-primary text-primary-foreground',
                    i > currentStepIndex && 'bg-muted text-muted-foreground'
                  )}
                >
                  {i < currentStepIndex ? <Check size={16} /> : i + 1}
                </div>
                <span className={cn('text-xs mt-1', i === currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={cn('w-8 sm:w-12 h-0.5', i < currentStepIndex ? 'bg-success' : 'bg-muted')} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Step 1: QR + manual key */}
        {enrollStep === 'qr' && (
          <div className="space-y-6">
            {!qrCode ? (
              <div className="text-center space-y-4">
                <p className="text-body text-muted-foreground">Preparing your 2FA setup…</p>
                <Button onClick={handleEnrollStart} disabled={mfaLoading}>
                  {mfaLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Starting…
                    </>
                  ) : (
                    'Start Setup'
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-center p-4 bg-white rounded-lg border border-border">
                  <img src={qrCode} alt="QR code for 2FA" className="w-48 h-48 object-contain" />
                </div>
                {manualKey && (
                  <div className="space-y-1.5">
                    <p className="text-meta text-muted-foreground">Or enter this key manually:</p>
                    <code className="block p-3 rounded-lg bg-muted text-sm break-all font-mono">{manualKey}</code>
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-meta text-muted-foreground">Compatible apps:</p>
                  <p className="text-sm text-foreground">Google Authenticator, Microsoft Authenticator, Authy, 1Password</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Verify */}
        {enrollStep === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enroll-code">Verification code</Label>
              <Input
                id="enroll-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={enrollCode}
                onChange={(e) => {
                  setEnrollCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setEnrollError(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Backup codes */}
        {enrollStep === 'backup' && backupCodes.length > 0 && (
          <div className="space-y-4">
            <p className="text-body text-muted-foreground">
              Store these backup codes securely. Each can be used once if you lose access to your authenticator.
            </p>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, i) => (
                  <span key={i} className="text-foreground">{code}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          {!required && enrollStep === 'qr' && qrCode && (
            <Button variant="outline" onClick={() => setEnrollStep('qr')}>
              Back
            </Button>
          )}
          <div className="flex-1 flex gap-3 justify-end">
            {enrollStep === 'qr' && qrCode && (
              <Button
                onClick={() => {
                  setEnrollStep('verify')
                  setEnrollCode('')
                  setEnrollError(null)
                }}
              >
                I&apos;ve Added the Account
              </Button>
            )}
            {enrollStep === 'verify' && (
              <Button
                onClick={handleEnrollVerify}
                disabled={enrollSubmitting || !enrollToken || enrollCode.replace(/\D/g, '').length !== 6}
              >
                {enrollSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            )}
            {enrollStep === 'backup' && (
              <>
                <Button variant="outline" onClick={handleCopyBackupCodes}>
                  {codesCopied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy All</>}
                </Button>
                <Button onClick={handleBackupCodesSaved}>I&apos;ve Saved These Codes</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
