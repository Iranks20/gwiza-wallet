'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Search, Edit2, Trash2, X, Settings2 } from 'lucide-react'
import type { Country } from '@/services/countriesService'
import { listCountries, createCountry, updateCountry, removeCountry } from '@/services/countriesService'

const emptyForm: Omit<Country, 'id'> = { name: '', alpha2: '', alpha3: '', numeric: '', currency: '', status: 'active', dial: '' }

interface DrawerProps {
  open: boolean
  onClose: () => void
  country?: Country | null
  onSave: (data: Country | Omit<Country, 'id'>) => void
}

function CountryDrawer({ open, onClose, country, onSave }: DrawerProps) {
  const [form, setForm] = useState<Omit<Country, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(country ? { ...country } : { ...emptyForm })
  }, [open, country])

  if (!open) return null
  const handleSave = () => {
    if (country?.id) {
      const { id, ...rest } = form as Country
      onSave({ ...country, ...rest })
    } else {
      const { id, ...rest } = form
      onSave({ ...rest, status: form.status || 'active' })
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {country ? 'Edit Country' : 'Add Country'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {[
            { key: 'name', label: 'Country Name', placeholder: 'e.g. United States' },
            { key: 'alpha2', label: 'Alpha-2 Code', placeholder: 'e.g. US' },
            { key: 'alpha3', label: 'Alpha-3 Code', placeholder: 'e.g. USA' },
            { key: 'numeric', label: 'Numeric Code', placeholder: 'e.g. 840' },
            { key: 'currency', label: 'Default Currency', placeholder: 'e.g. USD' },
            { key: 'dial', label: 'Dial Code', placeholder: 'e.g. +1' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>{label}</label>
              <input
                value={form[key as keyof typeof form] ?? ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
                style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
                onFocus={e => e.target.style.borderColor = '#37BBA2'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          ))}
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
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {country ? 'Save Changes' : 'Add Country'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCountry, setEditCountry] = useState<Country | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const loadCountries = () => listCountries().then(setCountries)
  useEffect(() => { loadCountries() }, [])

  const handleSave = async (data: Country | Omit<Country, 'id'>) => {
    if ('id' in data && data.id) {
      await updateCountry(data.id, data)
    } else {
      await createCountry(data as Omit<Country, 'id'>)
    }
    loadCountries()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeCountry(deleteId)
      loadCountries()
      setDeleteId(null)
    }
  }

  const filtered = countries.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.alpha2.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Countries"
          subtitle="Manage reference country data for the platform"
          action={{ label: 'Add Country', onClick: () => { setEditCountry(null); setDrawerOpen(true) }, icon: <Plus size={16} /> }}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
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
          <span className="text-sm" style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Country Name', 'Alpha-2', 'Alpha-3', 'Numeric', 'Currency', 'Dial Code', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-5 rounded text-xs flex items-center justify-center font-bold text-white" style={{ background: '#37BBA2', fontSize: 10 }}>{c.alpha2}</span>
                      <span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 13 }}>{c.alpha2}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 13 }}>{c.alpha3}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#6B7280', fontSize: 13 }}>{c.numeric}</span></td>
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
                        className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
                        style={{ color: '#37BBA2' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        style={{ color: '#F44336' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CountryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} country={editCountry} onSave={handleSave} />
        <Components.ConfirmModal
          open={deleteId != null}
          title="Delete Country?"
          message={<>Are you sure you want to delete this country? This action cannot be undone.</>}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
  )
}
