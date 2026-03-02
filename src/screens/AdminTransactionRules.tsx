'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { useParams } from 'react-router'
import { Plus, Edit2, Receipt, X, ArrowLeft } from 'lucide-react'
import type { TxnRule } from '@/services/transactionRulesService'
import {
  listTransactionRules,
  createTransactionRule,
  updateTransactionRule,
} from '@/services/transactionRulesService'
import { listCountries } from '@/services/countriesService'
import { listProfileTypeGroups } from '@/services/profileTypeGroupsService'
import { listOperationTypes } from '@/services/operationTypesService'
import { listTransactionChannels } from '@/services/transactionChannelsService'

const defaultRuleForm: Omit<TxnRule, 'id'> = {
  description: '',
  countryId: 0,
  profileTypeGroupId: 0,
  operationTypeId: 0,
  operationTypeTag: '',
  srcCountryId: 0,
  srcCurrency: '',
  srcTxnChannelId: 0,
  destCountryId: 0,
  destTxnChannelId: 0,
  destCurrency: '',
  destType: '',
  chargeFeeTo: '',
  feeSplitRatio: 0,
  contraAccountNo: '',
  feesCollectedAccountNo: '',
  feesIncurredAccountNo: '',
  status: 'active',
}

interface RuleDrawerProps {
  open: boolean
  onClose: () => void
  rule: TxnRule | null
  defaultCountryId?: number
  defaultGroupId?: number
  countryOptions: { id: number; name: string }[]
  groupOptions: { id: number; name: string }[]
  operationOptions: { id: number; tag: string }[]
  channelOptions: { id: number; name: string }[]
  onSave: (data: TxnRule | Omit<TxnRule, 'id'>) => void
}

