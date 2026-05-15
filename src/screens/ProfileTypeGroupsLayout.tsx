'use client'
import React from 'react'
import { Link, Outlet, useParams, useLocation, useOutletContext, Navigate } from 'react-router'
import type { ConfigureOutletContext } from './ConfigureTabs'

const subTabs = [
  { path: 'permissions', label: 'Type Group Permissions' },
  { path: 'thresholds', label: 'Thresholds' },
  { path: 'transaction-rules', label: 'Transaction Rules' },
]

export default function ProfileTypeGroupsLayout() {
  const context = useOutletContext<ConfigureOutletContext>()
  const params = useParams<{ countryId?: string; groupId?: string }>()
  const countryId = context?.countryId ?? params.countryId ?? ''
  const groupId = params.groupId ?? ''
  const location = useLocation()
  const groupIdNum = groupId !== '' ? parseInt(groupId, 10) : NaN
  const invalidGroup = groupId === '' || Number.isNaN(groupIdNum)
  if (invalidGroup && countryId) {
    return <Navigate to={`/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups`} replace />
  }
  const base = countryId && groupId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups/${groupId}` : ''
  const childContext = { ...context, countryId: countryId || context?.countryId, groupId: groupId || context?.groupId }

  return (
    <div>
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
      <Outlet context={childContext} />
    </div>
  )
}
