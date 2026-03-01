/**
 * Currencies service – backed by Wallet+ /currencies/ API.
 */

import { currenciesApi } from '@/api/currencies'
import type { Currency } from '@/api/currencies'

export type { Currency }

export async function listCurrencies(filters?: { search?: string; status?: string }): Promise<Currency[]> {
  const { items } = await currenciesApi.list()
  let out = items
  if (filters?.status && filters.status !== 'all') out = out.filter((c) => c.status === filters.status)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    out = out.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
  }
  return out
}

export async function getCurrencyByCode(code: string): Promise<Currency | null> {
  return currenciesApi.getByCode(code)
}

export async function createCurrency(data: { code: string; name: string; status?: string }): Promise<Currency> {
  return currenciesApi.create({ code: data.code, name: data.name })
}

export async function updateCurrency(code: string, data: Partial<Currency>): Promise<Currency | null> {
  return currenciesApi.update(code, { name: data.name })
}

export async function removeCurrency(code: string): Promise<boolean> {
  return currenciesApi.delete(code)
}
