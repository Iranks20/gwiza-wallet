import { useParams } from 'react-router'
import AdminKYCTiers from './AdminKYCTiers'
import AdminProfileTypes from './AdminProfileTypes'
import AdminProfileGroups from './AdminProfileGroups'
import AdminChannels from './AdminChannels'
import AdminSystemAccounts from './AdminSystemAccounts'
import AdminGroupPermissions from './AdminGroupPermissions'
import AdminThresholds from './AdminThresholds'
import AdminTransactionRules from './AdminTransactionRules'
import AdminTransactionFees from './AdminTransactionFees'

const countryMap: Record<string, string> = {
  '1': 'United States', '2': 'United Kingdom', '3': 'Kenya', '4': 'Nigeria',
  '5': 'Ghana', '6': 'South Africa', '7': 'Rwanda', '8': 'Tanzania',
  US: 'United States', GB: 'United Kingdom', KE: 'Kenya', NG: 'Nigeria',
  GH: 'Ghana', ZA: 'South Africa', RW: 'Rwanda', TZ: 'Tanzania',
}

function useCountryFromParams() {
  const { countryId } = useParams<{ countryId: string }>()
  return countryId ? (countryMap[countryId] ?? countryId) : ''
}

export function ConfigureKYCTiers() {
  const country = useCountryFromParams()
  return <AdminKYCTiers embedded country={country} />
}

export function ConfigureProfileTypes() {
  const country = useCountryFromParams()
  return <AdminProfileTypes embedded country={country} />
}

export function ConfigureProfileTypeGroups() {
  const country = useCountryFromParams()
  return <AdminProfileGroups embedded country={country} />
}

export function ConfigureTransactionChannels() {
  const country = useCountryFromParams()
  return <AdminChannels embedded country={country} />
}

export function ConfigureSystemAccounts() {
  const country = useCountryFromParams()
  return <AdminSystemAccounts embedded country={country} />
}

export function ConfigureGroupPermissions() {
  const { countryId, groupId } = useParams<{ countryId: string; groupId: string }>()
  const country = countryId ? (countryMap[countryId] ?? countryId) : (groupId ?? '')
  return <AdminGroupPermissions embedded country={country} />
}

export function ConfigureThresholds() {
  const country = useCountryFromParams()
  const { groupId } = useParams<{ groupId?: string }>()
  const groupIdNum = groupId ? parseInt(groupId, 10) : undefined
  return <AdminThresholds embedded country={country} groupId={groupIdNum} />
}

export function ConfigureTransactionRules() {
  const { countryId, groupId } = useParams<{ countryId: string; groupId: string }>()
  const country = countryId ? (countryMap[countryId] ?? countryId) : ''
  const basePath = countryId && groupId
    ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups/${groupId}`
    : ''
  return <AdminTransactionRules embedded country={country} configureBasePath={basePath} />
}

export function ConfigureTransactionFees() {
  const country = useCountryFromParams()
  const { ruleId } = useParams<{ ruleId?: string }>()
  return <AdminTransactionFees embedded country={country} ruleId={ruleId ? parseInt(ruleId, 10) : undefined} />
}
