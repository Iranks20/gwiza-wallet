import React from 'react'
import Components from '../components'

const payload = {
  status: 'ready',
  uptime: '72h',
  dependencies: { db: 'up', queue: 'up', cache: 'up' },
}

export default function AdminReady() {
  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader title="System Ready" subtitle="Readiness endpoint state (/ready)" />
        <div className="rounded-xl border p-4 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <pre className="text-xs" style={{ color: '#04304B' }}>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      </div>
    </Components.AdminLayout>
  )
}
