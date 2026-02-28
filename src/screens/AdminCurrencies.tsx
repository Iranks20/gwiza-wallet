'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'

const currencies = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, country: 'Kenya', status: 'active' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, country: 'Nigeria', status: 'active' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2, country: 'Ghana', status: 'active' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, country: 'South Africa', status: 'active' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', decimals: 0, country: 'Rwanda', status: 'active' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, country: 'United Kingdom', status: 'active' },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, country: 'United States', status: 'active' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, country: 'European Union', status: 'inactive' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 2, country: 'Tanzania', status: 'pending' },
]

type Currency = typeof currencies[0]

function CurrencyDrawer({ currency, onClose, onSave }: { currency?: Currency; onClose: () => void; onSave: (c: Currency) => void }) {
  const [form, setForm] = useState<Currency>(currency || { code: '', name: '', symbol: '', decimals: 2, country: '', status: 'active' })
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{currency ? 'Edit Currency' : 'Add Currency'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {[
            { label: 'Currency Code', key: 'code', placeholder: 'e.g. KES', hint: 'ISO 4217 3-letter code' },
            { label: 'Currency Name', key: 'name', placeholder: 'e.g. Kenyan Shilling' },
            { label: 'Symbol', key: 'symbol', placeholder: 'e.g. KSh' },
            { label: 'Country', key: 'country', placeholder: 'e.g. Kenya' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>{f.label}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm transition-all"
                style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
                onFocus={e => e.target.style.borderColor = '#37BBA2'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              {f.hint && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{f.hint}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Decimal Places</label>
            <select value={form.decimals} onChange={e => setForm({ ...form, decimals: +e.target.value })} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {currency ? 'Save Changes' : 'Add Currency'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCurrencies() {
  const [data, setData] = useState(currencies)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState<{ open: boolean; item?: Currency }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = data.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !search || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || c.status === statusFilter
    return matchQ && matchS
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Currencies"
          subtitle="Manage supported currencies across the platform"
          action={{ label: 'Add Currency', onClick: () => setDrawer({ open: true }), icon: <Plus size={15} /> }}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code, name, country..." className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} currencies</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Code', 'Name', 'Symbol', 'Decimals', 'Country', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.code} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-5 py-3"><span className="font-mono font-bold" style={{ color: '#37BBA2', fontSize: 13 }}>{c.code}</span></td>
                  <td className="px-5 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{c.name}</span></td>
                  <td className="px-5 py-3"><span className="font-mono font-semibold" style={{ color: '#04304B', fontSize: 13 }}>{c.symbol}</span></td>
                  <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: '#F3F4F6', color: '#6B7280' }}>{c.decimals}</span></td>
                  <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.country}</span></td>
                  <td className="px-5 py-3"><Components.StatusBadge status={c.status} size="sm" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDrawer({ open: true, item: c })} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(c.code)} className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drawer.open && (
          <CurrencyDrawer
            currency={drawer.item}
            onClose={() => setDrawer({ open: false })}
            onSave={c => { setData(prev => drawer.item ? prev.map(x => x.code === drawer.item?.code ? c : x) : [...prev, c]); setDrawer({ open: false }) }}
          />
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-80 text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
                <Trash2 size={22} style={{ color: '#F44336' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#04304B', fontSize: 16 }}>Delete Currency?</h3>
              <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Are you sure you want to delete <strong>{deleteConfirm}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
                <button onClick={() => { setData(prev => prev.filter(c => c.code !== deleteConfirm)); setDeleteConfirm(null) }} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#F44336', fontSize: 14 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
