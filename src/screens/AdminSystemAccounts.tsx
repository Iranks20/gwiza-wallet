'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import type { SystemAccount } from '@/services/systemAccountsService'
import {
  listSystemAccounts,
  createSystemAccount,
  updateSystemAccount,
  removeSystemAccount,
} from '@/services/systemAccountsService'
import { listCountries } from '@/services/countriesService'

const emptyForm: Omit<SystemAccount, 'id'> = { country: '', currency: '', walletId: '', name: '', type: 'FEES', status: 'active' }

const ACCOUNT_TYPES = ['FEES', 'SETTLEMENT', 'FLOAT', 'RESERVE']

interface SystemAccountDrawerProps {
  open: boolean
  onClose: () => void
  account: SystemAccount | null
  countryOptions: string[]
  onSave: (data: SystemAccount | Omit<SystemAccount, 'id'>) => void
}

function SystemAccountDrawer({ open, onClose, account, countryOptions, onSave }: SystemAccountDrawerProps) {
  const [form, setForm] = useState<Omit<SystemAccount, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(account ? { ...account } : { ...emptyForm })
  }, [open, account])

  if (!open) return null
  const handleSave = () => {
    if (account?.id) {
      const { id, ...rest } = form as SystemAccount
      onSave({ ...account, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<SystemAccount, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>
            {account ? 'Edit System Account' : 'Add System Account'}
          </h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Fees Ledger Account"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
            <select
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="">Select country</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Currency</label>
            <input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              placeholder="e.g. KES, NGN"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm font-mono"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Linked Wallet ID</label>
            <input
              value={form.walletId}
              onChange={e => setForm(f => ({ ...f, walletId: e.target.value }))}
              placeholder="e.g. WLT-SYS-001"
              className="w-full px-3 py-2.5 border rounded-lg outline-none transition-all text-sm font-mono"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              {ACCOUNT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {account ? 'Save Changes' : 'Add System Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSystemAccounts({ country, embedded }: { country?: string; embedded?: boolean }) {
  const [accounts, setAccounts] = useState<SystemAccount[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [walletSearch, setWalletSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<SystemAccount | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const loadAccounts = () =>
    listSystemAccounts({
      country,
      status: statusFilter === 'all' ? undefined : statusFilter,
      walletIdSearch: walletSearch || undefined,
    }).then(setAccounts)
  useEffect(() => { loadAccounts() }, [country, statusFilter, walletSearch])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => c.name))) }, [])

  const handleSave = async (data: SystemAccount | Omit<SystemAccount, 'id'>) => {
    if ('id' in data && data.id) {
      await updateSystemAccount(data.id, data)
    } else {
      await createSystemAccount(data as Omit<SystemAccount, 'id'>)
    }
    loadAccounts()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeSystemAccount(deleteId)
      loadAccounts()
      setDeleteId(null)
    }
  }

  const filtered = accounts.filter(a => !country || a.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="System Accounts"
          subtitle="Internal ledger accounts powering the wallet and fee engine"
          action={{ label: 'Add System Account', onClick: () => { setEditAccount(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          value={walletSearch}
          onChange={e => setWalletSearch(e.target.value)}
          placeholder="Search by wallet ID..."
          className="px-3 py-2.5 border rounded-xl text-sm outline-none w-52"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
          onFocus={e => e.target.style.borderColor = '#37BBA2'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} accounts</span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Account Code', 'Name', 'Country', 'Currency', 'Linked Wallet', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{r.walletId}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#04304B', fontSize: 13 }}>{r.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#6B7280', fontSize: 13 }}>{r.country}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currency}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{r.walletId}</span>
                </td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={r.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditAccount(r); setDrawerOpen(true) }}
                      className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer"
                      style={{ color: '#37BBA2' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
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

      <SystemAccountDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} account={editAccount} countryOptions={countryOptions} onSave={handleSave} />
      <Components.ConfirmModal
        open={deleteId != null}
        title="Delete System Account?"
        message={<>Are you sure you want to delete this system account? This action cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )

  if (embedded) return content
  return content
}
