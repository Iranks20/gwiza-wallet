'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Search, Edit2, X, Settings2, Power, PowerOff, Loader2 } from 'lucide-react'
import type { Country } from '@/services/countriesService'
import { listCountries, createCountry, updateCountry, deactivateCountry, activateCountry } from '@/services/countriesService'
import { listCurrencies } from '@/services/currenciesService'
import type { Currency } from '@/services/currenciesService'
import { ApiError } from '@/api/client'
import { validateCountryForm, type FieldErrors } from '@/lib/countryFormValidation'
import { Table } from '@/components/ui/table'

const emptyForm: Omit<Country, 'id'> = { name: '', alpha2: '', alpha3: '', numeric: '', currency: '', status: 'active', dial: '', flag: '' }

interface DrawerProps {
  open: boolean
  onClose: () => void
  country?: Country | null
  onSave: (data: Country | Omit<Country, 'id'>) => void
  saving?: boolean
  currencies: Currency[]
}

function CountryDrawer({ open, onClose, country, onSave, saving, currencies }: DrawerProps) {
  const [form, setForm] = useState<Omit<Country, 'id'> & { id?: number }>({ ...emptyForm })
  const [errors, setErrors] = useState<FieldErrors>({})
  useEffect(() => {
    if (open) {
      setForm(country ? { ...country } : { ...emptyForm })
      setErrors({})
    }
  }, [open, country])

  if (!open) return null

  const handleSave = () => {
    const payload = country?.id
      ? { ...country, ...form } as Country
      : { ...form, id: undefined, status: form.status || 'active' } as Omit<Country, 'id'>
    const formData = {
      name: payload.name,
      alpha2: payload.alpha2,
      alpha3: payload.alpha3,
      numeric: payload.numeric,
      currency: payload.currency,
      dial: payload.dial,
      flag: payload.flag ?? '',
      status: payload.status,
    }
    const nextErrors = validateCountryForm(formData, !country?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave(payload)
  }

  type FormFieldKey = keyof Omit<Country, 'id'> | 'flag'
  const textFields: { key: FormFieldKey; label: string; placeholder: string; required?: boolean }[] = [
    { key: 'name', label: 'Country Name', placeholder: 'e.g. United States', required: true },
    { key: 'alpha2', label: 'Alpha-2 Code', placeholder: 'e.g. US (exactly 2 letters)', required: true },
    { key: 'alpha3', label: 'Alpha-3 Code', placeholder: 'e.g. USA (exactly 3 letters)', required: true },
    { key: 'dial', label: 'Dial Code', placeholder: 'e.g. +1 or +254', required: true },
    { key: 'flag', label: 'Flag (URL)', placeholder: 'e.g. https://flagcdn.com/w80/us.png (optional)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {country ? 'Edit Country' : 'Add Country'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {textFields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
                {label}
              </label>
              <input
                value={form[key as keyof typeof form] ?? ''}
                onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (key in errors && errors[key as keyof FieldErrors]) setErrors(prev => ({ ...prev, [key]: undefined })) }}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
                style={{
                  borderColor: (key in errors && errors[key as keyof FieldErrors]) ? '#B91C1C' : '#E5E7EB',
                  color: '#04304B',
                  fontSize: 13,
                }}
                onFocus={e => { e.target.style.borderColor = (key in errors && errors[key as keyof FieldErrors]) ? '#B91C1C' : '#37BBA2' }}
                onBlur={e => { e.target.style.borderColor = (key in errors && errors[key as keyof FieldErrors]) ? '#B91C1C' : '#E5E7EB' }}
              />
              {key in errors && errors[key as keyof FieldErrors] && (
                <p className="mt-1 text-xs" style={{ color: '#B91C1C' }}>{errors[key as keyof FieldErrors]}</p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>
              Default Currency <span className="text-gray-500 font-normal">(from system)</span>
            </label>
            <select
              value={form.currency}
              onChange={e => { setForm(f => ({ ...f, currency: e.target.value })); if (errors.currency) setErrors(prev => ({ ...prev, currency: undefined })) }}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{
                borderColor: errors.currency ? '#B91C1C' : '#E5E7EB',
                color: '#04304B',
                fontSize: 13,
              }}
            >
              <option value="">Select currency</option>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
            {errors.currency && <p className="mt-1 text-xs" style={{ color: '#B91C1C' }}>{errors.currency}</p>}
            {currencies.length === 0 && (
              <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>No currencies in system. Create them under Admin → Currencies first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: '#37BBA2', fontSize: 14 }}>
            {saving ? 'Saving…' : (country ? 'Save Changes' : 'Add Country')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCountry, setEditCountry] = useState<Country | null>(null)
  const [statusModal, setStatusModal] = useState<{ id: number; action: 'deactivate' | 'activate' } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadCountries = async () => {
    setLoading(true)
    try {
      const items = await listCountries()
      setCountries(items)
    } catch {
      setCountries([])
    } finally {
      setLoading(false)
    }
  }
  const loadCurrencies = () => listCurrencies().then(setCurrencies).catch(() => {})
  useEffect(() => { loadCountries(); loadCurrencies() }, [])
  useEffect(() => { if (drawerOpen) loadCurrencies() }, [drawerOpen])

  const handleSave = async (data: Country | Omit<Country, 'id'>) => {
    setError(null)
    setSaving(true)
    try {
      if ('id' in data && data.id) {
        await updateCountry(data.id, data)
      } else {
        await createCountry(data as Omit<Country, 'id'>)
      }
      loadCountries()
      setDrawerOpen(false)
    } catch (e) {
      const msg = e instanceof ApiError && e.respCode === 174
        ? 'Server rejected the request (code 174). The country may already exist, or the backend may not allow creating new countries. Try editing an existing country or contact your backend team.'
        : (e instanceof Error ? e.message : 'Save failed')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }
  const handleStatusChange = async () => {
    if (statusModal == null) return
    const ok = statusModal.action === 'deactivate'
      ? await deactivateCountry(statusModal.id)
      : await activateCountry(statusModal.id)
    if (ok) {
      loadCountries()
      setStatusModal(null)
    }
  }

  const filtered = countries.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.alpha2.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
        <Components.AdminPageHeader
          title="Countries"
          subtitle="Manage reference country data for the platform"
          action={{ label: 'Add Country', onClick: () => { setEditCountry(null); setError(null); setDrawerOpen(true) }, icon: <Plus size={16} /> }}
        />

        {error && (
          <div className="mb-4 p-3 rounded-lg flex items-center justify-between" style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country name or code..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="text-sm" style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} results</span>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Table className="w-full min-w-max">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Flag', 'Country Name', 'Alpha-2', 'Alpha-3', 'Currency', 'Calling Code', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading countries...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3">
                    {c.flag ? (
                      <img src={c.flag} alt="" className="w-8 h-5 object-cover rounded border" style={{ borderColor: '#E5E7EB' }} />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 13 }}>{c.alpha2}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 13 }}>{c.alpha3}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{c.currency}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.dial}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={c.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/settings/countries/${c.id}/configure/kyc-tiers`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background: '#E8F8F5', color: '#037F67' }}
                      >
                        <Settings2 size={12} />
                        <span>Configure</span>
                      </Link>
                      <button
                        onClick={() => { setEditCountry(c); setDrawerOpen(true) }}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
                        style={{ color: '#37BBA2' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      {c.status === 'active' ? (
                        <button
                          onClick={() => setStatusModal({ id: c.id, action: 'deactivate' })}
                          className="p-1.5 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                          style={{ color: '#F59E0B' }}
                          title="Deactivate"
                        >
                          <PowerOff size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatusModal({ id: c.id, action: 'activate' })}
                          className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                          style={{ color: '#22C55E' }}
                          title="Activate"
                        >
                          <Power size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <CountryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} country={editCountry} onSave={handleSave} saving={saving} currencies={currencies} />
        <Components.ConfirmModal
          open={statusModal != null}
          title={statusModal?.action === 'deactivate' ? 'Deactivate Country?' : 'Activate Country?'}
          message={statusModal?.action === 'deactivate'
            ? <>Are you sure you want to deactivate this country? You can activate it again later.</>
            : <>Are you sure you want to activate this country?</>
          }
          confirmLabel={statusModal?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
          onConfirm={handleStatusChange}
          onCancel={() => setStatusModal(null)}
        />
      </div>
  )
}
