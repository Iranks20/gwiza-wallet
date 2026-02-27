'use client'
import React from 'react'
import Components from '../components'

const matrix = {
  permissions: ['wallet.view', 'wallet.block', 'fees.manage', 'rules.manage'],
  groups: ['Retail - Default', 'Agents - Tier 2', 'Ops - Supervisors'],
  assignments: {
    'wallet.view': ['Retail - Default', 'Agents - Tier 2', 'Ops - Supervisors'],
    'wallet.block': ['Ops - Supervisors'],
    'fees.manage': ['Ops - Supervisors'],
    'rules.manage': ['Ops - Supervisors'],
  } as Record<string, string[]>,
}

function isChecked(permission: string, group: string) {
  return matrix.assignments[permission]?.includes(group)
}

export default function AdminGroupPermissions({ country, embedded }: { country?: string; embedded?: boolean }) {
  // country currently unused but reserved for future filtering
  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Profile Group Permissions"
          subtitle="Matrix assignment of permissions across profile type groups"
        />
      )}

      <div
        className="rounded-xl border overflow-auto"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="min-w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                Permission
              </th>
              {matrix.groups.map(g => (
                <th
                  key={g}
                  className="text-center px-4 py-3"
                  style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}
                >
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.permissions.map(p => (
              <tr key={p} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-mono font-semibold" style={{ color: '#04304B', fontSize: 12 }}>
                      {p}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: 11 }}>Lorem ipsum permission description</span>
                  </div>
                </td>
                {matrix.groups.map(g => {
                  const checked = isChecked(p, g)
                  return (
                    <td key={g} className="px-4 py-3 text-center">
                      <button
                        className="w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors"
                        style={{
                          background: checked ? '#37BBA2' : '#E5E7EB',
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full bg-white shadow"
                          style={{
                            transform: checked ? 'translateX(14px)' : 'translateX(0px)',
                            transition: 'transform 150ms ease-out',
                          }}
                        />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-4 py-2 rounded-lg border font-medium cursor-pointer"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
        >
          Undo Changes
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium text-white cursor-pointer"
          style={{ background: '#37BBA2', fontSize: 14 }}
        >
          Save Matrix
        </button>
      </div>
    </div>
  )

  if (embedded) return content
  return <Components.AdminLayout>{content}</Components.AdminLayout>
}

