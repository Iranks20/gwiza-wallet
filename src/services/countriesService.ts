import { opcosApi } from '@/api/opcos'
import type { Country } from '@/api/opcos'

export type { Country }

export async function listCountries(filters?: { search?: string; status?: string }): Promise<Country[]> {
  const { items } = await opcosApi.list({ limit: 500 })
  let out = items
  if (filters?.status && filters.status !== 'all') out = out.filter((c) => c.status === filters.status)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    out = out.filter((c) => c.name.toLowerCase().includes(q) || c.alpha2.toLowerCase().includes(q))
  }
  return out
}

export async function getCountryById(id: string | number): Promise<Country | null> {
  const num = typeof id === 'string' ? parseInt(id, 10) : id
  if (Number.isNaN(num)) return null
  return opcosApi.getById(num)
}

export async function createCountry(data: Omit<Country, 'id'>): Promise<Country> {
  return opcosApi.create(data)
}

export async function updateCountry(id: number, data: Partial<Country>): Promise<Country | null> {
  return opcosApi.update(id, data)
}

export async function deactivateCountry(id: number): Promise<boolean> {
  const updated = await opcosApi.update(id, { status: 'inactive' })
  return updated != null
}

export async function activateCountry(id: number): Promise<boolean> {
  const updated = await opcosApi.update(id, { status: 'active' })
  return updated != null
}
