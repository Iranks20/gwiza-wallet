'use client'
import React, { useState, useEffect } from 'react'
import { Link, Outlet, useParams, useLocation } from 'react-router'
import Components from '../components'
import { getCountryById } from '@/services/countriesService'
import type { Country } from '@/api/opcos'

/** Top tabs only: KYC Tiers | Profile Types | Transaction Channels | System Accounts. Profile Type Groups is nested under Profile Types. */
const configureTabs = [
  { key: 'kyc-tiers', label: 'KYC Tiers', path: 'kyc-tiers' },
  { key: 'profile-types', label: 'Profile Types', path: 'profile-types' },
  { key: 'transaction-channels', label: 'Transaction Channels', path: 'transaction-channels' },
  { key: 'system-accounts', label: 'System Accounts', path: 'system-accounts' },
] as const

export default function CountryConfigure() {
  const { countryId } = useParams<{ countryId: string }>()
  const location = useLocation()
  const base = `/admin/settings/countries/${countryId}/configure`
  const [country, setCountry] = useState<Country | null>(null)

  useEffect(() => {
    if (!countryId) {
      setCountry(null)
      return
    }
    const id = parseInt(countryId, 10)
    if (Number.isNaN(id)) {
      setCountry(null)
      return
    }
    getCountryById(id).then(setCountry)
  }, [countryId])

  const countryName = country?.name ?? (countryId ? `Country ${countryId}` : '—')
  const countryStatus = country?.status ?? 'inactive'
  const path = location.pathname

  const outletContext = {
    countryId: countryId ?? '',
    countryName: country?.name ?? '',
    countryStatus: country?.status ?? 'inactive',
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title={countryName}
        subtitle="Configure limits, rules, fees and structures"
        titleTrailing={<Components.StatusBadge status={countryStatus} size="sm" />}
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
        <Outlet context={outletContext} />
      </div>
    </div>
  )
}
