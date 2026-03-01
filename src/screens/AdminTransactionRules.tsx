'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Edit2, Trash2, Receipt, X } from 'lucide-react'
import type { TransactionRule } from '@/services/transactionRulesService'
import { listTransactionRules, createTransactionRule, updateTransactionRule, removeTransactionRule } from '@/services/transactionRulesService'
import { listCountries } from '@/services/countriesService'
import { listProfileTypeGroups } from '@/services/profileTypeGroupsService'

const emptyForm: Omit<TransactionRule, 'id'> = {
  country: '', name: '', srcCountry: '', dstCountry: '', opType: 'P2P', channel: '', group: '',
  min: '', max: '', action: 'allow', priority: 10, active: 'active',
}
const OP_TYPES = ['P2P', 'BILL_PAYMENT', 'CASH_IN', 'CASH_OUT', 'TRANSFER']
const CHANNELS = ['MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'USSD', 'API']

interface RuleDrawerProps {
  open: boolean
  onClose: () => void
  rule: TransactionRule | null
  countryOptions: string[]
  groupOptions: string[]
  onSave: (data: TransactionRule | Omit<TransactionRule, 'id'>) => void
}

function RuleDrawer({ open, onClose, rule, countryOptions, groupOptions, onSave }: RuleDrawerProps) {
  const [form, setForm] = useState<Omit<TransactionRule, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) setForm(rule ? { ...rule } : { ...emptyForm })
  }, [open, rule])

  if (!open) return null
  const handleSave = () => {
    if (rule?.id) {
      const { id, ...rest } = form as TransactionRule
      onSave({ ...rule, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<TransactionRule, 'id'>)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{rule ? 'Edit Rule' : 'Add Rule'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. P2P Domestic" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Country</label>
            <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select</option>
              {countryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Source Country</label>
              <select value={form.srcCountry} onChange={e => setForm(f => ({ ...f, srcCountry: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                <option value="">Select</option>
                {countryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Destination Country</label>
              <select value={form.dstCountry} onChange={e => setForm(f => ({ ...f, dstCountry: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                <option value="">Select</option>
                {countryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Operation Type</label>
            <select value={form.opType} onChange={e => setForm(f => ({ ...f, opType: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              {OP_TYPES.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Channel</label>
            <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select</option>
              {CHANNELS.map(ch => (<option key={ch} value={ch}>{ch}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile Group</label>
            <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="">Select</option>
              {groupOptions.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Min Amount</label>
              <input value={form.min} onChange={e => setForm(f => ({ ...f, min: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Max Amount</label>
              <input value={form.max} onChange={e => setForm(f => ({ ...f, max: e.target.value }))} placeholder="100000" className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Action</label>
            <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Priority</label>
            <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select value={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3 shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>{rule ? 'Save Changes' : 'Add Rule'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTransactionRules({ country, embedded, configureBasePath }: { country?: string; embedded?: boolean; configureBasePath?: string }) {
  const [rules, setRules] = useState<TransactionRule[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [groupOptions, setGroupOptions] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRule, setEditRule] = useState<TransactionRule | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const showFeesLink = Boolean(embedded && configureBasePath)

  const loadRules = () => listTransactionRules({ country, status: statusFilter === 'all' ? undefined : statusFilter }).then(setRules)
  useEffect(() => { loadRules() }, [country, statusFilter])
  useEffect(() => { listCountries().then(cs => setCountryOptions(cs.map(c => c.name))) }, [])
  useEffect(() => { listProfileTypeGroups().then(gs => setGroupOptions(gs.map(g => g.name))) }, [])

  const handleSave = async (data: TransactionRule | Omit<TransactionRule, 'id'>) => {
    if ('id' in data && data.id) {
      await updateTransactionRule(data.id, data)
    } else {
      await createTransactionRule(data as Omit<TransactionRule, 'id'>)
    }
    loadRules()
  }
  const handleDelete = async () => {
    if (deleteId != null) {
      await removeTransactionRule(deleteId)
      loadRules()
      setDeleteId(null)
    }
  }

  const filtered = rules.filter(r => !country || r.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Rules"
          subtitle="Rule engine controlling which transactions are allowed or blocked"
          action={{ label: 'Add Rule', onClick: () => { setEditRule(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} rules</span>
      </div>

      <div className="rounded-xl border overflow-auto" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="min-w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Country', 'Source', 'Destination', 'Operation', 'Channel', 'Profile Group', 'Amount Range', 'Action', 'Priority', 'Status', ...(showFeesLink ? ['Fees'] : []), 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{r.name}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.country}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.srcCountry}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.dstCountry}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.opType}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.channel}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.group}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.min} – {r.max}</span></td>
                <td className="px-4 py-3">
                  <Components.StatusBadge status={r.action === 'allow' ? 'success' : 'blocked'} label={r.action === 'allow' ? 'Allow' : 'Deny'} size="sm" />
                </td>
                <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: '#F3F4F6', color: '#6B7280' }}>{r.priority}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.active} size="sm" /></td>
                {showFeesLink && (
                  <td className="px-4 py-3">
                    <Link to={`${configureBasePath}/transaction-rules/${r.id}/transaction-fees`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ background: '#E8F8F5', color: '#037F67' }}>
                      <Receipt size={12} /> Fees
                    </Link>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditRule(r); setDrawerOpen(true) }} className="p-1.5 rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RuleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} rule={editRule} countryOptions={countryOptions} groupOptions={groupOptions} onSave={handleSave} />
      <Components.ConfirmModal open={deleteId != null} title="Delete Rule?" message={<>Are you sure you want to delete this rule?</>} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )

  return content
}
