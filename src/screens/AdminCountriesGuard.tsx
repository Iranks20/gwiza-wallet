'use client'

import React from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import AdminCountries from './AdminCountries'

/**
 * For opco users: redirect to their country config page.
 * For global users: show the full countries list.
 */
export default function AdminCountriesGuard() {
  const auth = useAuth()
  const profileType = (auth.user?.user_profile_type ?? 'global').toLowerCase()
  const countryId = auth.user?.country_id

  if (profileType === 'opco' && countryId != null && countryId > 0) {
    return <Navigate to={`/admin/settings/countries/${countryId}/configure`} replace />
  }

  return <AdminCountries />
}
