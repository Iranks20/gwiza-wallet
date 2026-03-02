import { profilethresholdsettingsApi } from '@/api/profilethresholdsettings'

export type { ProfileThresholdSetting } from '@/api/profilethresholdsettings'

export async function listThresholds(filters?: { profileTypeGroupId?: number; countryId?: number; status?: string }) {
  const { items } = await profilethresholdsettingsApi.list({
    profileTypeGroupId: filters?.profileTypeGroupId,
    countryId: filters?.countryId,
    status: filters?.profileTypeGroupId != null || filters?.countryId != null ? undefined : filters?.status,
    limit: 500,
  })
  if (filters?.status && filters.status !== 'all' && items.length > 0) {
    return items.filter(t => t.status === filters.status)
  }
  return items
}

export async function getThresholdById(id: number) {
  return profilethresholdsettingsApi.getById(id)
}

export async function createThreshold(data: Omit<import('@/api/profilethresholdsettings').ProfileThresholdSetting, 'id'>) {
  return profilethresholdsettingsApi.create(data)
}

export async function updateThreshold(id: number, data: Partial<Omit<import('@/api/profilethresholdsettings').ProfileThresholdSetting, 'id'>>) {
  return profilethresholdsettingsApi.update(id, data)
}
