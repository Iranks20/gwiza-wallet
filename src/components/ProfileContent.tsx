'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { LogOut, Shield, ShieldCheck, Loader2, Copy, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { mfaApi } from '@/api/mfa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function getUserAccountId(user: { user_account_id?: string | number } | null): string {
  if (!user?.user_account_id) return ''
  return String(user.user_account_id)
}

export function ProfileContent() {
  const auth = useAuth()
  const user = auth.user
  const userAccountId = getUserAccountId(user)

  const displayName = user?.full_name ?? 'User'
  const displayEmail = user?.email_address ?? '—'
  const status = (user?.user_account_status ?? 'active').toLowerCase()
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)

  const [mfaEnabled, setMfaEnabled] = useState<boolean>(user?.mfa_enabled ?? false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaStatusLoading, setMfaStatusLoading] = useState(true)

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollStep, setEnrollStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [manualKey, setManualKey] = useState<string | null>(null)
  const [enrollToken, setEnrollToken] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)
  const [codesCopied, setCodesCopied] = useState(false)

  const fetchMfaStatus = useCallback(async () => {
    if (!userAccountId) {
      setMfaStatusLoading(false)
      return
    }
    setMfaStatusLoading(true)
    try {
      const res = await mfaApi.status(userAccountId)
      setMfaEnabled(res.mfa_enabled ?? false)
    } catch {
      setMfaEnabled(user?.mfa_enabled ?? false)
    } finally {
      setMfaStatusLoading(false)
    }
  }, [userAccountId, user?.mfa_enabled])

  useEffect(() => {
    fetchMfaStatus()
  }, [fetchMfaStatus])

  const handleEnrollStart = async () => {
    if (!userAccountId) return
    setEnrollOpen(true)
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
      setEnrollError(enrollToken ? 'Enter the 6-digit code from your authenticator app' : 'Session expired. Please start enrollment again.')
      return
    }
    setEnrollSubmitting(true)
    setEnrollError(null)
    try {
      const res = await mfaApi.enrollVerify(userAccountId, enrollToken, code)
      setMfaEnabled(true)
      auth.setUserMfaEnabled(true)
      if (res.backup_codes && res.backup_codes.length > 0) {
        setBackupCodes(res.backup_codes)
        setEnrollStep('backup')
      } else {
        setEnrollOpen(false)
        setEnrollStep('qr')
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
    setEnrollOpen(false)
    setEnrollStep('qr')
    setBackupCodes([])
  }

  return (
    <div className="max-w-3xl">
      {/* Profile info card */}
      <Card className="mb-6 border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-section">Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Full name</p>
              <p className="text-body font-medium text-foreground">{displayName}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Email</p>
              <p className="text-body font-medium text-foreground truncate">{displayEmail}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Profile type</p>
              <p className="text-body font-medium text-foreground">Personal</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Status</p>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  status === 'active' && 'bg-success-muted text-success',
                  status === 'inactive' && 'bg-muted text-muted-foreground',
                  status === 'suspended' && 'bg-error-muted text-error',
                  status === 'new' && 'bg-warning-muted text-warning'
                )}
              >
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Auth type</p>
              <p className="text-body font-medium text-foreground">Google</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground mb-0.5">Two-factor authentication</p>
              {mfaStatusLoading ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Checking…
                </span>
              ) : mfaEnabled ? (
                <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
                  <ShieldCheck size={14} />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Shield size={14} />
                  Disabled
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA section */}
      <Card className="mb-6 border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-section">Security</CardTitle>
          <CardDescription>
            Two-factor authentication adds an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaStatusLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Loader2 size={16} className="animate-spin shrink-0" />
              Loading…
            </div>
          ) : mfaEnabled ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-success-muted/50 border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">2FA is enabled</p>
                  <p className="text-meta text-muted-foreground">
                    Your account is protected. Permanently enabled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-error-muted border border-error/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-error" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">2FA is disabled</p>
                  <p className="text-meta text-error/90">
                    Enable 2FA to secure your account with an authenticator app
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleEnrollStart}
                disabled={mfaLoading || !userAccountId}
                className="w-fit shrink-0"
              >
                {mfaLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Enable 2FA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-section">Settings</CardTitle>
          <CardDescription>Account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="w-full text-left py-3 px-4 rounded-lg text-body font-medium cursor-pointer hover:bg-muted transition-colors text-destructive border border-transparent hover:border-error/20"
          >
            <LogOut size={16} className="inline-block mr-2 align-middle" />
            Log out
          </button>
        </CardContent>
      </Card>

      {/* Enroll 2FA dialog - 3 steps */}
      <Dialog
        open={enrollOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEnrollOpen(false)
            setEnrollStep('qr')
            setBackupCodes([])
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {enrollStep === 'qr' &&
                'Add your account to an authenticator app by scanning the QR code or entering the key manually.'}
              {enrollStep === 'verify' &&
                'Enter the 6-digit code from your authenticator app to verify setup.'}
              {enrollStep === 'backup' &&
                'Save these backup codes in a secure place. Each code can only be used once.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: QR + manual key */}
            {enrollStep === 'qr' && qrCode && (
              <>
                <div className="flex justify-center p-4 bg-white rounded-lg border border-border">
                  <img
                    src={qrCode}
                    alt="QR code for 2FA setup"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                {manualKey && (
                  <div className="space-y-1.5">
                    <p className="text-meta text-muted-foreground">Or enter this key manually:</p>
                    <code className="block p-3 rounded-lg bg-muted text-sm break-all font-mono">
                      {manualKey}
                    </code>
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-meta text-muted-foreground">Compatible apps:</p>
                  <p className="text-sm text-foreground">
                    Google Authenticator, Microsoft Authenticator, Authy, 1Password
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Verify code */}
            {enrollStep === 'verify' && (
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
            )}

            {/* Step 3: Backup codes */}
            {enrollStep === 'backup' && backupCodes.length > 0 && (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, i) => (
                      <span key={i} className="text-foreground">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>
              Cancel
            </Button>
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
                  {codesCopied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy All Codes
                    </>
                  )}
                </Button>
                <Button onClick={handleBackupCodesSaved}>I&apos;ve Saved These Codes</Button>
              </>
            )}
            {enrollStep === 'qr' && !qrCode && (
              <Button onClick={handleEnrollStart} disabled={mfaLoading}>
                {mfaLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Starting…
                  </>
                ) : (
                  'Retry'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