function RuleDrawer({
  open,
  onClose,
  rule,
  defaultCountryId,
  defaultGroupId,
  countryOptions,
  groupOptions,
  operationOptions,
  channelOptions,
  onSave,
}: RuleDrawerProps) {
  const [form, setForm] = useState<Omit<TxnRule, 'id'> & { id?: number }>({ ...defaultRuleForm })
  useEffect(() => {
    if (open) {
      if (rule) {
        setForm({ ...rule })
      } else {
        setForm({
          ...defaultRuleForm,
          countryId: defaultCountryId ?? 0,
          profileTypeGroupId: defaultGroupId ?? 0,
        })
      }
    }
  }, [open, rule, defaultCountryId, defaultGroupId])

  if (!open) return null
  const handleSave = () => {
    if (rule?.id) {
      const { id, ...rest } = form as TxnRule
      onSave({ ...rule, ...rest })
    } else {
      const { id, ...rest } = form
      onSave(rest as Omit<TxnRule, 'id'>)
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
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>{rule ? 'Edit Rule' : 'Add Rule'}</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. P2P Domestic" className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Country</label>
              <select value={form.countryId || ''} onChange={e => setForm(f => ({ ...f, countryId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Profile Type Group</label>
              <select value={form.profileTypeGroupId || ''} onChange={e => setForm(f => ({ ...f, profileTypeGroupId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {groupOptions.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Operation Type</label>
              <select
                value={form.operationTypeId || ''}
                onChange={e => {
                  const opt = operationOptions.find(o => o.id === parseInt(e.target.value, 10))
                  setForm(f => ({ ...f, operationTypeId: opt?.id ?? 0, operationTypeTag: opt?.tag ?? '' }))
                }}
                className={inputClass}
                style={inputStyle}
              >
                <option value="">Select</option>
                {operationOptions.map(o => (<option key={o.id} value={o.id}>{o.tag}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Operation Tag</label>
              <input value={form.operationTypeTag} onChange={e => setForm(f => ({ ...f, operationTypeTag: e.target.value }))} placeholder="e.g. P2P" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Src Country</label>
              <select value={form.srcCountryId || ''} onChange={e => setForm(f => ({ ...f, srcCountryId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Src Currency</label>
              <input value={form.srcCurrency} onChange={e => setForm(f => ({ ...f, srcCurrency: e.target.value }))} placeholder="KES" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Src Channel</label>
              <select value={form.srcTxnChannelId || ''} onChange={e => setForm(f => ({ ...f, srcTxnChannelId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {channelOptions.map(ch => (<option key={ch.id} value={ch.id}>{ch.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Dest Country</label>
              <select value={form.destCountryId || ''} onChange={e => setForm(f => ({ ...f, destCountryId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {countryOptions.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Dest Currency</label>
              <input value={form.destCurrency} onChange={e => setForm(f => ({ ...f, destCurrency: e.target.value }))} placeholder="KES" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Dest Channel</label>
              <select value={form.destTxnChannelId || ''} onChange={e => setForm(f => ({ ...f, destTxnChannelId: parseInt(e.target.value, 10) || 0 }))} className={inputClass} style={inputStyle}>
                <option value="">Select</option>
                {channelOptions.map(ch => (<option key={ch.id} value={ch.id}>{ch.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Dest Type</label>
              <input value={form.destType} onChange={e => setForm(f => ({ ...f, destType: e.target.value }))} placeholder="e.g. wallet" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Charge Fee To</label>
              <input value={form.chargeFeeTo} onChange={e => setForm(f => ({ ...f, chargeFeeTo: e.target.value }))} placeholder="sender / receiver" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Fee Split Ratio</label>
            <input type="number" value={form.feeSplitRatio ?? ''} onChange={e => setForm(f => ({ ...f, feeSplitRatio: parseFloat(e.target.value) || 0 }))} className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Contra Account</label>
              <input value={form.contraAccountNo ?? ''} onChange={e => setForm(f => ({ ...f, contraAccountNo: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Fees Collected Account</label>
              <input value={form.feesCollectedAccountNo ?? ''} onChange={e => setForm(f => ({ ...f, feesCollectedAccountNo: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Fees Incurred Account</label>
              <input value={form.feesIncurredAccountNo ?? ''} onChange={e => setForm(f => ({ ...f, feesIncurredAccountNo: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputClass} style={inputStyle}>
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

export default function AdminTransactionRules({
  country,
  countryId: countryIdProp,
  groupId: groupIdProp,
  embedded,
  configureBasePath,
}: {
  country?: string
  countryId?: number
  groupId?: number
  embedded?: boolean
  configureBasePath?: string
}) {
  const params = useParams<{ countryId?: string; groupId?: string }>()
  const countryId = countryIdProp ?? (params.countryId ? parseInt(params.countryId, 10) : undefined)
  const groupId = groupIdProp ?? (params.groupId !== undefined && params.groupId !== '' ? parseInt(params.groupId, 10) : undefined)
  const hasValidGroup = typeof groupId === 'number' && !Number.isNaN(groupId) && groupId >= 0

  const [rules, setRules] = useState<TxnRule[]>([])
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([])
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([])
  const [operationTypes, setOperationTypes] = useState<{ id: number; tag: string }[]>([])
  const [channels, setChannels] = useState<{ id: number; name: string }[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRule, setEditRule] = useState<TxnRule | null>(null)
  const [loading, setLoading] = useState(false)
  const showFeesLink = Boolean(embedded && configureBasePath)

  const loadRules = () => {
    setLoading(true)
    listTransactionRules({
      profileTypeGroupId: hasValidGroup ? groupId : undefined,
      countryId: countryId && countryId > 0 ? countryId : undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    })
      .then(setRules)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRules() }, [groupId, countryId, statusFilter])
  useEffect(() => { listCountries().then(cs => setCountries(cs.map(c => ({ id: c.id, name: c.name })))) }, [])
  useEffect(() => {
    listProfileTypeGroups({ countryId: countryId && countryId > 0 ? countryId : undefined }).then(gs =>
      setGroups(gs.map(g => ({ id: g.id, name: g.name })))
    )
  }, [countryId])
  useEffect(() => {
    listOperationTypes().then(ots => setOperationTypes(ots.map(o => ({ id: Number(o.id), tag: o.tag }))))
  }, [])
  useEffect(() => {
    listTransactionChannels({ countryId: countryId && countryId > 0 ? countryId : undefined }).then(chs =>
      setChannels(chs.map(c => ({ id: c.id, name: c.displayName || c.name || String(c.id) })))
    )
  }, [countryId])

  const handleSave = async (data: TxnRule | Omit<TxnRule, 'id'>) => {
    if ('id' in data && data.id) {
      await updateTransactionRule(data.id, data)
    } else {
      await createTransactionRule(data as Omit<TxnRule, 'id'>)
    }
    loadRules()
  }
  const toggleStatus = async (r: TxnRule) => {
    await updateTransactionRule(r.id, { status: r.status === 'active' ? 'inactive' : 'active' })
    loadRules()
  }

  const countryMap = Object.fromEntries(countries.map(c => [c.id, c.name]))
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g.name]))
  const channelMap = Object.fromEntries(channels.map(c => [c.id, c.name]))

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && configureBasePath && (
        <div className="flex items-center gap-3 mb-4">
          <Link to={configureBasePath} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#37BBA2' }}>
            <ArrowLeft size={16} /> Back to group
          </Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Rules"
          subtitle="Rule engine controlling which transactions are allowed or blocked"
          action={{
            label: 'Add Rule',
            onClick: () => { setEditRule(null); setDrawerOpen(true) },
            icon: <Plus size={15} />,
          }}
        />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Transaction Rules</h2>
          <button
            disabled={!hasValidGroup}
            onClick={() => { setEditRule(null); setDrawerOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            <Plus size={15} /> Add Rule
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{rules.length} rules</span>
      </div>

      {loading && <p className="mb-2 text-sm" style={{ color: '#6B7280' }}>Loading transaction rules…</p>}
      <div className="rounded-xl border overflow-auto" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="min-w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Description', 'Country', 'Profile Group', 'Operation', 'Src Channel', 'Dest Channel', 'Status', ...(showFeesLink ? ['Fees'] : []), 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && rules.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{r.description}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{countryMap[r.countryId] ?? r.countryId}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{groupMap[r.profileTypeGroupId] ?? r.profileTypeGroupId}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.operationTypeTag}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{channelMap[r.srcTxnChannelId] ?? r.srcTxnChannelId}</span></td>
                <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{channelMap[r.destTxnChannelId] ?? r.destTxnChannelId}</span></td>
                <td className="px-4 py-3"><Components.StatusBadge status={r.status} size="sm" /></td>
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
                    <button onClick={() => toggleStatus(r)} className="px-2 py-1 rounded-lg text-xs font-medium cursor-pointer" style={{ background: r.status === 'active' ? '#FEE2E2' : '#D1FAE5', color: r.status === 'active' ? '#B91C1C' : '#047857' }}>
                      {r.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RuleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rule={editRule}
        defaultCountryId={countryId}
        defaultGroupId={hasValidGroup ? groupId : undefined}
        countryOptions={countries}
        groupOptions={groups}
        operationOptions={operationTypes}
        channelOptions={channels}
        onSave={handleSave}
      />
    </div>
  )

  return content
}
