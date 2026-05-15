'use client'
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import Components from '../components'
import { Plus, Edit2, X, Power, PowerOff, Search, Smartphone, CreditCard, Building, ArrowLeft, Loader2 } from 'lucide-react'
import type { TxnChannel } from '@/services/transactionChannelsService'
import { listTransactionChannels, createTransactionChannel, updateTransactionChannel, TXN_CHANNEL_TYPE_ENUM } from '@/services/transactionChannelsService'
import { listCountries } from '@/services/countriesService'
import { listCurrencies } from '@/services/currenciesService'
import { ApiError } from '@/api/client'
import { Table } from '@/components/ui/table'

const typeIcon = (t: string) => {
  if (t === 'mobile' || t === 'agent') return <Smartphone size={13} />
  if (t === 'card' || t === 'atm') return <CreditCard size={13} />
  return <Building size={13} />
}

const typeColor = (t: string): { bg: string; text: string } => {
  const map: Record<string, { bg: string; text: string }> = {
    mobile: { bg: '#E8F8F5', text: '#37BBA2' },
    agent: { bg: '#F0FDF4', text: '#166534' },
    teller: { bg: '#EFF6FF', text: '#1E40AF' },
    atm: { bg: '#FFF7ED', text: '#9A3412' },
    switch: { bg: '#F3F4F6', text: '#374151' },
    card: { bg: '#FFF7ED', text: '#9A3412' },
  }
  return map[t] || { bg: '#F3F4F6', text: '#6B7280' }
}

type CountryOption = { id: number; name: string }

interface ChannelDrawerProps {
  open: boolean
  onClose: () => void
  channel: TxnChannel | null
  countryId: number
  countryOptions: CountryOption[]
  currencyOptions: { code: string; name: string }[]
  onSave: (data: Omit<TxnChannel, 'id'> | TxnChannel) => void
}

