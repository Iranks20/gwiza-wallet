'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X, Search, Smartphone, Globe, CreditCard, Building } from 'lucide-react'

const channels = [
  { id: 'CH-001', code: 'MOBILE_MONEY', name: 'Mobile Money', type: 'mobile', country: 'Kenya', currency: 'KES', provider: 'M-Pesa', status: 'active' },
  { id: 'CH-002', code: 'BANK_TRANSFER', name: 'Bank Transfer', type: 'bank', country: 'Nigeria', currency: 'NGN', provider: 'GTBank', status: 'active' },
  { id: 'CH-003', code: 'CARD_PAYMENT', name: 'Card Payment', type: 'card', country: 'Ghana', currency: 'GHS', provider: 'Visa/Mastercard', status: 'active' },
  { id: 'CH-004', code: 'USSD', name: 'USSD', type: 'ussd', country: 'Nigeria', currency: 'NGN', provider: 'MTN', status: 'active' },
  { id: 'CH-005', code: 'INTERNET_BANKING', name: 'Internet Banking', type: 'bank', country: 'South Africa', currency: 'ZAR', provider: 'Nedbank', status: 'inactive' },
  { id: 'CH-006', code: 'QR_CODE', name: 'QR Code', type: 'mobile', country: 'Rwanda', currency: 'RWF', provider: 'MTN', status: 'active' },
  { id: 'CH-007', code: 'WALLET_API', name: 'Wallet API', type: 'api', country: 'UK', currency: 'GBP', provider: 'Internal', status: 'active' },
]

const typeIcon = (t: string) => {
  if (t === 'mobile' || t === 'ussd') return <Smartphone size={13} />
  if (t === 'bank') return <Building size={13} />
  if (t === 'card') return <CreditCard size={13} />
  return <Globe size={13} />
}

const typeColor = (t: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    mobile: { bg: '#E8F8F5', text: '#37BBA2' },
    bank: { bg: '#EFF6FF', text: '#1E40AF' },
    card: { bg: '#FFF7ED', text: '#9A3412' },
    ussd: { bg: '#F0FDF4', text: '#166534' },
    api: { bg: '#F3F4F6', text: '#374151' },
  }
  return map[t] || { bg: '#F3F4F6', text: '#6B7280' }
}

type Channel = typeof channels[0]

function ChannelDrawer({ item, onClose, onSave }: { item?: Channel; onClose: () => void; onSave: (c: Channel) => void }) {
  const [form, setForm] = useState<Channel>(item || { id: '', code: '', name: '', type: 'mobile', country: '', currency: '', provider: '', status: 'active' })
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{item ? 'Edit Channel' : 'Add Channel'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {[
            { label: 'Channel Code', key: 'code', placeholder: 'e.g. MOBILE_MONEY' },
            { label: 'Channel Name', key: 'name', placeholder: 'e.g. Mobile Money' },
            { label: 'Country', key: 'country', placeholder: 'e.g. Kenya' },
            { label: 'Currency', key: 'currency', placeholder: 'e.g. KES' },
            { label: 'Provider', key: 'provider', placeholder: 'e.g. M-Pesa' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Channel Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['mobile', 'bank', 'card', 'ussd', 'api'].map(t => {
                const tc = typeColor(t)
                return (
                  <button key={t} onClick={() => setForm({ ...form, type: t })} className="py-2 rounded-xl border capitalize text-sm cursor-pointer flex items-center justify-center gap-2" style={{ borderColor: form.type === t ? '#37BBA2' : '#E5E7EB', background: form.type === t ? '#E8F8F5' : 'white', color: form.type === t ? '#37BBA2' : '#6B7280', fontSize: 13 }}>
                    {typeIcon(t)} {t}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#37BBA2', fontSize: 14 }}>{item ? 'Save Changes' : 'Add Channel'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminChannels({ country, embedded }: { country?: string; embedded?: boolean }) {
  const [data, setData] = useState(channels)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState<{ open: boolean; item?: Channel }>({ open: false })

  const countries = [...new Set(channels.map(c => c.country))]
  const filtered = data.filter(c => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    const effectiveCountryFilter = country ? country : countryFilter
    const matchCountry = effectiveCountryFilter === 'all' || c.country === effectiveCountryFilter
    const matchType = typeFilter === 'all' || c.type === typeFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchCountry && matchType && matchStatus
  })

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Channels"
          subtitle="Configure payment and transaction channels"
          action={{ label: 'Add Channel', onClick: () => setDrawer({ open: true }), icon: <Plus size={15} /> }}
        />
      )}

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels..." className="pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none w-56" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          {[
            { label: 'Country', value: countryFilter, set: setCountryFilter, opts: [['all', 'All Countries'], ...countries.map(c => [c, c])] },
            { label: 'Type', value: typeFilter, set: setTypeFilter, opts: [['all','All Types'],['mobile','Mobile'],['bank','Bank'],['card','Card'],['ussd','USSD'],['api','API']] },
            { label: 'Status', value: statusFilter, set: setStatusFilter, opts: [['all','All Status'],['active','Active'],['inactive','Inactive']] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} channels</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Code', 'Name', 'Type', 'Country', 'Currency', 'Provider', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const tc = typeColor(c.type)
                return (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3"><span className="font-mono font-bold" style={{ color: '#37BBA2', fontSize: 12 }}>{c.code}</span></td>
                    <td className="px-5 py-3"><span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{c.name}</span></td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg capitalize" style={{ background: tc.bg, color: tc.text }}>
                        {typeIcon(c.type)} {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.country}</span></td>
                    <td className="px-5 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{c.currency}</span></td>
                    <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.provider}</span></td>
                    <td className="px-5 py-3"><Components.StatusBadge status={c.status} size="sm" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDrawer({ open: true, item: c })} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      {drawer.open && (
        <ChannelDrawer
          item={drawer.item}
          onClose={() => setDrawer({ open: false })}
          onSave={item => {
            setData(prev => (drawer.item ? prev.map(x => (x.id === drawer.item?.id ? item : x)) : [...prev, item]))
            setDrawer({ open: false })
          }}
        />
      )}
    </div>
  )

  if (embedded) return content
  return content
}
