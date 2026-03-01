'use client'
import React from 'react'
import { Link, Outlet, useParams, useLocation } from 'react-router'
import Components from '../components'

/** Top tabs only: KYC Tiers | Profile Types | Transaction Channels | System Accounts. Profile Type Groups is nested under Profile Types. */
const configureTabs = [
  { key: 'kyc-tiers', label: 'KYC Tiers', path: 'kyc-tiers' },
  { key: 'profile-types', label: 'Profile Types', path: 'profile-types' },
  { key: 'transaction-channels', label: 'Transaction Channels', path: 'transaction-channels' },
  { key: 'system-accounts', label: 'System Accounts', path: 'system-accounts' },
] as const

const countryMap: Record<string, string> = {
  '1': 'United States', '2': 'United Kingdom', '3': 'Kenya', '4': 'Nigeria',
  '5': 'Ghana', '6': 'South Africa', '7': 'Rwanda', '8': 'Tanzania',
  US: 'United States', GB: 'United Kingdom', KE: 'Kenya', NG: 'Nigeria',
  GH: 'Ghana', ZA: 'South Africa', RW: 'Rwanda', TZ: 'Tanzania',
}

export default function CountryConfigure() {
  const { countryId } = useParams<{ countryId: string }>()
  const location = useLocation()
  const base = `/admin/settings/countries/${countryId}/configure`
  const countryName = countryId ? (countryMap[countryId] ?? countryId) : '—'
  const path = location.pathname

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title={countryName}
        subtitle="Configure limits, rules, fees and structures"
        titleTrailing={<Components.StatusBadge status="active" size="sm" />}
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b" style={{ borderColor: '#E5E7EB' }}>
        {configureTabs.map(t => {
          const to = `${base}/${t.path}`
          const active = path === to || (t.path === 'profile-types' && path.startsWith(to + '/'))
          return (
            <Link
              key={t.key}
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

      <div>
        <Outlet />
      </div>
    </div>
  )
}
