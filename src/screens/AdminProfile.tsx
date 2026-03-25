'use client'

import React from 'react'
import AdminPageHeader from '@/components/AdminPageHeader'
import { ProfileContent } from '@/components/ProfileContent'

export default function AdminProfile() {
  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        subtitle="Manage your account and security settings"
      />
      <ProfileContent />
    </div>
  )
}
