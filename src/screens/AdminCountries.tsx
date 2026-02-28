'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Search, Edit2, Trash2, X, ChevronDown, Settings2 } from 'lucide-react'

const countries = [
  { id: 1, name: 'United States', alpha2: 'US', alpha3: 'USA', numeric: '840', currency: 'USD', status: 'active', dial: '+1' },
  { id: 2, name: 'United Kingdom', alpha2: 'GB', alpha3: 'GBR', numeric: '826', currency: 'GBP', status: 'active', dial: '+44' },
  { id: 3, name: 'Kenya', alpha2: 'KE', alpha3: 'KEN', numeric: '404', currency: 'KES', status: 'active', dial: '+254' },
  { id: 4, name: 'Nigeria', alpha2: 'NG', alpha3: 'NGA', numeric: '566', currency: 'NGN', status: 'active', dial: '+234' },
  { id: 5, name: 'Ghana', alpha2: 'GH', alpha3: 'GHA', numeric: '288', currency: 'GHS', status: 'inactive', dial: '+233' },
  { id: 6, name: 'South Africa', alpha2: 'ZA', alpha3: 'ZAF', numeric: '710', currency: 'ZAR', status: 'active', dial: '+27' },
  { id: 7, name: 'Rwanda', alpha2: 'RW', alpha3: 'RWA', numeric: '646', currency: 'RWF', status: 'active', dial: '+250' },
  { id: 8, name: 'Tanzania', alpha2: 'TZ', alpha3: 'TZA', numeric: '834', currency: 'TZS', status: 'inactive', dial: '+255' },
]

interface DrawerProps {
  open: boolean
  onClose: () => void
  country?: typeof countries[0] | null
}

function CountryDrawer({ open, onClose, country }: DrawerProps) {
  if (!open) return null
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
            { label: 'Country Name', placeholder: 'e.g. United States', value: country?.name || '' },
            { label: 'Alpha-2 Code', placeholder: 'e.g. US', value: country?.alpha2 || '' },
            { label: 'Alpha-3 Code', placeholder: 'e.g. USA', value: country?.alpha3 || '' },
            { label: 'Numeric Code', placeholder: 'e.g. 840', value: country?.numeric || '' },
            { label: 'Default Currency', placeholder: 'e.g. USD', value: country?.currency || '' },
            { label: 'Dial Code', placeholder: 'e.g. +1', value: country?.dial || '' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>{field.label}</label>
              <input
                defaultValue={field.value}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
                style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
                onFocus={e => e.target.style.borderColor = '#37BBA2'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {country ? 'Save Changes' : 'Add Country'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCountries() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCountry, setEditCountry] = useState<typeof countries[0] | null>(null)

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

        <CountryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} country={editCountry} />
      </div>
  )
}