function ChannelDrawer({ open, onClose, channel, countryId, countryOptions, currencyOptions, onSave }: ChannelDrawerProps) {
  const [form, setForm] = useState<{ type: string; name: string; displayName: string; countryId: number; currency: string; status: string }>({ type: 'mobile', name: '', displayName: '', countryId: countryId || 0, currency: '', status: 'active' })
  useEffect(() => {
    if (open) {
      if (channel) setForm({ type: channel.type, name: channel.name, displayName: channel.displayName, countryId: channel.countryId, currency: channel.currency, status: channel.status })
      else setForm({ type: 'mobile', name: '', displayName: '', countryId: countryId || 0, currency: '', status: 'active' })
    }
  }, [open, channel, countryId])

  if (!open) return null
  const handleSave = () => {
    if (channel?.id) onSave({ ...channel, ...form })
    else onSave(form as Omit<TxnChannel, 'id'>)
    onClose()
  }
  const showCountrySelect = countryId === 0
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{channel ? 'Edit Channel' : 'Add Channel'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Channel Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              {TXN_CHANNEL_TYPE_ENUM.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mobile Money" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Display Name</label>
            <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="e.g. Mobile Money" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
          </div>
          {showCountrySelect && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Country</label>
              <select value={form.countryId || ''} onChange={e => setForm(f => ({ ...f, countryId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
                <option value="">Select country</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Currency</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              <option value="">Select currency</option>
              {currencyOptions.map(c => (<option key={c.code} value={c.code}>{c.code} – {c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#37BBA2', fontSize: 14 }}>{channel ? 'Save Changes' : 'Add Channel'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminChannels({ country, countryId: countryIdProp, embedded }: { country?: string; countryId?: number; embedded?: boolean }) {
  const { countryId: countryIdParam } = useParams<{ countryId?: string }>()
  const countryId = countryIdProp ?? (countryIdParam ? parseInt(countryIdParam, 10) : 0)
  const [channels, setChannels] = useState<TxnChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<{ code: string; name: string }[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editChannel, setEditChannel] = useState<TxnChannel | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const configureBase = countryId ? `/admin/settings/countries/${countryId}/configure` : ''

  const loadChannels = () => {
    setError(null)
    setLoading(true)
    listTransactionChannels({
      countryId: countryId > 0 ? countryId : undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    })
      .then(setChannels)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load channels') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadChannels() }, [countryId, statusFilter])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => ({ id: c.id, name: c.name })))) }, [])
  useEffect(() => { listCurrencies().then(setCurrencyOptions) }, [])

  const handleSave = async (data: Omit<TxnChannel, 'id'> | TxnChannel) => {
    setError(null)
    try {
      if ('id' in data && data.id) await updateTransactionChannel(data.id, data)
      else await createTransactionChannel(data as Omit<TxnChannel, 'id'>)
      loadChannels()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateTransactionChannel(deactivateId, { status: 'inactive' })
      loadChannels()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateTransactionChannel(activateId, { status: 'active' })
      loadChannels()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const countryName = (id: number) => countryOptions.find(c => c.id === id)?.name ?? String(id)
  const filtered = channels.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.displayName.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.type === typeFilter
    return matchSearch && matchType
  })

  const content = (
    <div>
      {embedded && configureBase && (
        <div className="mb-4">
          <Link to={configureBase} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#37BBA2' }}>
            <ArrowLeft size={16} /> Back to configure
          </Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader title="Transaction Channels" subtitle="Configure payment and transaction channels" action={{ label: 'Add Channel', onClick: () => { setEditChannel(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }} />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Transaction Channels</h2>
          <button onClick={() => { setEditChannel(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}><Plus size={15} /> Add Channel</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && (
        <div className="mb-2 inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
          <Loader2 size={16} className="animate-spin" />
          <span>Loading transaction channels...</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels..." className="pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none w-56" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
          <option value="all">All Types</option>
          {TXN_CHANNEL_TYPE_ENUM.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} channels</span>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Display Name', 'Type', 'Country', 'Currency', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.map(c => {
              const tc = typeColor(c.type)
              return (
                <tr key={c.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-5 py-3"><span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{c.name}</span></td>
                  <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{c.displayName}</span></td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg capitalize" style={{ background: tc.bg, color: tc.text }}>{typeIcon(c.type)} {c.type}</span>
                  </td>
                  <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{countryName(c.countryId)}</span></td>
                  <td className="px-5 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{c.currency}</span></td>
                  <td className="px-5 py-3"><Components.StatusBadge status={c.status} size="sm" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditChannel(c); setDrawerOpen(true) }} className="w-11 h-11 inline-flex items-center justify-center hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }} title="Edit channel" aria-label="Edit channel"><Edit2 size={14} /></button>
                      {c.status === 'active' ? (
                        <button onClick={() => setDeactivateId(c.id)} className="w-11 h-11 inline-flex items-center justify-center hover:bg-red-50 rounded-lg cursor-pointer" style={{ color: '#F44336' }} title="Deactivate channel" aria-label="Deactivate channel"><PowerOff size={14} /></button>
                      ) : (
                        <button onClick={() => setActivateId(c.id)} className="w-11 h-11 inline-flex items-center justify-center hover:bg-green-50 rounded-lg cursor-pointer" style={{ color: '#4CAF50' }} title="Activate channel" aria-label="Activate channel"><Power size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
      <ChannelDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} channel={editChannel} countryId={countryId} countryOptions={countryOptions} currencyOptions={currencyOptions} onSave={handleSave} />
      <Components.ConfirmModal open={deactivateId != null} title="Deactivate Channel?" message={<>Are you sure you want to deactivate this channel?</>} onConfirm={handleDeactivate} onCancel={() => setDeactivateId(null)} />
      <Components.ConfirmModal open={activateId != null} title="Activate Channel?" message={<>Are you sure you want to activate this channel?</>} onConfirm={handleActivate} onCancel={() => setActivateId(null)} />
    </div>
  )
  return content
}
