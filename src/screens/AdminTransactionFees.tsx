'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, X } from 'lucide-react'
import type { TxnFee } from '@/services/transactionFeesService'
import {
  listTransactionFees,
  createTransactionFee,
  updateTransactionFee,
} from '@/services/transactionFeesService'
import { listTransactionRules } from '@/services/transactionRulesService'
import { Table } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const emptyForm: Omit<TxnFee, 'id'> = {
  txnRuleId: 0,
  amountLower: 0,
  amountUpper: 0,
  feeType: 'fixed',
  transactionFee: 0,
  status: 'active',
}

interface FeeDrawerProps {
  open: boolean
  onClose: () => void
  fee: TxnFee | null
  ruleOptions: { id: number; name: string }[]
  defaultRuleId?: number
  onSave: (data: TxnFee | Omit<TxnFee, 'id'>) => void
}

function FeeDrawer({ open, onClose, fee, ruleOptions, defaultRuleId, onSave }: FeeDrawerProps) {
  const [form, setForm] = useState<Omit<TxnFee, 'id'> & { id?: number }>({ ...emptyForm })
  useEffect(() => {
    if (open) {
      if (fee) {
        setForm({ ...fee })
      } else {
        setForm({ ...emptyForm, txnRuleId: defaultRuleId ?? 0 })
      }
    }
  }, [open, fee, defaultRuleId])

  if (!open) return null
  const handleSave = () => {
    if (fee?.id) {
      const { id, ...rest } = form as TxnFee
      onSave({ ...fee, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<TxnFee, 'id'>)
    }
    onClose()
  }
  const inputClass = 'w-full px-3 py-2.5 border rounded-lg outline-none text-sm'
  const inputStyle = { borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: '#04304B', fontSize: 13 }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{fee ? 'Edit Fee' : 'Add Fee'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Rule</label>
            <select
              value={form.txnRuleId || ''}
              onChange={e => setForm(f => ({ ...f, txnRuleId: parseInt(e.target.value, 10) || 0 }))}
              className={inputClass}
              style={inputStyle}
              disabled={!!defaultRuleId}
            >
              <option value="">Select</option>
              {ruleOptions.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Fee Type</label>
            <select
              value={form.feeType}
              onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Amount Lower</label>
            <input
              type="number"
              min={0}
              value={form.amountLower}
              onChange={e => setForm(f => ({ ...f, amountLower: parseFloat(e.target.value) || 0 }))}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Amount Upper</label>
            <input
              type="number"
              min={0}
              value={form.amountUpper}
              onChange={e => setForm(f => ({ ...f, amountUpper: parseFloat(e.target.value) || 0 }))}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Transaction Fee (value)</label>
            <input
              type="number"
              min={0}
              step="any"
              value={form.transactionFee}
              onChange={e => setForm(f => ({ ...f, transactionFee: parseFloat(e.target.value) || 0 }))}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass} style={inputStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>{fee ? 'Save Changes' : 'Add Fee'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTransactionFees({ country, embedded, ruleId }: { country?: string; embedded?: boolean; ruleId?: number }) {
  const [fees, setFees] = useState<TxnFee[]>([])
  const [rules, setRules] = useState<{ id: number; name: string }[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editFee, setEditFee] = useState<TxnFee | null>(null)
  const [amount, setAmount] = useState('1000')
  const [sim, setSim] = useState<{ base: string; fixed: string; percent: string; total: string } | null>(null)

  const loadFees = () =>
    listTransactionFees({ ruleId, status: statusFilter === 'all' ? undefined : statusFilter }).then(setFees)
  useEffect(() => { loadFees() }, [ruleId, statusFilter])
  useEffect(() => {
    listTransactionRules().then(rs => setRules(rs.map(r => ({ id: r.id, name: r.description || `Rule #${r.id}` }))))
  }, [])

  const handleSave = async (data: TxnFee | Omit<TxnFee, 'id'>) => {
    if ('id' in data && data.id) {
      await updateTransactionFee(data.id, data)
    } else {
      await createTransactionFee(data as Omit<TxnFee, 'id'>)
    }
    loadFees()
  }
  const toggleStatus = async (f: TxnFee) => {
    await updateTransactionFee(f.id, { status: f.status === 'active' ? 'inactive' : 'active' })
    loadFees()
  }

  const ruleNameMap = Object.fromEntries(rules.map(r => [r.id, r.name]))
  const filtered = fees.filter(f => !ruleId || f.txnRuleId === ruleId)

  const content = (
    <div>
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Fees"
          subtitle="Configure fee schemes and simulate customer charges"
          action={{ label: 'Add Fee', onClick: () => { setEditFee(null); setDrawerOpen(true) }, icon: <Plus size={15} /> }}
        />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Transaction Fees</h2>
          <button onClick={() => { setEditFee(null); setDrawerOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ background: '#37BBA2', fontSize: 14 }}>
            <Plus size={15} /> Add Fee
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} fees</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>Configured Fees</span>
          </div>
          <Table className="w-full min-w-max">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Rule', 'Fee Type', 'Amount Range', 'Value', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{ruleNameMap[f.txnRuleId] ?? `Rule #${f.txnRuleId}`}</span></td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#EFF6FF', color: '#1E40AF' }}>{f.feeType}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{f.amountLower} – {f.amountUpper}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{f.feeType === 'percentage' ? f.transactionFee + '%' : String(f.transactionFee)}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={f.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditFee(f); setDrawerOpen(true) }} className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-teal-50 cursor-pointer" style={{ color: '#37BBA2' }} title="Edit fee" aria-label="Edit fee"><Edit2 size={14} /></button>
                      <button onClick={() => toggleStatus(f)} className="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer" style={{ background: f.status === 'active' ? '#FEE2E2' : '#D1FAE5', color: f.status === 'active' ? '#B91C1C' : '#047857' }}>
                        {f.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#04304B', fontSize: 15 }}>Fee Simulation Tool</h3>
          <p className="mb-4" style={{ color: '#6B7280', fontSize: 13 }}>Enter an amount to see a sample fee breakdown.</p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Amount</label>
              <Input value={amount} onChange={e => setAmount(e.target.value)} className="text-sm" />
            </div>
          </div>
          <button onClick={() => {
            const amt = Number(amount || '0')
            const fixed = 10
            const percent = amt * 0.015
            setSim({ base: amt.toFixed(2), fixed: fixed.toFixed(2), percent: percent.toFixed(2), total: (fixed + percent).toFixed(2) })
          }} className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer mb-4" style={{ background: '#37BBA2', fontSize: 14 }}>Simulate Fee</button>
          {sim && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span style={{ color: '#6B7280' }}>Base Amount</span><span style={{ color: '#04304B' }}>KES {sim.base}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: '#6B7280' }}>Fixed Fee</span><span style={{ color: '#04304B' }}>KES {sim.fixed}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: '#6B7280' }}>Percent Fee (1.5%)</span><span style={{ color: '#04304B' }}>KES {sim.percent}</span></div>
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#E5E7EB' }}><span style={{ color: '#04304B', fontWeight: 600 }}>Total Fee</span><span style={{ color: '#F44336', fontWeight: 600 }}>KES {sim.total}</span></div>
            </div>
          )}
        </div>
      </div>

      <FeeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} fee={editFee} ruleOptions={rules} defaultRuleId={ruleId} onSave={handleSave} />
    </div>
  )

  if (embedded) return content
  return content
}
