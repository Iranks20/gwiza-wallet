'use client'
import React from 'react'
import { Link, Outlet, useParams, useLocation } from 'react-router'

const subTabs = [
  { path: 'permissions', label: 'Type Group Permissions' },
  { path: 'thresholds', label: 'Thresholds' },
  { path: 'transaction-rules', label: 'Transaction Rules' },
]

export default function ProfileTypeGroupsLayout() {
  const { countryId, groupId } = useParams<{ countryId: string; groupId: string }>()
  const location = useLocation()
  const base = `/admin/settings/countries/${countryId}/configure/profile-type-groups/${groupId}`

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-4 flex flex-wrap gap-2 border-b" style={{ borderColor: '#E5E7EB' }}>
        {subTabs.map(t => {
          const to = `${base}/${t.path}`
          const active = location.pathname === to || (t.path === 'transaction-rules' && location.pathname.startsWith(to))
          return (
            <Link
              key={t.path}
              to={to}
              className="px-3 py-2 text-xs font-medium rounded-t-lg cursor-pointer no-underline"
              style={{
                color: active ? '#037F67' : '#6B7280',
                borderBottom: active ? '2px solid #37BBA2' : '2px solid transparent',
                background: active ? '#E8F8F5' : 'transparent',
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
      <Outlet />
    </div>
  )
}
