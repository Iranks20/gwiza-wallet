'use client'
import React from 'react'
import Components from '../components'

const rows = [
  { id: 1, user: 'admin@fintech.io', action: 'Updated KYC Tier for WLT-00291', entity: 'Wallet', entityId: 'WLT-00291', date: '2024-03-20 14:22', type: 'update' },
  { id: 2, user: 'ops@fintech.io', action: 'Created Transaction Rule #28', entity: 'Rule', entityId: 'RULE-0028', date: '2024-03-20 13:10', type: 'create' },
]

export default function AdminAuditLogs() {
  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Audit Logs"
          subtitle="Traceable history of configuration and operational actions in the system"
        />

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['User', 'Action', 'Entity', 'Entity ID', 'When', 'Type'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.user}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.action}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.entity}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#6B7280', fontSize: 12 }}>{r.entityId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.date}</span></td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={r.type} label={r.type} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Components.AdminLayout>
  )
}

