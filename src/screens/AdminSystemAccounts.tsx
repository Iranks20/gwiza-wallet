'use client'
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import Components from '../components'
import { Plus, Edit2, X, Power, PowerOff, ArrowLeft } from 'lucide-react'
import type { SystemAccount } from '@/services/systemAccountsService'
import { listSystemAccounts, createSystemAccount, updateSystemAccount } from '@/services/systemAccountsService'
import { listCountries } from '@/services/countriesService'
import { listCurrencies } from '@/services/currenciesService'
import { ApiError } from '@/api/client'

type CountryOption = { id: number; name: string }

const emptyForm: { name: string; description: string; countryId: number; currency: string; status: string } = { name: '', description: '', countryId: 0, currency: '', status: 'active' }

interface SystemAccountDrawerProps {
  open: boolean
  onClose: () => void
  account: SystemAccount | null
  countryId: number
  countryOptions: CountryOption[]
  currencyOptions: { code: string; name: string }[]
  onSave: (data: Omit<SystemAccount, 'id'> | SystemAccount) => void
}

function SystemAccountDrawer({ open, onClose, account, countryId, countryOptions, currencyOptions, onSave }: SystemAccountDrawerProps) {
  const [form, setForm] = useState({ ...emptyForm, countryId: countryId || emptyForm.countryId })
  useEffect(() => {
    if (open) {
      if (account) setForm({ name: account.name, description: account.description || '', countryId: account.countryId, currency: account.currency, status: account.status })
      else setForm({ ...emptyForm, countryId: countryId || 0 })
    }
  }, [open, account, countryId])

  if (!open) return null
  const handleSave = () => {
    if (account?.id) onSave({ ...account, ...form })
    else onSave(form as Omit<SystemAccount, 'id'>)
    onClose()
  }
  const showCountrySelect = countryId === 0
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{account ? 'Edit System Account' : 'Add System Account'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fees Ledger Account" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          </div>
          {showCountrySelect && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
              <select value={form.countryId || ''} onChange={e => setForm(f => ({ ...f, countryId: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                <option value="">Select country</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency (3 letters)</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select currency</option>
              {currencyOptions.map(c => (<option key={c.code} value={c.code}>{c.code} – {c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90" style={{ background: '#37BBA2', fontSize: 14 }}>{account ? 'Save Changes' : 'Add System Account'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSystemAccounts({ country, countryId: countryIdProp, embedded }: { country?: string; countryId?: number; embedded?: boolean }) {
  const { countryId: countryIdParam } = useParams<{ countryId?: string }>()
  const countryId = countryIdProp ?? (countryIdParam ? parseInt(countryIdParam, 10) : 0)
  const [accounts, setAccounts] = useState<SystemAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<{ code: string; name: string }[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<SystemAccount | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const [activateId, setActivateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const configureBase = countryId ? `/admin/settings/countries/${countryId}/configure` : ''

  const loadAccounts = () => {
    setError(null)
    setLoading(true)
    listSystemAccounts({ countryId: countryId > 0 ? countryId : undefined, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(setAccounts)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load accounts') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadAccounts() }, [countryId, statusFilter])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => ({ id: c.id, name: c.name })))) }, [])
  useEffect(() => { listCurrencies().then(setCurrencyOptions) }, [])

  const handleSave = async (data: Omit<SystemAccount, 'id'> | SystemAccount) => {
    setError(null)
    try {
      if ('id' in data && data.id) await updateSystemAccount(data.id, data)
      else await createSystemAccount(data as Omit<SystemAccount, 'id'>)
      loadAccounts()
      setDrawerOpen(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateId == null) return
    setError(null)
    try {
      await updateSystemAccount(deactivateId, { status: 'inactive' })
      loadAccounts()
      setDeactivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async () => {
    if (activateId == null) return
    setError(null)
    try {
      await updateSystemAccount(activateId, { status: 'active' })
      loadAccounts()
      setActivateId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to activate')
    }
  }

  const countryName = (id: number) => countryOptions.find(c => c.id === id)?.name ?? String(id)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && configureBase && (
        <div className="mb-4">
          <Link to={configureBase} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#37BBA2' }}>
            <ArrowLeft size={16} /> Back to configure
          </Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader title="System Accounts" subtitle="Internal ledger accounts powering the wallet and fee engine" action={{ label: 'Add System Account', onClick: () => { setEditAccount(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }} />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>System Accounts</h2>
          <button onClick={() => { setEditAccount(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}><Plus size={15} /> Add Account</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading && <p className="mb-2 text-sm" style={{ color: '#6B7280' }}>Loading system accounts…</p>}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{accounts.length} accounts</span>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['ID', 'Name', 'Description', 'Country', 'Currency', 'Wallet ID', 'Status', 'Date created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && accounts.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.id}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.name}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.description || '—'}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{countryName(r.countryId)}</span></td>
                <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currency}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.walletId ?? '—'}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.dateCreated ? new Date(r.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditAccount(r); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                    {r.status === 'active' ? (
                      <button onClick={() => setDeactivateId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }} title="Deactivate"><PowerOff size={14} /></button>
                    ) : (
                      <button onClick={() => setActivateId(r.id)} className="p-1.5 rounded-lg hover:bg-green-50 cursor-pointer" style={{ color: '#4CAF50' }} title="Activate"><Power size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SystemAccountDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} account={editAccount} countryId={countryId} countryOptions={countryOptions} currencyOptions={currencyOptions} onSave={handleSave} />
      <Components.ConfirmModal open={deactivateId != null} title="Deactivate System Account?" message={<>Are you sure you want to deactivate this account?</>} confirmLabel="Deactivate" onConfirm={handleDeactivate} onCancel={() => setDeactivateId(null)} />
      <Components.ConfirmModal open={activateId != null} title="Activate System Account?" message={<>Are you sure you want to activate this account?</>} confirmLabel="Activate" onConfirm={handleActivate} onCancel={() => setActivateId(null)} />
    </div>
  )
  return content
}
