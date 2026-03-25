'use client'
import React from 'react'
import { cn } from '@/lib/utils'

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'blocked' | 'completed' | 'failed' | 'approved' | 'rejected' | string

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: '#F0FDF4', text: '#166534', dot: '#4CAF50', label: 'Active' },
  inactive: { bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF', label: 'Inactive' },
  pending: { bg: '#FFF7ED', text: '#9A3412', dot: '#FF9800', label: 'Pending' },
  success: { bg: '#F0FDF4', text: '#166534', dot: '#4CAF50', label: 'Success' },
  completed: { bg: '#F0FDF4', text: '#166534', dot: '#4CAF50', label: 'Completed' },
  approved: { bg: '#F0FDF4', text: '#166534', dot: '#4CAF50', label: 'Approved' },
  error: { bg: '#FEF2F2', text: '#991B1B', dot: '#F44336', label: 'Error' },
  failed: { bg: '#FEF2F2', text: '#991B1B', dot: '#F44336', label: 'Failed' },
  rejected: { bg: '#FEF2F2', text: '#991B1B', dot: '#F44336', label: 'Rejected' },
  warning: { bg: '#FFF7ED', text: '#9A3412', dot: '#FF9800', label: 'Warning' },
  blocked: { bg: '#FEF2F2', text: '#991B1B', dot: '#F44336', label: 'Blocked' },
  info: { bg: '#EFF6FF', text: '#1E40AF', dot: '#2196F3', label: 'Info' },
}

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF', label: status
  }
  const displayLabel = label || config.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        size === 'sm' ? 'text-meta py-0.5 px-2' : 'text-caption py-1 px-2.5'
      )}
      style={{
        background: config.bg,
        color: config.text,
      }}
    >
      <span className="rounded-full shrink-0" style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6, background: config.dot }} />
      {displayLabel}
    </span>
  )
}
