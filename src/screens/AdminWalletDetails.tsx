'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { Link } from '@/lib'
import Components from '../components'
import { Table } from '@/components/ui/table'
import { getWalletById, updateWallet } from '@/services/walletsService'
import { listCountries } from '@/services'
import { Edit2, X, Loader2 } from 'lucide-react'
import { ApiError } from '@/api/client'
import { listTransactions } from '@/services/transactionRegisterService'
import type { TxnRegisterEntry } from '@/services/transactionRegisterService'

type EditWalletFieldErrors = Partial<Record<'walletAccountTag' | 'walletAccountIdentifier' | 'profileTypeGroupId', string>>

function parseEditWalletApiErrors(errorMsg: string): EditWalletFieldErrors {
  const out: EditWalletFieldErrors = {}
  const snakeToCamel: Record<string, keyof EditWalletFieldErrors> = {
    wallet_account_tag: 'walletAccountTag',
    wallet_account_identifier: 'walletAccountIdentifier',
    profile_type_group_id: 'profileTypeGroupId',
  }
  const parts = errorMsg.split(',').map(s => s.trim())
  for (const part of parts) {
    const m = part.match(/body\/(\w+)\s+(.+)/)
    if (m) {
      const field = snakeToCamel[m[1]] ?? m[1]
      out[field as keyof EditWalletFieldErrors] = m[2].replace(/^must /, '').replace(/^NOT /, '')
    }
  }
  return out
}

function validateEditWalletForm(state: { walletAccountTag: string; walletAccountIdentifier: string }): EditWalletFieldErrors {
  const err: EditWalletFieldErrors = {}
  const tag = state.walletAccountTag.trim()
  if (tag && (tag.length < 1 || tag.length > 15)) err.walletAccountTag = 'If provided, must be 1–15 characters.'
  const ident = state.walletAccountIdentifier.trim()
  if (ident && (ident.length < 1 || ident.length > 25)) err.walletAccountIdentifier = 'If provided, must be 1–25 characters.'
  return err
}

