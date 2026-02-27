'use client'
import React from 'react'
import { Link, useParams } from 'react-router'
import Components from '../components'
import { Plus, Edit2 } from 'lucide-react'

const groups = [
  { id: 1, name: 'Retail - Default', country: 'Kenya', profileType: 'Personal', isDefault: true, status: 'active' },
  { id: 2, name: 'Agents - Tier 2', country: 'Nigeria', profileType: 'Agent', isDefault: false, status: 'active' },
  { id: 3, name: 'Merchants - High Value', country: 'Rwanda', profileType: 'Merchant', isDefault: false, status: 'inactive' },
]

export default function AdminProfileGroups({ country, embedded }: { country?: string; embedded?: boolean }) {
  const { countryId } = useParams()
  const filtered = groups.filter(g => !country || g.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Profile Type Groups"
          subtitle="Group profile types by country and use them in rules, fees, and limits"
          action={{ label: 'Add Group', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Group Name', 'Country', 'Profile Type', 'Default', 'Status', 'Actions', 'Navigate'].map(h => (
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
            {filtered.map(g => (
              <tr
                key={g.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#F3F4F6' }}
              >
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{g.country}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{g.profileType}</span>
                </td>
                <td className="px-4 py-3">
                  {g.isDefault && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>
                      Default
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={g.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                    style={{ color: '#37BBA2' }}
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  {countryId ? (
                    <Link to={`/admin/settings/countries/${countryId}/configure/profile-type-groups/${g.id}/permissions`} style={{ color: '#37BBA2', fontSize: 12 }}>
                      Open
                    </Link>
                  ) : null}
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

