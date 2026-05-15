'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X, Search, Loader2 } from 'lucide-react'
import type { Currency } from '@/services/currenciesService'
import { listCurrencies, createCurrency, updateCurrency, removeCurrency } from '@/services/currenciesService'
import { Table } from '@/components/ui/table'

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/

function CurrencyDrawer({
  currency,
  onClose,
  onSave,
  isEdit,
  error,
}: {
  currency?: Currency
  onClose: () => void
  onSave: (c: Pick<Currency, 'code' | 'name'> & Partial<Currency>) => void
  isEdit: boolean
  error: string | null
}) {
  const [form, setForm] = useState<Currency>(
    currency || { code: '', name: '', symbol: '', decimals: 2, country: '', status: 'active' }
  )
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{isEdit ? 'Edit Currency' : 'Add Currency'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {error && (
            <div className="px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Currency Code</label>
            <input
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. KES"
              readOnly={isEdit}
              className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => !isEdit && (e.target.style.borderColor = '#37BBA2')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>ISO 4217 3-letter code{isEdit ? ' (read-only)' : ''}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Currency Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Kenyan Shilling"
              className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
        </div>
        <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
          <button onClick={() => onSave({ code: form.code, name: form.name })} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#37BBA2', fontSize: 14 }}>
            {isEdit ? 'Save Changes' : 'Add Currency'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCurrencies() {
  const [data, setData] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState<{ open: boolean; item?: Currency }>({ open: false })
  const [drawerError, setDrawerError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadCurrencies = () => {
    setLoading(true)
    setError(null)
    listCurrencies()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load currencies'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadCurrencies() }, [])

  const filtered = data.filter(c => {
    const q = search.toLowerCase()
    return !search || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  })

  const handleSave = async (c: { code: string; name: string }) => {
    setDrawerError(null)
    const code = c.code.trim().toUpperCase()
    const name = c.name.trim()
    if (!code || !name) {
      setDrawerError('Currency code and name are required.')
      return
    }
    if (!CURRENCY_CODE_PATTERN.test(code)) {
      setDrawerError('Currency code must be exactly 3 uppercase letters (e.g. RWF).')
      return
    }
    try {
      if (drawer.item) {
        await updateCurrency(drawer.item.code, { name })
      } else {
        await createCurrency({ code, name, status: 'active' })
      }
      loadCurrencies()
      setDrawer({ open: false })
      setDrawerError(null)
    } catch (e) {
      setDrawerError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setError(null)
    try {
      const ok = await removeCurrency(deleteConfirm)
      if (ok) {
        setData((prev) => prev.filter((c) => c.code !== deleteConfirm))
        setDeleteConfirm(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <div>
      <Components.AdminPageHeader
        title="Currencies"
        subtitle="Manage supported currencies across the platform"
        action={{ label: 'Add Currency', onClick: () => setDrawer({ open: true }), icon: <Plus size={15} /> }}
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or name..." className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>
        <span className="text-sm" style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} results</span>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>{loading ? 'Loading currencies...' : `${filtered.length} currencies`}</span>
        </div>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              {['Code', 'Name', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center">
                  <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading currencies...</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.code} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-5 py-3"><span className="font-mono font-bold" style={{ color: '#37BBA2', fontSize: 13 }}>{c.code}</span></td>
                  <td className="px-5 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{c.name}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDrawer({ open: true, item: c })} className="w-11 h-11 inline-flex items-center justify-center hover:bg-teal-50 rounded-lg cursor-pointer transition-colors" style={{ color: '#37BBA2' }} title="Edit currency" aria-label="Edit currency"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(c.code)} className="w-11 h-11 inline-flex items-center justify-center hover:bg-red-50 rounded-lg cursor-pointer transition-colors" style={{ color: '#F44336' }} title="Delete currency" aria-label="Delete currency"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {drawer.open && (
        <CurrencyDrawer
          currency={drawer.item}
          isEdit={!!drawer.item}
          onClose={() => { setDrawer({ open: false }); setDrawerError(null) }}
          onSave={handleSave}
          error={drawerError}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
              <Trash2 size={22} style={{ color: '#F44336' }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: '#04304B', fontSize: 16 }}>Delete Currency?</h3>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Are you sure you want to delete <strong>{deleteConfirm}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border rounded-xl font-medium cursor-pointer" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 14 }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#F44336', fontSize: 14 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