function formatBalance(n: number, currency: string): string {
  return `${currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString()
  } catch {
    return s
  }
}

export default function AdminWalletDetails() {
  const { walletId } = useParams<{ walletId: string }>()
  const [wallet, setWallet] = useState<Awaited<ReturnType<typeof getWalletById>>>(null)
  const [countryName, setCountryName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editFieldErrors, setEditFieldErrors] = useState<EditWalletFieldErrors>({})
  const [editState, setEditState] = useState<{
    walletStatus: 'active' | 'inactive' | 'suspended' | 'closed'
    walletAccountTag: string
    walletAccountIdentifier: string
    profileTypeGroupId: string
  } | null>(null)

  const [txns, setTxns] = useState<TxnRegisterEntry[]>([])
  const [txnLoading, setTxnLoading] = useState(false)
  const [txnError, setTxnError] = useState<string | null>(null)
  const [txnPage, setTxnPage] = useState(1)
  const [txnPagination, setTxnPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [txnDateFrom, setTxnDateFrom] = useState('')
  const [txnDateTo, setTxnDateTo] = useState('')

  useEffect(() => {
    if (!walletId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getWalletById(walletId)
      .then(w => {
        if (cancelled) return
        setWallet(w)
        if (w) {
          listCountries().then(countries => {
            if (cancelled) return
            const c = countries.find(x => x.id === w.walletCountryId)
            setCountryName(c?.name ?? '')
          }).catch(() => {})
        }
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load wallet')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [walletId])

  useEffect(() => {
    if (!wallet) return
    let cancelled = false
    setTxnLoading(true)
    setTxnError(null)
    const startDate = txnDateFrom ? new Date(txnDateFrom).toISOString() : undefined
    const endDate = txnDateTo ? new Date(txnDateTo).toISOString() : undefined
    listTransactions({ walletId: wallet.walletId, page: txnPage, limit: 10, startDate, endDate })
      .then(res => {
        if (cancelled) return
        setTxns(res.items)
        setTxnPagination(res.pagination ?? null)
      })
      .catch(e => {
        if (cancelled) return
        setTxns([])
        setTxnPagination(null)
        setTxnError(e instanceof Error ? e.message : 'Failed to load wallet transactions')
      })
      .finally(() => {
        if (!cancelled) setTxnLoading(false)
      })
    return () => { cancelled = true }
  }, [wallet, txnPage, txnDateFrom, txnDateTo])

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Link to="/admin/wallets" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Wallets</Link>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Loading wallet...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !wallet) {
    return (
      <div>
        <div className="mb-4">
          <Link to="/admin/wallets" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Wallets</Link>
        </div>
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">
          {error ?? `Wallet ${walletId} not found`}
        </div>
      </div>
    )
  }

  const w = wallet
  const countryLabel = countryName || `ID ${w.walletCountryId}`

  const openEdit = () => {
    setEditState({
      walletStatus: w.walletStatus,
      walletAccountTag: w.walletAccountTag ?? '',
      walletAccountIdentifier: w.walletAccountIdentifier ?? '',
      profileTypeGroupId: String(w.profileTypeGroupId ?? ''),
    })
    setEditError(null)
    setEditFieldErrors({})
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!wallet || !editState) return
    setSaving(true)
    setEditError(null)
    setEditFieldErrors({})
    const validationErrors = validateEditWalletForm(editState)
    if (Object.keys(validationErrors).length > 0) {
      setEditFieldErrors(validationErrors)
      setSaving(false)
      return
    }
    try {
      const body: {
        wallet_status?: 'active' | 'inactive' | 'suspended' | 'closed'
        wallet_account_tag?: string | null
        wallet_account_identifier?: string | null
        profile_type_group_id?: number
      } = {}
      if (editState.walletStatus !== wallet.walletStatus) body.wallet_status = editState.walletStatus
      const trimmedTag = editState.walletAccountTag.trim()
      const trimmedIdentifier = editState.walletAccountIdentifier.trim()
      body.wallet_account_tag = trimmedTag ? trimmedTag : null
      body.wallet_account_identifier = trimmedIdentifier ? trimmedIdentifier : null
      const grpIdNum = editState.profileTypeGroupId ? Number(editState.profileTypeGroupId) : NaN
      if (!Number.isNaN(grpIdNum) && grpIdNum >= 1) body.profile_type_group_id = grpIdNum

      const updated = await updateWallet(w.walletId, body)
      setWallet(updated)
      setEditOpen(false)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to update wallet')
      if (e instanceof ApiError && e.status === 400 && msg) {
        const apiFieldErrors = parseEditWalletApiErrors(msg)
        if (Object.keys(apiFieldErrors).length > 0) {
          setEditFieldErrors(apiFieldErrors)
          setSaving(false)
          return
        }
      }
      setEditError(msg)
    } finally {
      setSaving(false)
    }
  }

  const editFieldErrStyle = { color: '#B91C1C', fontSize: 12, marginTop: 4 } as const

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/admin/wallets" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Wallets</Link>
      </div>
      <Components.AdminPageHeader
        title={`Wallet ${w.walletId}`}
        subtitle={`${w.walletAccountNo ?? '—'} · Member ${w.memberId}`}
        action={{ label: 'Edit Wallet', onClick: openEdit, icon: <Edit2 size={16} /> }}
      />

      <div className="rounded-xl border p-5 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Available Balance', value: formatBalance(w.availableBalance, w.walletCurrencyCode), highlight: true },
            { label: 'Account Balance', value: formatBalance(w.accountBalance, w.walletCurrencyCode) },
            { label: 'Member ID', value: String(w.memberId) },
            { label: 'Member Profile ID', value: String(w.memberProfileId) },
            { label: 'MSISDN', value: w.linkedMsisdn },
            { label: 'Country', value: countryLabel },
            { label: 'Currency', value: w.walletCurrencyCode },
            { label: 'Profile Type', value: w.profileType },
            { label: 'Profile Type Group ID', value: String(w.profileTypeGroupId) },
            { label: 'Status', value: '' },
            { label: 'Created', value: formatDate(w.dateCreated) },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: item.highlight ? '#E8F8F5' : '#FAFBFC', border: '1px solid #E5E7EB' }}>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>{item.label}</p>
              {item.label === 'Status' ? (
                <div className="mt-1"><Components.StatusBadge status={w.walletStatus} size="sm" /></div>
              ) : (
                <p className="font-semibold mt-1" style={{ color: item.highlight ? '#37BBA2' : '#04304B', fontSize: item.highlight ? 20 : 14 }}>{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-5 mt-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 16 }}>Wallet Transaction Register</h2>
            <p style={{ color: '#6B7280', fontSize: 12 }}>Transactions for this wallet only. Use the date range to narrow results.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>From date</label>
            <input
              type="date"
              value={txnDateFrom}
              onChange={e => { setTxnDateFrom(e.target.value); setTxnPage(1) }}
              className="px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>To date</label>
            <input
              type="date"
              value={txnDateTo}
              onChange={e => { setTxnDateTo(e.target.value); setTxnPage(1) }}
              className="px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
            />
          </div>
        </div>
        {txnError && (
          <div className="mb-3 p-3 rounded-xl border border-red-200 bg-red-50 text-xs" style={{ color: '#B91C1C' }}>
            {txnError}
          </div>
        )}
        {txnLoading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading transactions...</span>
            </div>
          </div>
        ) : txns.length === 0 ? (
          <div className="p-4 text-center" style={{ color: '#6B7280', fontSize: 13 }}>No transactions found for this wallet.</div>
        ) : (
          <>
            <Table className="w-full min-w-max">
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Txn ID', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.transactionId} className="border-b" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-2.5"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{t.transactionId}</span></td>
                    <td className="px-4 py-2.5"><span style={{ color: '#04304B', fontSize: 12 }}>{t.transactionType || t.operationTypeTag || '—'}</span></td>
                    <td className="px-4 py-2.5"><span className="font-semibold" style={{ color: '#04304B', fontSize: 12 }}>{formatBalance(t.transactionAmount, t.currencyCode)}</span></td>
                    <td className="px-4 py-2.5"><span style={{ color: '#6B7280', fontSize: 12 }}>{t.txnStatus}</span></td>
                    <td className="px-4 py-2.5"><span style={{ color: '#6B7280', fontSize: 12 }}>{formatDate(t.transactionDate)}</span></td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {txnPagination && (
              <div className="flex items-center justify-between mt-3">
                <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                  Showing {(txnPagination.page - 1) * txnPagination.limit + 1}–{Math.min(txnPagination.page * txnPagination.limit, txnPagination.total)} of {txnPagination.total}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: txnPagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setTxnPage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-medium cursor-pointer"
                      style={{ background: p === txnPage ? '#37BBA2' : '#F9FAFB', color: p === txnPage ? '#FFFFFF' : '#6B7280' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editOpen && editState && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setEditOpen(false)} />
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Edit Wallet</h2>
              <button onClick={() => setEditOpen(false)} className="cursor-pointer hover:bg-gray-100 p-1 rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {editError && (
                <div className="mb-2 p-2 rounded border border-red-200 bg-red-50 text-xs" style={{ color: '#B91C1C' }}>{editError}</div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Status</label>
                <select
                  value={editState.walletStatus}
                  onChange={e => setEditState(s => s ? { ...s, walletStatus: e.target.value as typeof s.walletStatus } : s)}
                  className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm cursor-pointer"
                  style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Profile type group ID</label>
                <input
                  value={editState.profileTypeGroupId}
                  onChange={e => { setEditState(s => s ? { ...s, profileTypeGroupId: e.target.value } : s); setEditFieldErrors(prev => ({ ...prev, profileTypeGroupId: undefined })) }}
                  type="number"
                  min={0}
                  className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
                  style={{ borderColor: editFieldErrors.profileTypeGroupId ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
                />
                {editFieldErrors.profileTypeGroupId && <p style={editFieldErrStyle}>{editFieldErrors.profileTypeGroupId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Wallet account tag (max 15 chars)</label>
                <input
                  value={editState.walletAccountTag}
                  onChange={e => { setEditState(s => s ? { ...s, walletAccountTag: e.target.value } : s); setEditFieldErrors(prev => ({ ...prev, walletAccountTag: undefined })) }}
                  maxLength={15}
                  className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
                  style={{ borderColor: editFieldErrors.walletAccountTag ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
                />
                {editFieldErrors.walletAccountTag && <p style={editFieldErrStyle}>{editFieldErrors.walletAccountTag}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#04304B', fontSize: 13 }}>Wallet account identifier (max 25 chars)</label>
                <input
                  value={editState.walletAccountIdentifier}
                  onChange={e => { setEditState(s => s ? { ...s, walletAccountIdentifier: e.target.value } : s); setEditFieldErrors(prev => ({ ...prev, walletAccountIdentifier: undefined })) }}
                  maxLength={25}
                  className="w-full px-3 py-2.5 border rounded-lg outline-none text-sm"
                  style={{ borderColor: editFieldErrors.walletAccountIdentifier ? '#B91C1C' : '#E5E7EB', color: '#04304B', fontSize: 13 }}
                />
                {editFieldErrors.walletAccountIdentifier && <p style={editFieldErrStyle}>{editFieldErrors.walletAccountIdentifier}</p>}
              </div>
            </div>
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 rounded-lg border font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg font-medium text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: '#37BBA2', fontSize: 14 }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
