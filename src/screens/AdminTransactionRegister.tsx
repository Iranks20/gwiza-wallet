'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Search, Filter, Eye, X, ChevronRight, Download } from 'lucide-react'

const transactions = [
  { id: 'TXN-001842', ref: 'REF-882910', type: 'P2P Transfer', channel: 'Mobile App', sourceWallet: 'WLT-00291', destWallet: 'WLT-00184', amount: '45,000.00', currency: 'KES', fee: '450.00', net: '44,550.00', status: 'completed', date: '2024-03-20 14:22:10', note: 'Rent payment' },
  { id: 'TXN-001841', ref: 'REF-882909', type: 'Top Up', channel: 'USSD', sourceWallet: 'EXT-MPESA', destWallet: 'WLT-00184', amount: '10,000.00', currency: 'NGN', fee: '100.00', net: '9,900.00', status: 'completed', date: '2024-03-20 12:15:33', note: '' },
  { id: 'TXN-001840', ref: 'REF-882908', type: 'Withdrawal', channel: 'ATM', sourceWallet: 'WLT-00392', destWallet: 'EXT-BANK', amount: '5,000.00', currency: 'GHS', fee: '50.00', net: '4,950.00', status: 'pending', date: '2024-03-20 11:08:45', note: '' },
  { id: 'TXN-001839', ref: 'REF-882907', type: 'P2P Transfer', channel: 'Mobile App', sourceWallet: 'WLT-00102', destWallet: 'WLT-00558', amount: '8,000.00', currency: 'ZAR', fee: '80.00', net: '7,920.00', status: 'failed', date: '2024-03-20 09:55:12', note: 'Business payment' },
  { id: 'TXN-001838', ref: 'REF-882906', type: 'Bill Payment', channel: 'API', sourceWallet: 'WLT-00558', destWallet: 'BILL-ELEC', amount: '2,500.00', currency: 'RWF', fee: '25.00', net: '2,475.00', status: 'blocked', date: '2024-03-19 22:30:00', note: 'Electricity bill' },
  { id: 'TXN-001837', ref: 'REF-882905', type: 'P2P Transfer', channel: 'Web', sourceWallet: 'WLT-00671', destWallet: 'WLT-00291', amount: '120.00', currency: 'GBP', fee: '1.20', net: '118.80', status: 'completed', date: '2024-03-19 18:14:28', note: 'Gift' },
  { id: 'TXN-001836', ref: 'REF-882904', type: 'Fee Charge', channel: 'System', sourceWallet: 'WLT-00291', destWallet: 'SYS-FEES', amount: '450.00', currency: 'KES', fee: '0.00', net: '450.00', status: 'completed', date: '2024-03-19 14:22:10', note: 'Auto fee debit' },
]

function TxnDetailModal({ txn, onClose }: { txn: typeof transactions[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div>
            <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Transaction Detail</h2>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>{txn.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Components.StatusBadge status={txn.status} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="rounded-xl p-5 text-center" style={{ background: '#E8F8F5' }}>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Transaction Amount</p>
            <p className="font-bold mt-1" style={{ color: '#37BBA2', fontSize: 30 }}>{txn.currency} {txn.amount}</p>
          </div>
          {/* Details */}
          <div className="space-y-3">
            {[
              ['Reference', txn.ref],
              ['Type', txn.type],
              ['Channel', txn.channel],
              ['Source Wallet', txn.sourceWallet],
              ['Destination Wallet', txn.destWallet],
              ['Fee', `${txn.currency} ${txn.fee}`],
              ['Net Amount', `${txn.currency} ${txn.net}`],
              ['Date & Time', txn.date],
              ['Note', txn.note || '—'],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{k}</span>
                <span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{v}</span>
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

export default function AdminTransactionRegister() {
  const [search, setSearch] = useState('')
  const [walletIdFilter, setWalletIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTxn, setSelectedTxn] = useState<typeof transactions[0] | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    const match = !search || t.id.toLowerCase().includes(q) || t.sourceWallet.toLowerCase().includes(q) || t.destWallet.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q)
    const matchWallet = !walletIdFilter || t.sourceWallet.toLowerCase().includes(walletIdFilter.toLowerCase()) || t.destWallet.toLowerCase().includes(walletIdFilter.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchDateFrom = !dateFrom || t.date >= dateFrom
    const matchDateTo = !dateTo || t.date <= dateTo
    return match && matchWallet && matchStatus && matchDateFrom && matchDateTo
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader title="Transaction Register" subtitle="Full ledger of all platform transactions"
          secondaryAction={{ label: 'Export CSV', onClick: () => {}, icon: <Download size={14} /> }}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search txn ID, reference..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <input value={walletIdFilter} onChange={e => setWalletIdFilter(e.target.value)} placeholder="Wallet ID" className="px-3 py-2 border rounded-lg text-sm outline-none w-28" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
          </select>
          <div className="flex items-center gap-2">
            <label style={{ color: '#6B7280', fontSize: 13 }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
          </div>
          <div className="flex items-center gap-2">
            <label style={{ color: '#6B7280', fontSize: 13 }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none cursor-pointer" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 13 }}>{filtered.length} results</span>
        </div>

        {/* Table */}
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
              {filtered.map((t, i) => (
                <tr key={t.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{t.id}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{t.type}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{t.channel}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 11 }}>{t.sourceWallet}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 11 }}>{t.destWallet}</span></td>
                  <td className="px-4 py-3"><span className="font-semibold" style={{ color: '#04304B', fontSize: 12 }}>{t.currency} {t.amount}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 12 }}>{t.currency} {t.fee}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={t.status} size="sm" /></td>
                  <td className="px-4 py-3"><span style={{ color: '#9CA3AF', fontSize: 11 }}>{t.date}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedTxn(t)} className="p-1.5 hover:bg-teal-50 rounded-lg cursor-pointer" style={{ color: '#37BBA2' }}><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>Showing 1–{filtered.length} of {transactions.length}</span>
            <div className="flex gap-1">
              {[1,2,3,'...','12'].map((p, i) => (
                <button key={i} className="w-8 h-8 rounded-lg text-sm font-medium cursor-pointer" style={{ background: p === 1 ? '#37BBA2' : '#F9FAFB', color: p === 1 ? 'white' : '#6B7280', fontSize: 12 }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {selectedTxn && <TxnDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
      </div>
  )
}
