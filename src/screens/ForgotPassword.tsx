'use client'
import React from 'react'
import { Link } from '@/lib'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 sm:p-8 border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-primary-muted">
            <Mail size={24} className="text-primary" />
          </div>
          <h1 className="font-bold text-xl text-foreground mb-1">Forgot Password</h1>
          <p className="text-center text-sm text-muted-foreground">Enter your email or phone to receive a reset link or code.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email or Phone</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-input rounded-lg text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="you@example.com or +2507..."
            />
          </div>
          <Button type="submit" className="w-full py-6">Send reset code</Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Remembered your password?{' '}
          <Link to="/auth" className="text-primary hover:underline font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
