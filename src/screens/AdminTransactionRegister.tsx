'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Search, Eye, X, Download, Edit2, Plus } from 'lucide-react'
import { listTransactions, updateTransaction, createTransaction } from '@/services/transactionRegisterService'
import type { TxnRegisterEntry } from '@/api/txnregister'
import type { CreateTxnRegisterBody } from '@/api/txnregister'
import { listWallets } from '@/services/walletsService'
import { listOperationTypes } from '@/services/operationTypesService'
import { listTransactionRules } from '@/services/transactionRulesService'
import { listTransactionChannels } from '@/services/transactionChannelsService'
import { listCountries } from '@/services/countriesService'

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString()
  } catch {
    return s
  }
}

function TxnDetailModal({ txn, onClose }: { txn: TxnRegisterEntry; onClose: () => void }) {
  const net = txn.transactionAmount - txn.feeAmount
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div>
            <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Transaction Detail</h2>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>TXN-{txn.transactionId}</p>
          </div>
          <div className="flex items-center gap-3">
            <Components.StatusBadge status={txn.txnStatus} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl p-5 text-center" style={{ background: '#E8F8F5' }}>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Transaction Amount</p>
            <p className="font-bold mt-1" style={{ color: '#37BBA2', fontSize: 30 }}>{formatAmount(txn.transactionAmount, txn.currencyCode)}</p>
          </div>
          <div className="space-y-3">
            {[
              ['Reference', txn.reference || '—'],
              ['Type', txn.transactionType || txn.operationTypeTag || '—'],
              ['Channel', txn.txnChannelName || '—'],
              ['Source Wallet', `ID ${txn.srcWalletId}` + (txn.srcWalletLinkedMsisdn ? ` · ${txn.srcWalletLinkedMsisdn}` : '')],
              ['Destination Wallet', txn.destWalletId != null ? `ID ${txn.destWalletId}` + (txn.destWalletLinkedMsisdn ? ` · ${txn.destWalletLinkedMsisdn}` : '') : '—'],
              ['Fee', formatAmount(txn.feeAmount, txn.currencyCode)],
              ['Net Amount', formatAmount(net, txn.currencyCode)],
              ['Date & Time', formatDate(txn.transactionDate)],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{k}</span>
                <span className="font-medium text-right max-w-[60%]" style={{ color: '#04304B', fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Close</button>
          <button className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90" style={{ background: '#37BBA2', fontSize: 14 }}>Download Receipt</button>
        </div>
      </div>
    </div>
  )
}

function EditTxnDrawer({
  txn,
  onClose,
  onSaved,
}: {
  txn: TxnRegisterEntry
  onClose: () => void
  onSaved: (updated: TxnRegisterEntry) => void
}) {
  const [status, setStatus] = useState<TxnRegisterEntry['txnStatus']>(txn.txnStatus)
  const [notes, setNotes] = useState(txn.notes ?? '')
  const [approvedBy, setApprovedBy] = useState(txn.approvedBy ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const body: Parameters<typeof updateTransaction>[1] = {}
      if (status !== txn.txnStatus) body.transaction_status = status as typeof body.transaction_status
      const trimmedNotes = notes.trim()
      body.notes = trimmedNotes ? trimmedNotes : null
      const trimmedApproved = approvedBy.trim()
      body.approved_by = trimmedApproved ? trimmedApproved : null
      if (!Object.keys(body).length) {
        onClose()
        return
      }
      const updated = await updateTransaction(txn.transactionId, body)
      onSaved(updated)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Edit Transaction</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {error && (
            <div className="mb-2 p-2 rounded border border-red-200 bg-red-50 text-xs" style={{ color: '#B91C1C' }}>{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as typeof status)}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Approved by</label>
            <input
              value={approvedBy}
              onChange={e => setApprovedBy(e.target.value)}
              maxLength={255}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              placeholder="Name or user ID (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={255}
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm resize-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              placeholder="Add notes about this transaction (optional)"
            />
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

type AddTxnDrawerProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const CURRENCY_PATTERN = /^[A-Z]{3}$/
const TXN_STATUS_OPTIONS: CreateTxnRegisterBody['transaction_status'][] = ['pending', 'completed', 'failed', 'reversed', 'cancelled']

function AddTransactionDrawer({ open, onClose, onCreated }: AddTxnDrawerProps) {
  const [form, setForm] = useState({
    srcWalletId: '',
    destWalletId: '',
    operationTypeTag: '',
    transactionType: '',
    txnRuleId: '',
    currencyCode: 'RWF',
    transactionAmount: '',
    transactionFee: '0',
    srcWalletBalance: '0',
    destWalletBalance: '0',
    txnChannelId: '',
    initiatedBy: '',
    onBehalfOf: '',
    transactionStatus: 'pending' as CreateTxnRegisterBody['transaction_status'],
    narration: '',
    notes: '',
    approvedBy: '',
  })
  const [wallets, setWallets] = useState<{ id: number }[]>([])
  const [operationTypes, setOperationTypes] = useState<{ id: number; tag: string; name: string }[]>([])
  const [txnRules, setTxnRules] = useState<{ id: number }[]>([])
  const [channels, setChannels] = useState<{ id: number; displayName: string }[]>([])
  const [currencies, setCurrencies] = useState<string[]>(['RWF', 'USD', 'KES', 'NGN', 'GHS', 'ZAR', 'GBP'])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setError(null)
    setFieldErrors({})
    setLoadingOptions(true)
    ;(async () => {
      try {
        const [walletRes, opRes, ruleRes, chRes, countryRes] = await Promise.allSettled([
          listWallets({ page: 1, limit: 500 }),
          listOperationTypes(),
          listTransactionRules({ status: 'all' }),
          listTransactionChannels({ status: 'all' }),
          listCountries(),
        ])

        if (walletRes.status === 'fulfilled') {
          setWallets(walletRes.value.items.map(w => ({ id: w.walletId })))
        } else {
          setWallets([])
        }

        if (opRes.status === 'fulfilled') {
          setOperationTypes(opRes.value.map(o => ({ id: Number(o.id), tag: o.tag, name: o.name })))
        } else {
          setOperationTypes([])
        }

        // Transaction rules API is currently unstable; don't block other dropdowns
        if (ruleRes.status === 'fulfilled') {
          setTxnRules(ruleRes.value.map(r => ({ id: r.id })))
        } else {
          setTxnRules([])
        }

        if (chRes.status === 'fulfilled') {
          setChannels(chRes.value.map(c => ({ id: c.id, displayName: c.displayName })))
        } else {
          setChannels([])
        }

        if (countryRes.status === 'fulfilled') {
          const list = Array.from(new Set(countryRes.value.map(x => x.currency).filter(Boolean))) as string[]
          if (list.length) setCurrencies(list.sort())
        }
      } finally {
        setLoadingOptions(false)
      }
    })()
  }, [open])

  const totalAmount = useMemo(() => {
    const amt = parseFloat(form.transactionAmount) || 0
    const fee = parseFloat(form.transactionFee) || 0
    return amt + fee
  }, [form.transactionAmount, form.transactionFee])

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  const handleOpTypeSelect = (opTag: string, opName: string) => {
    setForm(prev => ({ ...prev, operationTypeTag: opTag, transactionType: opName }))
    setFieldErrors(prev => ({ ...prev, operationTypeTag: '', transactionType: '' }))
  }

  const validate = (): boolean => {
    const err: Record<string, string> = {}
    if (!form.srcWalletId.trim()) err.srcWalletId = 'Source wallet is required.'
    const srcId = parseInt(form.srcWalletId, 10)
    if (form.srcWalletId && (Number.isNaN(srcId) || srcId < 1)) err.srcWalletId = 'Source wallet must be a valid ID.'
    if (!form.operationTypeTag.trim()) err.operationTypeTag = 'Operation type is required.'
    if (!form.transactionType.trim()) err.transactionType = 'Transaction type is required.'
    const ruleId = form.txnRuleId.trim() ? parseInt(form.txnRuleId, 10) : NaN
    if (form.txnRuleId && (Number.isNaN(ruleId) || ruleId < 1)) err.txnRuleId = 'Transaction rule must be valid.'
    const curr = form.currencyCode.trim().toUpperCase()
    if (!curr || curr.length !== 3 || !CURRENCY_PATTERN.test(curr)) err.currencyCode = 'Currency must be 3 uppercase letters (e.g. RWF).'
    const amt = parseFloat(form.transactionAmount)
    if (Number.isNaN(amt) || amt < 0) err.transactionAmount = 'Amount must be ≥ 0.'
    const fee = parseFloat(form.transactionFee)
    if (Number.isNaN(fee) || fee < 0) err.transactionFee = 'Fee must be ≥ 0.'
    const srcBal = parseFloat(form.srcWalletBalance)
    if (Number.isNaN(srcBal) || srcBal < 0) err.srcWalletBalance = 'Source balance must be ≥ 0.'
    const destBal = parseFloat(form.destWalletBalance)
    if (Number.isNaN(destBal) || destBal < 0) err.destWalletBalance = 'Destination balance must be ≥ 0.'
    if (!form.txnChannelId.trim()) err.txnChannelId = 'Channel is required.'
    const chId = parseInt(form.txnChannelId, 10)
    if (form.txnChannelId && (Number.isNaN(chId) || chId < 1)) err.txnChannelId = 'Channel must be valid.'
    if (!form.initiatedBy.trim()) err.initiatedBy = 'Initiated by is required.'
    if (form.initiatedBy.length > 255) err.initiatedBy = 'Max 255 characters.'
    if (!form.onBehalfOf.trim()) err.onBehalfOf = 'On behalf of is required.'
    if (form.onBehalfOf.length > 255) err.onBehalfOf = 'Max 255 characters.'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async () => {
    setError(null)
    if (!validate()) return
    const srcId = parseInt(form.srcWalletId, 10)
    const destId = form.destWalletId.trim() ? parseInt(form.destWalletId, 10) : undefined
    const ruleId = form.txnRuleId.trim() ? parseInt(form.txnRuleId, 10) : NaN
    const chId = parseInt(form.txnChannelId, 10)
    const baseBody: Omit<CreateTxnRegisterBody, 'txn_rule_id'> = {
      src_wallet_id: srcId,
      dest_wallet_id: destId && !Number.isNaN(destId) && destId >= 1 ? destId : undefined,
      operation_type_tag: form.operationTypeTag.trim(),
      transaction_type: form.transactionType.trim().slice(0, 50),
      currency_code: form.currencyCode.trim().toUpperCase(),
      transaction_amount: parseFloat(form.transactionAmount) || 0,
      transaction_fee: parseFloat(form.transactionFee) || 0,
      total_transaction_amount: totalAmount,
      src_wallet_balance: parseFloat(form.srcWalletBalance) || 0,
      dest_wallet_balance: parseFloat(form.destWalletBalance) || 0,
      txn_channel_id: chId,
      initiated_by: form.initiatedBy.trim(),
      on_behalf_of: form.onBehalfOf.trim(),
      transaction_status: form.transactionStatus,
    }
    const body: CreateTxnRegisterBody = {
      ...baseBody,
      ...( !Number.isNaN(ruleId) && ruleId >= 1 ? { txn_rule_id: ruleId } : {}),
    }
    const narrationTrim = form.narration.trim()
    if (narrationTrim) body.narration = narrationTrim.length <= 255 ? narrationTrim : narrationTrim.slice(0, 255)
    const notesTrim = form.notes.trim()
    if (notesTrim) body.notes = notesTrim.length <= 255 ? notesTrim : notesTrim.slice(0, 255)
    const approvedTrim = form.approvedBy.trim()
    if (approvedTrim) body.approved_by = approvedTrim.length <= 255 ? approvedTrim : approvedTrim.slice(0, 255)
    setSaving(true)
    try {
      await createTransaction(body)
      onCreated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create transaction')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  const fieldErrStyle = { color: '#B91C1C', fontSize: 12, marginTop: 4 }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[28rem] max-w-[95vw] bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Add Transaction</h2>
          <button onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {error && (
            <div className="p-2 rounded border border-red-200 bg-red-50 text-xs" style={{ color: '#B91C1C' }}>{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Source wallet</label>
            <select
              value={form.srcWalletId}
              onChange={e => handleChange('srcWalletId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: fieldErrors.srcWalletId ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            >
              <option value="">Select wallet</option>
              {wallets.map(w => (
                <option key={w.id} value={String(w.id)}>Wallet {w.id}</option>
              ))}
            </select>
            {fieldErrors.srcWalletId && <p style={fieldErrStyle}>{fieldErrors.srcWalletId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Destination wallet</label>
            <select
              value={form.destWalletId}
              onChange={e => handleChange('destWalletId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            >
              <option value="">None</option>
              {wallets.map(w => (
                <option key={w.id} value={String(w.id)}>Wallet {w.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Operation type</label>
            <select
              value={form.operationTypeTag}
              onChange={e => {
                const op = operationTypes.find(o => o.tag === e.target.value)
                if (op) handleOpTypeSelect(op.tag, op.name)
                else handleChange('operationTypeTag', e.target.value)
              }}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: fieldErrors.operationTypeTag ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            >
              <option value="">Select type</option>
              {operationTypes.map(op => (
                <option key={op.id} value={op.tag}>{op.name} ({op.tag})</option>
              ))}
            </select>
            {fieldErrors.operationTypeTag && <p style={fieldErrStyle}>{fieldErrors.operationTypeTag}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Transaction rule</label>
            <select
              value={form.txnRuleId}
              onChange={e => handleChange('txnRuleId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: fieldErrors.txnRuleId ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            >
              <option value="">Select rule</option>
              {txnRules.map(r => (
                <option key={r.id} value={String(r.id)}>Rule {r.id}</option>
              ))}
            </select>
            {fieldErrors.txnRuleId && <p style={fieldErrStyle}>{fieldErrors.txnRuleId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Currency</label>
            <select
              value={form.currencyCode}
              onChange={e => handleChange('currencyCode', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: fieldErrors.currencyCode ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            >
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.currencyCode && <p style={fieldErrStyle}>{fieldErrors.currencyCode}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Amount</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.transactionAmount}
                onChange={e => handleChange('transactionAmount', e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                style={{ borderColor: fieldErrors.transactionAmount ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
              />
              {fieldErrors.transactionAmount && <p style={fieldErrStyle}>{fieldErrors.transactionAmount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Fee</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.transactionFee}
                onChange={e => handleChange('transactionFee', e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                style={{ borderColor: fieldErrors.transactionFee ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
              />
              {fieldErrors.transactionFee && <p style={fieldErrStyle}>{fieldErrors.transactionFee}</p>}
            </div>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Total (amount + fee): {form.currencyCode} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Source balance after</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.srcWalletBalance}
                onChange={e => handleChange('srcWalletBalance', e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                style={{ borderColor: fieldErrors.srcWalletBalance ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
              />
              {fieldErrors.srcWalletBalance && <p style={fieldErrStyle}>{fieldErrors.srcWalletBalance}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Dest. balance after</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.destWalletBalance}
                onChange={e => handleChange('destWalletBalance', e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                style={{ borderColor: fieldErrors.destWalletBalance ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
              />
              {fieldErrors.destWalletBalance && <p style={fieldErrStyle}>{fieldErrors.destWalletBalance}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Channel</label>
            <select
              value={form.txnChannelId}
              onChange={e => handleChange('txnChannelId', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: fieldErrors.txnChannelId ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            >
              <option value="">Select channel</option>
              {channels.map(c => (
                <option key={c.id} value={String(c.id)}>{c.displayName}</option>
              ))}
            </select>
            {fieldErrors.txnChannelId && <p style={fieldErrStyle}>{fieldErrors.txnChannelId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Initiated by</label>
            <input
              value={form.initiatedBy}
              onChange={e => handleChange('initiatedBy', e.target.value)}
              maxLength={255}
              placeholder="User or system that initiated"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: fieldErrors.initiatedBy ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            />
            {fieldErrors.initiatedBy && <p style={fieldErrStyle}>{fieldErrors.initiatedBy}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>On behalf of</label>
            <input
              value={form.onBehalfOf}
              onChange={e => handleChange('onBehalfOf', e.target.value)}
              maxLength={255}
              placeholder="Entity on whose behalf"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: fieldErrors.onBehalfOf ? '#B91C1C' : '#E5E7EB', color: '#04304B' }}
            />
            {fieldErrors.onBehalfOf && <p style={fieldErrStyle}>{fieldErrors.onBehalfOf}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Status</label>
            <select
              value={form.transactionStatus}
              onChange={e => handleChange('transactionStatus', e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-pointer outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            >
              {TXN_STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Narration</label>
            <input
              value={form.narration}
              onChange={e => handleChange('narration', e.target.value)}
              maxLength={255}
              placeholder="Optional"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Notes</label>
            <input
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              maxLength={255}
              placeholder="Optional"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B' }}>Approved by</label>
            <input
              value={form.approvedBy}
              onChange={e => handleChange('approvedBy', e.target.value)}
              maxLength={255}
              placeholder="Optional"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B' }}
            />
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loadingOptions}
            className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{ background: '#37BBA2', fontSize: 14 }}
          >
            {saving ? 'Creating…' : 'Create Transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTransactionRegister() {
  const [search, setSearch] = useState('')
  const [walletIdFilter, setWalletIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTxn, setSelectedTxn] = useState<TxnRegisterEntry | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [transactions, setTransactions] = useState<TxnRegisterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [page, setPage] = useState(1)
  const [editingTxn, setEditingTxn] = useState<TxnRegisterEntry | null>(null)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const listParams = useMemo(() => {
    const walletId = walletIdFilter.trim() ? parseInt(walletIdFilter.trim(), 10) : undefined
    const startDate = dateFrom.trim() || undefined
    const endDate = dateTo.trim() || undefined
    return { page, limit: 20, walletId: Number.isNaN(walletId as number) ? undefined : walletId, startDate, endDate }
  }, [page, walletIdFilter, dateFrom, dateTo])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listTransactions(listParams)
      .then(({ items, pagination: p }) => {
        if (cancelled) return
        setTransactions(items)
        setPagination(p ?? null)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load transactions')
        setTransactions([])
        setPagination(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [listParams, refreshKey])

  const filtered = useMemo(() => {
    let list = transactions
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(t =>
        String(t.transactionId).includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.transactionType.toLowerCase().includes(q) ||
        t.operationTypeTag.toLowerCase().includes(q) ||
        String(t.srcWalletId).includes(q) ||
        String(t.destWalletId ?? '').includes(q) ||
        t.srcWalletLinkedMsisdn.includes(q) ||
        t.destWalletLinkedMsisdn.includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(t => t.txnStatus === statusFilter)
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      if (!Number.isNaN(from)) list = list.filter(t => t.transactionDate && new Date(t.transactionDate).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime()
      if (!Number.isNaN(to)) list = list.filter(t => t.transactionDate && new Date(t.transactionDate).getTime() <= to)
    }
    return list
  }, [transactions, search, statusFilter, dateFrom, dateTo])

  const handleViewDetail = (txn: TxnRegisterEntry) => {
    setSelectedTxn(txn)
  }

  const handleUpdated = (updated: TxnRegisterEntry) => {
    setTransactions(list => list.map(t => (t.transactionId === updated.transactionId ? updated : t)))
    setSelectedTxn(prev => (prev && prev.transactionId === updated.transactionId ? updated : prev))
  }

  const handleTransactionCreated = () => {
    setAddDrawerOpen(false)
    setPage(1)
    setRefreshKey(k => k + 1)
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Components.AdminPageHeader
        title="Transaction Register"
        subtitle="Full ledger of all platform transactions"
        action={{ label: 'Add Transaction', onClick: () => setAddDrawerOpen(true), icon: <Plus size={15} /> }}
        secondaryAction={{ label: 'Export CSV', onClick: () => {}, icon: <Download size={14} /> }}
      />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search txn ID, reference, wallet..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none text-sm transition-all"
            style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            onFocus={e => { e.target.style.borderColor = '#37BBA2' }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <input
          value={walletIdFilter}
          onChange={e => setWalletIdFilter(e.target.value)}
          placeholder="Wallet ID"
          className="px-3 py-2 border rounded-lg text-sm outline-none w-28"
          style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
          onBlur={() => setPage(1)}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none"
          style={{ borderColor: '#E5E7EB', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="blocked">Blocked</option>
        </select>
        <div className="flex items-center gap-2">
          <label style={{ color: '#6B7280', fontSize: 13 }}>From</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
        </div>
        <div className="flex items-center gap-2">
          <label style={{ color: '#6B7280', fontSize: 13 }}>To</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
        </div>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{loading ? '...' : `${filtered.length} results`}</span>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
              {['Txn ID', 'Type', 'Channel', 'Source', 'Destination', 'Amount', 'Fee', 'Status', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center" style={{ color: '#6B7280', fontSize: 14 }}>Loading transactions...</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.transactionId} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>TXN-{t.transactionId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{t.transactionType || t.operationTypeTag || '—'}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{t.txnChannelName || '—'}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 11 }}>W{t.srcWalletId}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 11 }}>{t.destWalletId != null ? `W${t.destWalletId}` : '—'}</span></td>
                  <td className="px-4 py-3"><span className="font-semibold" style={{ color: '#04304B', fontSize: 12 }}>{formatAmount(t.transactionAmount, t.currencyCode)}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 12 }}>{formatAmount(t.feeAmount, t.currencyCode)}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={t.txnStatus} size="sm" /></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{formatDate(t.transactionDate)}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewDetail(t)} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }}><Eye size={14} /></button>
                      <button onClick={() => setEditingTxn(t)} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }}><Edit2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ background: p === page ? '#37BBA2' : '#F9FAFB', color: p === page ? 'white' : '#6B7280', fontSize: 12 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTxn && <TxnDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
      {editingTxn && (
        <EditTxnDrawer
          txn={editingTxn}
          onClose={() => setEditingTxn(null)}
          onSaved={handleUpdated}
        />
      )}
      <AddTransactionDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onCreated={handleTransactionCreated}
      />
    </div>
  )
}
