'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const tiers = [
  { id: 1, country: 'Kenya', name: 'Basic', level: 1, description: 'Minimal KYC for low limits', status: 'active' },
  { id: 2, country: 'Kenya', name: 'Gold', level: 3, description: 'Full KYC with address verification', status: 'active' },
  { id: 3, country: 'Nigeria', name: 'Basic', level: 1, description: 'Entry KYC tier', status: 'active' },
  { id: 4, country: 'Nigeria', name: 'Silver', level: 2, description: 'Enhanced KYC with ID verification', status: 'inactive' },
]

export default function AdminKYCTiers({ country, embedded }: { country?: string; embedded?: boolean }) {
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = tiers.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchCountry = !country || t.country === country
    return matchStatus && matchCountry
  })

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="KYC Tiers"
          subtitle="Define verification tiers and link them to limits and profiles"
          action={{ label: 'Add Tier', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} tiers</span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Tier Name', 'Level', 'Description', 'Status', 'Actions'].map(h => (
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
            {filtered.map(t => (
              <tr
                key={t.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#F3F4F6' }}
              >
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>
                    Level {t.level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{t.description}</span>
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={t.status} size="sm" />
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

