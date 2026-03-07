'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  /** Rendered to the right of the title on the same line (e.g. status badge) */
  titleTrailing?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

export default function AdminPageHeader({ title, subtitle, titleTrailing, action, secondaryAction, className }: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-bold text-2xl text-foreground">
            {title}
          </h1>
          {titleTrailing}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="gap-2"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </Button>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            className="gap-2 shadow-sm"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
