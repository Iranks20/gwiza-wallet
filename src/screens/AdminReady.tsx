'use client'
import React from 'react'
import Components from '../components'

const stubResponse = { status: 'ready', timestamp: new Date().toISOString(), checks: { database: 'ok', cache: 'ok' } }

export default function AdminReady() {
  return (
    <div>
      <Components.AdminPageHeader
        title="Ready"
        subtitle="Readiness probe — is the service ready to accept traffic?"
      />

      <div className="rounded-xl border p-5 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full" style={{ background: '#4CAF50' }} />
          <span className="font-semibold" style={{ color: '#04304B', fontSize: 16 }}>Ready</span>
        </div>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Raw response (stub):</p>
        <pre className="p-4 rounded-lg text-xs overflow-auto" style={{ background: '#FAFBFC', color: '#04304B', border: '1px solid #E5E7EB' }}>
          {JSON.stringify(stubResponse, null, 2)}
        </pre>
      </div>
    </div>
  )
}
