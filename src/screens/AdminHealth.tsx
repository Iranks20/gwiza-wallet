'use client'
import React from 'react'
import Components from '../components'
import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react'

const checks = [
  { name: 'API Health', status: 'healthy', detail: 'All public and internal APIs responding within SLA', latency: '120ms' },
  { name: 'Database', status: 'healthy', detail: 'Primary and replica online', latency: '18ms' },
  { name: 'Queue Service', status: 'warning', detail: 'Slight lag in processing notifications', latency: '1.2s' },
  { name: 'Notification Service', status: 'healthy', detail: 'Email/SMS providers online', latency: '450ms' },
]

export default function AdminHealth() {
  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="System Health"
          subtitle="Health endpoint state (/health) and service checks"
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Overall Status</p>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} style={{ color: '#4CAF50' }} />
              <span className="font-semibold" style={{ color: '#04304B', fontSize: 16 }}>Healthy</span>
            </div>
            <p style={{ color: '#6B7280', fontSize: 13 }}>All mandatory checks are passing and the platform is ready to serve traffic.</p>
          </div>
          <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Uptime (last 30 days)</p>
            <p className="font-bold mb-2" style={{ color: '#04304B', fontSize: 24 }}>99.96%</p>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Includes scheduled maintenance windows.</p>
          </div>
          <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Active Incidents</p>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} style={{ color: '#FF9800' }} />
              <span className="font-semibold" style={{ color: '#04304B', fontSize: 16 }}>1 Warning</span>
            </div>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Queue service is slightly behind; transactions are not impacted.</p>
          </div>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <Activity size={16} style={{ color: '#37BBA2' }} />
            <span className="font-medium" style={{ color: '#04304B', fontSize: 14 }}>Health Checks</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Check', 'Status', 'Detail', 'Latency'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checks.map(c => (
                <tr key={c.name} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{c.name}</span></td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge
                      status={c.status === 'healthy' ? 'success' : 'warning'}
                      label={c.status === 'healthy' ? 'Healthy' : 'Warning'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.detail}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.latency}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border p-4 bg-white mt-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#04304B' }}>Raw JSON</p>
          <pre className="text-xs" style={{ color: '#04304B' }}>{JSON.stringify({ status: 'ok', checks }, null, 2)}</pre>
        </div>
      </div>
    </Components.AdminLayout>
  )
}

