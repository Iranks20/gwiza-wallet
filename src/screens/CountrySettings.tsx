'use client'
import React, { useState } from 'react'
import { useParams } from 'react-router'
import Components from '../components'
import AdminKYCTiers from './AdminKYCTiers'
import AdminProfileTypes from './AdminProfileTypes'
import AdminProfileGroups from './AdminProfileGroups'
import AdminGroupPermissions from './AdminGroupPermissions'
import AdminThresholds from './AdminThresholds'
import AdminTransactionRules from './AdminTransactionRules'
import AdminTransactionFees from './AdminTransactionFees'
import AdminChannels from './AdminChannels'
import AdminSystemAccounts from './AdminSystemAccounts'

const tabs = [
  { key: 'kyc', label: 'KYC Tiers' },
  { key: 'profileTypes', label: 'Profile Types' },
  { key: 'profileGroups', label: 'Profile Type Groups' },
  { key: 'groupPermissions', label: 'Type Group Permissions' },
  { key: 'thresholds', label: 'Thresholds' },
  { key: 'rules', label: 'Transaction Rules' },
  { key: 'fees', label: 'Transaction Fees' },
  { key: 'channels', label: 'Transaction Channels' },
  { key: 'systemAccounts', label: 'System Accounts' },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function CountrySettings() {
  const { countryId } = useParams<{ countryId: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('kyc')

  const countryCode = countryId?.toUpperCase() || 'XX'
  const countryMap: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    KE: 'Kenya',
    NG: 'Nigeria',
    GH: 'Ghana',
    ZA: 'South Africa',
    RW: 'Rwanda',
    TZ: 'Tanzania',
  }
  const countryName = countryMap[countryCode]

  const renderContent = () => {
    switch (activeTab) {
      case 'kyc':
        return <AdminKYCTiers embedded country={countryName} />
      case 'profileTypes':
        return <AdminProfileTypes embedded country={countryName} />
      case 'profileGroups':
        return <AdminProfileGroups embedded country={countryName} />
      case 'groupPermissions':
        return <AdminGroupPermissions embedded country={countryName || countryCode} />
      case 'thresholds':
        return <AdminThresholds embedded country={countryName} />
      case 'rules':
        return <AdminTransactionRules embedded country={countryName} />
      case 'fees':
        return <AdminTransactionFees embedded country={countryName} />
      case 'channels':
        return <AdminChannels embedded country={countryName} />
      case 'systemAccounts':
        return <AdminSystemAccounts embedded country={countryName} />
      default:
        return null
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title={`Settings · ${countryCode}`}
          subtitle="Configure limits, rules, fees and structures for this country"
        />

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2 border-b" style={{ borderColor: '#E5E7EB' }}>
          {tabs.map(t => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className="px-3 py-2 text-xs font-medium rounded-t-lg cursor-pointer"
                style={{
                  color: active ? '#037F67' : '#6B7280',
                  borderBottom: active ? '2px solid #37BBA2' : '2px solid transparent',
                  background: active ? '#E8F8F5' : 'transparent',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
    </div>
  )
}

