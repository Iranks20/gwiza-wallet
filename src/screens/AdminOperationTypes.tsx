'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Plus, Edit2, Trash2, X, Search, ArrowUp, ArrowDown, ArrowLeftRight, Loader2 } from 'lucide-react'
import type { OperationType } from '@/services/operationTypesService'
import { listOperationTypes, createOperationType, updateOperationType, removeOperationType } from '@/services/operationTypesService'
import { Table } from '@/components/ui/table'

const DIRECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'on_us', label: 'On us' },
  { value: 'off_us', label: 'Off us' },
]

const directionIcon = (d: string) => {
  if (d === 'on_us') return <ArrowDown size={13} style={{ color: '#4CAF50' }} />
  if (d === 'off_us') return <ArrowUp size={13} style={{ color: '#F44336' }} />
  return <ArrowLeftRight size={13} style={{ color: '#2196F3' }} />
}

const directionColor = (d: string) => {
  if (d === 'on_us') return { bg: '#F0FDF4', text: '#166534' }
  if (d === 'off_us') return { bg: '#FEF2F2', text: '#991B1B' }
  return { bg: '#EFF6FF', text: '#1E40AF' }
}

function OpTypeDrawer({
  item,
  onClose,
  onSave,
  isEdit,
}: {
  item?: OperationType
  onClose: () => void
  onSave: (i: Pick<OperationType, 'name' | 'direction' | 'tag' | 'description' | 'status'>) => void
  isEdit: boolean
}) {
  const [form, setForm] = useState<OperationType>(
    item || { id: 0, code: '', name: '', direction: 'on_us', tag: '', description: '', status: 'active' }
  )
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>{isEdit ? 'Edit Operation Type' : 'Add Operation Type'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Display Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. P2P Transfer" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Tag</label>
            <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="e.g. transfer, deposit_payment (letters, numbers, _ - only)" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>No spaces; use underscore or hyphen</p>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#04304B' }}>Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {DIRECTION_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, direction: value })} className="py-2.5 rounded-xl border font-medium text-sm cursor-pointer transition-all" style={{ borderColor: form.direction === value ? '#37BBA2' : '#E5E7EB', background: form.direction === value ? '#E8F8F5' : 'white', color: form.direction === value ? '#37BBA2' : '#6B7280', fontSize: 13 }}>{label}</button>
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
          <button onClick={() => onSave({ name: form.name, tag: form.tag, description: form.description, direction: form.direction, status: form.status })} className="flex-1 py-2.5 rounded-xl font-medium text-white cursor-pointer" style={{ background: '#37BBA2', fontSize: 14 }}>{isEdit ? 'Save Changes' : 'Add Type'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminOperationTypes() {
  const [data, setData] = useState<OperationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dirFilter, setDirFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState<{ open: boolean; item?: OperationType }>({ open: false })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    listOperationTypes({ direction: dirFilter === 'all' ? undefined : dirFilter, tag: tagFilter === 'all' ? undefined : tagFilter, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [dirFilter, tagFilter, statusFilter])

  const filtered = data.filter(o => {
    const q = search.toLowerCase()
    return (!search || o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)) &&
      (dirFilter === 'all' || o.direction === dirFilter) &&
      (tagFilter === 'all' || o.tag === tagFilter) &&
      (statusFilter === 'all' || o.status === statusFilter)
  })

  const tags = [...new Set(data.map(o => o.tag).filter(Boolean))]

  const handleSave = async (payload: Pick<OperationType, 'name' | 'direction' | 'tag' | 'description' | 'status'>) => {
    setError(null)
    try {
      if (drawer.item) {
        const id = typeof drawer.item.id === 'string' ? parseInt(drawer.item.id, 10) : drawer.item.id
        await updateOperationType(id, payload)
      } else {
        await createOperationType(payload)
      }
      load()
      setDrawer({ open: false })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    setError(null)
    try {
      await removeOperationType(deleteId)
      setData((prev) => prev.filter((o) => (typeof o.id === 'string' ? parseInt(o.id, 10) : o.id) !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <Components.AdminPageHeader
        title="Transaction Operation Types"
        subtitle="Define and manage transaction operation types"
        action={{ label: 'Add Type', onClick: () => setDrawer({ open: true }), icon: <Plus size={15} /> }}
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between" style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B' }}>
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or name..." className="pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none w-56" style={{ borderColor: '#E5E7EB', fontSize: 13 }} onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>
        <select value={dirFilter} onChange={e => setDirFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
          <option value="all">All Directions</option>
          <option value="on_us">On us</option>
          <option value="off_us">Off us</option>
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
          <option value="all">All Tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
          <span style={{ color: '#6B7280', fontSize: 13 }}>{loading ? 'Loading operation types...' : `${filtered.length} operation types`}</span>
        </div>
        <Table className="w-full min-w-max">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Description', 'Direction', 'Tag', 'Status', 'Date Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center">
                  <div className="inline-flex items-center gap-2" style={{ color: '#6B7280', fontSize: 13 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading operation types...</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(o => {
                const dc = directionColor(o.direction)
                const dateStr = o.date_created ? new Date(o.date_created).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
                return (
                  <tr key={String(o.id)} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-5 py-3"><span className="font-mono text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#F0F9FF', color: '#0369A1' }}>{o.name}</span></td>
                    <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 12 }} title={o.description}>{o.description || '—'}</span></td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg w-fit" style={{ background: dc.bg, color: dc.text }}>
                        {directionIcon(o.direction)} {o.direction.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#F3F4F6', color: '#6B7280' }}>{o.tag}</span></td>
                    <td className="px-5 py-3"><Components.StatusBadge status={o.status} size="sm" /></td>
                    <td className="px-5 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{dateStr}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDrawer({ open: true, item: o })} className="w-11 h-11 inline-flex items-center justify-center hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }} title="Edit operation type" aria-label="Edit operation type"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteId(typeof o.id === 'string' ? parseInt(o.id, 10) : o.id)} className="w-11 h-11 inline-flex items-center justify-center hover:bg-red-50 rounded-lg cursor-pointer" style={{ color: '#F44336' }} title="Delete operation type" aria-label="Delete operation type"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      </div>

      {drawer.open && <OpTypeDrawer item={drawer.item} isEdit={!!drawer.item} onClose={() => setDrawer({ open: false })} onSave={handleSave} />}

      <Components.ConfirmModal
        open={deleteId != null}
        title="Delete Operation Type?"
        message="Are you sure you want to delete this operation type? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
