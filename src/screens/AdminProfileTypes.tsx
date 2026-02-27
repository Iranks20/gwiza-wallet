'use client'
import React from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const types = [
  { id: 1, country: 'Kenya', name: 'Personal', scope: 'retail', description: 'Individual consumer wallets', status: 'active' },
  { id: 2, country: 'Kenya', name: 'Business', scope: 'sme', description: 'Small and medium businesses', status: 'active' },
  { id: 3, country: 'Nigeria', name: 'Agent', scope: 'distribution', description: 'Cash-in/out agents', status: 'active' },
  { id: 4, country: 'Nigeria', name: 'Merchant', scope: 'merchant', description: 'High-volume billers & merchants', status: 'inactive' },
]

export default function AdminProfileTypes({ country, embedded }: { country?: string; embedded?: boolean }) {
  const filtered = types.filter(t => !country || t.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Profile Types"
          subtitle="Define core wallet profile types for customers, agents, and businesses"
          action={{ label: 'Add Profile Type', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Profile Type', 'Scope', 'Description', 'Status', 'Actions'].map(h => (
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
            {filtered.map(p => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#F3F4F6' }}
              >
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                    {p.scope}
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
                    <button
                      className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                      style={{ color: '#37BBA2' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                      style={{ color: '#F44336' }}
                    >
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
  )

  if (embedded) return content
  return <Components.AdminLayout>{content}</Components.AdminLayout>
}

