import { useParams, useOutletContext, Outlet } from 'react-router'
import AdminKYCTiers from './AdminKYCTiers'
import AdminProfileTypes from './AdminProfileTypes'
import AdminProfileGroups from './AdminProfileGroups'
import AdminChannels from './AdminChannels'
import AdminSystemAccounts from './AdminSystemAccounts'
import AdminGroupPermissions from './AdminGroupPermissions'
import AdminThresholds from './AdminThresholds'
import AdminTransactionRules from './AdminTransactionRules'
import AdminTransactionFees from './AdminTransactionFees'

export type ConfigureOutletContext = {
  countryId?: string
  groupId?: string
  /** From opcos API – set by CountryConfigure */
  countryName?: string
  countryStatus?: string
}

/** Forwards outlet context so nested profile-types routes receive countryId, countryName, etc. */
export function ProfileTypesConfigureOutlet() {
  const context = useOutletContext<ConfigureOutletContext>()
  return <Outlet context={context} />
}

function useCountryIdFromConfigure(): string | undefined {
  const context = useOutletContext<ConfigureOutletContext>()
  const params = useParams<{ countryId?: string }>()
  return context?.countryId ?? params.countryId
}

function useGroupIdFromConfigure(): string | undefined {
  const context = useOutletContext<ConfigureOutletContext>()
  const params = useParams<{ groupId?: string }>()
  return context?.groupId ?? params.groupId
}

/** Country display name from API (outlet context set by CountryConfigure); fallback to countryId if not loaded yet */
function useCountryDisplayFromConfigure(): string {
  const context = useOutletContext<ConfigureOutletContext>()
  const countryId = useCountryIdFromConfigure()
  if (context?.countryName) return context.countryName
  return countryId ? `Country ${countryId}` : ''
}

export function ConfigureKYCTiers() {
  const country = useCountryDisplayFromConfigure()
  return <AdminKYCTiers embedded country={country} />
}

export function ConfigureProfileTypes() {
  const country = useCountryDisplayFromConfigure()
  return <AdminProfileTypes embedded country={country} />
}

export function ConfigureProfileTypeGroups() {
  const countryId = useCountryIdFromConfigure()
  const country = useCountryDisplayFromConfigure()
  return (
    <AdminProfileGroups
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
    />
  )
}

export function ConfigureTransactionChannels() {
  const countryId = useCountryIdFromConfigure()
  const country = useCountryDisplayFromConfigure()
  return (
    <AdminChannels
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
    />
  )
}

export function ConfigureSystemAccounts() {
  const countryId = useCountryIdFromConfigure()
  const country = useCountryDisplayFromConfigure()
  return (
    <AdminSystemAccounts
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
    />
  )
}

export function ConfigureGroupPermissions() {
  const countryId = useCountryIdFromConfigure()
  const groupId = useGroupIdFromConfigure()
  const country = useCountryDisplayFromConfigure() || (groupId ?? '')
  return (
    <AdminGroupPermissions
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
      groupId={groupId ? parseInt(groupId, 10) : undefined}
    />
  )
}

export function ConfigureThresholds() {
  const countryId = useCountryIdFromConfigure()
  const groupId = useGroupIdFromConfigure()
  const country = useCountryDisplayFromConfigure()
  const groupIdNum = groupId ? parseInt(groupId, 10) : undefined
  return (
    <AdminThresholds
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
      groupId={groupIdNum}
    />
  )
}

export function ConfigureTransactionRules() {
  const countryId = useCountryIdFromConfigure()
  const groupId = useGroupIdFromConfigure()
  const country = useCountryDisplayFromConfigure()
  const basePath = countryId && groupId
    ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups/${groupId}`
    : ''
  return (
    <AdminTransactionRules
      embedded
      country={country}
      countryId={countryId ? parseInt(countryId, 10) : undefined}
      groupId={groupId ? parseInt(groupId, 10) : undefined}
      configureBasePath={basePath}
    />
  )
}

export function ConfigureTransactionFees() {
  const countryId = useCountryIdFromConfigure()
  const { ruleId } = useParams<{ ruleId?: string }>()
  const country = useCountryDisplayFromConfigure()
  return <AdminTransactionFees embedded country={country} ruleId={ruleId ? parseInt(ruleId, 10) : undefined} />
}
