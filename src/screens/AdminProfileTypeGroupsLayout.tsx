import React from 'react'
import { Link, Outlet, useParams } from 'react-router'

const subRoutes = [
  { label: 'Type Group Permissions', to: 'permissions' },
  { label: 'Thresholds', to: 'thresholds' },
  { label: 'Transaction Rules', to: 'transaction-rules' },
]

export default function AdminProfileTypeGroupsLayout() {
  const { countryId, groupId } = useParams()

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm font-semibold" style={{ color: '#04304B' }}>Profile Type Group: {groupId ?? 'Select group'}</p>
        <p className="text-xs" style={{ color: '#6B7280' }}>Country {countryId?.toUpperCase()} configuration</p>
        <div className="flex gap-2 mt-3">
          {subRoutes.map(item => (
            <Link key={item.to} to={item.to} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: '#E8F8F5', color: '#037F67' }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  )
}
