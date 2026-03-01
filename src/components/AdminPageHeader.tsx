'use client'
import React from 'react'

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
}

export default function AdminPageHeader({ title, subtitle, titleTrailing, action, secondaryAction }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-bold" style={{ color: '#04304B', fontSize: 24, fontFamily: "'Poppins', sans-serif" }}>
            {title}
          </h1>
          {titleTrailing}
        </div>
        {subtitle && (
          <p className="mt-1" style={{ color: '#6B7280', fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all cursor-pointer hover:bg-gray-50"
            style={{
              borderColor: '#E5E7EB',
              color: '#04304B',
              fontSize: 14,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all cursor-pointer hover:opacity-90"
            style={{
              background: '#37BBA2',
              fontSize: 14,
              fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 2px 8px rgba(55,187,162,0.3)',
            }}
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
