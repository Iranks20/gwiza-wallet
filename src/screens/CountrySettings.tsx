import React from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router'
import { Link } from '@/lib'
import Components from '../components'

const tabs = [
  { label: 'KYC Tiers', to: 'kyc-tiers' },
  { label: 'Profile Types', to: 'profile-types' },
  { label: 'Profile Type Groups', to: 'profile-type-groups' },
  { label: 'Transaction Channels', to: 'transaction-channels' },
  { label: 'System Accounts', to: 'system-accounts' },
]

export default function CountrySettings() {
  const { countryId } = useParams<{ countryId: string }>()
  const location = useLocation()

  if (location.pathname.endsWith('/configure')) {
    return <Navigate to="kyc-tiers" replace />
  }

  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title={`Country Configure · ${countryId?.toUpperCase()}`}
          subtitle="Configure KYC tiers, profile setup, channels and system accounts"
        />

        <div className="mb-4 flex flex-wrap gap-2 border-b" style={{ borderColor: '#E5E7EB' }}>
          {tabs.map(tab => {
            const isActive = location.pathname.includes(`/configure/${tab.to}`)
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="px-3 py-2 text-xs font-medium rounded-t-lg"
                style={{
                  color: isActive ? '#037F67' : '#6B7280',
                  borderBottom: isActive ? '2px solid #37BBA2' : '2px solid transparent',
                  background: isActive ? '#E8F8F5' : 'transparent',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <Outlet />
      </div>
    </Components.AdminLayout>
  )
}
