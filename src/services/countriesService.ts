/** Countries service – replace with real API when ready */
export interface Country {
  id: number
  name: string
  alpha2: string
  alpha3: string
  numeric: string
  currency: string
  status: string
  dial: string
}

const mock: Country[] = [
  { id: 1, name: 'United States', alpha2: 'US', alpha3: 'USA', numeric: '840', currency: 'USD', status: 'active', dial: '+1' },
  { id: 2, name: 'United Kingdom', alpha2: 'GB', alpha3: 'GBR', numeric: '826', currency: 'GBP', status: 'active', dial: '+44' },
  { id: 3, name: 'Kenya', alpha2: 'KE', alpha3: 'KEN', numeric: '404', currency: 'KES', status: 'active', dial: '+254' },
  { id: 4, name: 'Nigeria', alpha2: 'NG', alpha3: 'NGA', numeric: '566', currency: 'NGN', status: 'active', dial: '+234' },
  { id: 5, name: 'Ghana', alpha2: 'GH', alpha3: 'GHA', numeric: '288', currency: 'GHS', status: 'inactive', dial: '+233' },
  { id: 6, name: 'South Africa', alpha2: 'ZA', alpha3: 'ZAF', numeric: '710', currency: 'ZAR', status: 'active', dial: '+27' },
  { id: 7, name: 'Rwanda', alpha2: 'RW', alpha3: 'RWA', numeric: '646', currency: 'RWF', status: 'active', dial: '+250' },
  { id: 8, name: 'Tanzania', alpha2: 'TZ', alpha3: 'TZA', numeric: '834', currency: 'TZS', status: 'inactive', dial: '+255' },
]

export async function listCountries(filters?: { search?: string; status?: string }): Promise<Country[]> {
  let out = [...mock]
  if (filters?.status && filters.status !== 'all') out = out.filter(c => c.status === filters.status)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    out = out.filter(c => c.name.toLowerCase().includes(q) || c.alpha2.toLowerCase().includes(q))
  }
  return out
}

export async function getCountryById(id: string | number): Promise<Country | null> {
  const num = typeof id === 'string' ? parseInt(id, 10) : id
  if (Number.isNaN(num)) return mock.find(c => c.alpha2 === id) ?? null
  return mock.find(c => c.id === num) ?? null
}

export async function createCountry(data: Omit<Country, 'id'>): Promise<Country> {
  const next = { ...data, id: Math.max(...mock.map(c => c.id), 0) + 1 }
  mock.push(next)
  return next
}

export async function updateCountry(id: number, data: Partial<Country>): Promise<Country | null> {
  const i = mock.findIndex(c => c.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removeCountry(id: number): Promise<boolean> {
  const i = mock.findIndex(c => c.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
