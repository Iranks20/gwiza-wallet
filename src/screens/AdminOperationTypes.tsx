'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X, Search, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react'

const opTypes = [
  { id: 'OT-001', code: 'P2P_TRANSFER', name: 'P2P Transfer', direction: 'both', tag: 'transfer', description: 'Peer-to-peer wallet transfer', status: 'active' },
  { id: 'OT-002', code: 'TOP_UP', name: 'Top Up', direction: 'credit', tag: 'deposit', description: 'Wallet top up / deposit', status: 'active' },
  { id: 'OT-003', code: 'WITHDRAWAL', name: 'Withdrawal', direction: 'debit', tag: 'withdrawal', description: 'Wallet withdrawal', status: 'active' },
  { id: 'OT-004', code: 'BILL_PAYMENT', name: 'Bill Payment', direction: 'debit', tag: 'payment', description: 'Utility bill payment', status: 'active' },
  { id: 'OT-005', code: 'AIRTIME', name: 'Airtime Purchase', direction: 'debit', tag: 'airtime', description: 'Mobile airtime recharge', status: 'active' },
  { id: 'OT-006', code: 'MERCHANT_PAY', name: 'Merchant Payment', direction: 'debit', tag: 'payment', description: 'Payment to merchant', status: 'active' },
  { id: 'OT-007', code: 'REVERSAL', name: 'Reversal', direction: 'credit', tag: 'reversal', description: 'Transaction reversal / refund', status: 'inactive' },
  { id: 'OT-008', code: 'FEE_CHARGE', name: 'Fee Charge', direction: 'debit', tag: 'fee', description: 'Internal fee deduction', status: 'active' },
]

const directionIcon = (d: string) => {
  if (d === 'credit') return <ArrowDown size={13} style={{ color: '#4CAF50' }} />
  if (d === 'debit') return <ArrowUp size={13} style={{ color: '#F44336' }} />
  return <ArrowLeftRight size={13} style={{ color: '#2196F3' }} />
}

const directionColor = (d: string) => {
  if (d === 'credit') return { bg: '#F0FDF4', text: '#166534' }
  if (d === 'debit') return { bg: '#FEF2F2', text: '#991B1B' }
  return { bg: '#EFF6FF', text: '#1E40AF' }
}

type OpType = typeof opTypes[0]

function OpTypeDrawer({ item, onClose, onSave }: { item?: OpType; onClose: () => void; onSave: (i: OpType) => void }) {
  const [form, setForm] = useState<OpType>(item || { id: `OT-00${opTypes.length + 1}`, code: '', name: '', direction: 'both', tag: '', description: '', status: 'active' })
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{item ? 'Edit Operation Type' : 'Add Operation Type'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {[
            { label: 'Operation Code', key: 'code', placeholder: 'e.g. P2P_TRANSFER', hint: 'Unique uppercase code with underscores' },
            { label: 'Display Name', key: 'name', placeholder: 'e.g. P2P Transfer' },
            { label: 'Tag', key: 'tag', placeholder: 'e.g. transfer, deposit, payment' },
            { label: 'Description', key: 'description', placeholder: 'Brief description of this operation' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              {f.hint && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{f.hint}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {['credit', 'debit', 'both'].map(d => (
                <button key={d} onClick={() => setForm({ ...form, direction: d })} className="py-2.5 rounded-xl border font-medium text-sm capitalize cursor-pointer transition-all" style={{ borderColor: form.direction === d ? '#37BBA2' : '#E5E7EB', background: form.direction === d ? '#E8F8F5' : 'white', color: form.direction === d ? '#37BBA2' : '#6B7280', fontSize: 13 }}>{d}</button>
              ))}
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
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#37BBA2', fontSize: 14 }}>{item ? 'Save Changes' : 'Add Type'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminOperationTypes() {
  const [data, setData] = useState(opTypes)
  const [search, setSearch] = useState('')
  const [dirFilter, setDirFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState<{ open: boolean; item?: OpType }>({ open: false })

  const tags = [...new Set(opTypes.map(o => o.tag))]
  const filtered = data.filter(o => {
    const q = search.toLowerCase()
    return (!search || o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)) &&
      (dirFilter === 'all' || o.direction === dirFilter) &&
      (tagFilter === 'all' || o.tag === tagFilter) &&
      (statusFilter === 'all' || o.status === statusFilter)
  })

  return (
    <Components.AdminLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader
          title="Transaction Operation Types"
          subtitle="Define and manage transaction operation types"
          action={{ label: 'Add Type', onClick: () => setDrawer({ open: true }), icon: <Plus size={15} /> }}
        />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or name..." className="pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none w-56" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          {[
            { label: 'Direction', value: dirFilter, set: setDirFilter, opts: [['all','All Directions'],['credit','Credit'],['debit','Debit'],['both','Both']] },
            { label: 'Tag', value: tagFilter, set: setTagFilter, opts: [['all','All Tags'], ...tags.map(t => [t, t])] },
            { label: 'Status', value: statusFilter, set: setStatusFilter, opts: [['all','All Status'],['active','Active'],['inactive','Inactive']] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} operation types</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Code', 'Name', 'Direction', 'Tag', 'Description', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const dc = directionColor(o.direction)
                return (
                  <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3"><span className="font-mono text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#F0F9FF', color: '#0369A1' }}>{o.code}</span></td>
                    <td className="px-5 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{o.name}</span></td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg w-fit" style={{ background: dc.bg, color: dc.text }}>
                        {directionIcon(o.direction)} {o.direction}
                      </span>
                    </td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#F3F4F6', color: '#6B7280' }}>{o.tag}</span></td>
                    <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{o.description}</span></td>
                    <td className="px-5 py-3"><Components.StatusBadge status={o.status} size="sm" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDrawer({ open: true, item: o })} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer" style={{ color: '#F44336' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {drawer.open && <OpTypeDrawer item={drawer.item} onClose={() => setDrawer({ open: false })} onSave={item => { setData(prev => drawer.item ? prev.map(x => x.id === drawer.item?.id ? item : x) : [...prev, item]); setDrawer({ open: false }) }} />}
      </div>
    </Components.AdminLayout>
  )
}
