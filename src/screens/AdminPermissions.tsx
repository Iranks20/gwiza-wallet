'use client'
import React from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const permissions = [
  { id: 1, code: 'wallet.view', scope: 'wallet', tag: 'read', description: 'View wallet details', status: 'active' },
  { id: 2, code: 'wallet.block', scope: 'wallet', tag: 'write', description: 'Block / unblock wallets', status: 'active' },
  { id: 3, code: 'fees.manage', scope: 'fees', tag: 'admin', description: 'Manage fee schemes', status: 'inactive' },
]

export default function AdminPermissions() {
  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Profile Permissions"
          subtitle="Fine-grained permissions used to control access across backoffice"
          action={{ label: 'Add Permission', onClick: () => {}, icon: <Plus size={15} /> }}
        />

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Code', 'Scope', 'Tag', 'Description', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3"
                    style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#F3F4F6' }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{p.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                      {p.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize" style={{ background: '#F3F4F6', color: '#374151' }}>
                      {p.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#6B7280', fontSize: 13 }}>{p.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
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

