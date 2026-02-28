'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Search, Filter, Eye, ChevronRight, X, Copy, ArrowUpRight, ArrowDownLeft, DollarSign, FileText } from 'lucide-react'

const wallets = [
  { id: 'WLT-00291', accountNo: 'ACC-8821029', memberId: 'MBR-1002', msisdn: '+254712345678', country: 'Kenya', currency: 'KES', balance: '45,200.00', ledger: '45,200.00', status: 'active', profileType: 'Personal', kycTier: 'Gold', created: '2024-01-15' },
  { id: 'WLT-00184', accountNo: 'ACC-7710283', memberId: 'MBR-0891', msisdn: '+2348012345678', country: 'Nigeria', currency: 'NGN', balance: '120,500.00', ledger: '120,500.00', status: 'active', profileType: 'Business', kycTier: 'Platinum', created: '2023-11-20' },
  { id: 'WLT-00392', accountNo: 'ACC-9932018', memberId: 'MBR-1240', msisdn: '+233201234567', country: 'Ghana', currency: 'GHS', balance: '8,900.00', ledger: '9,200.00', status: 'pending', profileType: 'Personal', kycTier: 'Silver', created: '2024-02-28' },
  { id: 'WLT-00102', accountNo: 'ACC-5502881', memberId: 'MBR-0512', msisdn: '+27711234567', country: 'South Africa', currency: 'ZAR', balance: '0.00', ledger: '0.00', status: 'inactive', profileType: 'Personal', kycTier: 'Basic', created: '2023-08-10' },
  { id: 'WLT-00558', accountNo: 'ACC-6621938', memberId: 'MBR-1580', msisdn: '+250781234567', country: 'Rwanda', currency: 'RWF', balance: '32,100.00', ledger: '32,100.00', status: 'active', profileType: 'Agent', kycTier: 'Gold', created: '2024-03-05' },
  { id: 'WLT-00671', accountNo: 'ACC-3312940', memberId: 'MBR-1790', msisdn: '+44712345678', country: 'UK', currency: 'GBP', balance: '2,400.50', ledger: '2,400.50', status: 'active', profileType: 'Personal', kycTier: 'Silver', created: '2024-03-18' },
]

const txns = [
  { id: 'TXN-001842', type: 'P2P Transfer', amount: '+45,000', status: 'completed', date: '2024-03-20 14:22' },
  { id: 'TXN-001731', type: 'Top Up', amount: '+10,000', status: 'completed', date: '2024-03-18 09:15' },
  { id: 'TXN-001620', type: 'Withdrawal', amount: '-5,000', status: 'failed', date: '2024-03-15 16:40' },
]

function WalletDetailModal({ wallet, onClose }: { wallet: typeof wallets[0]; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview')
  const tabs = ['overview', 'transactions', 'fees', 'audit']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" style={{ fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div>
            <h2 className="font-bold" style={{ color: '#04304B', fontSize: 18 }}>Wallet Details</h2>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>{wallet.id} · {wallet.accountNo}</p>
          </div>
          <div className="flex items-center gap-3">
            <Components.StatusBadge status={wallet.status} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-2 text-sm font-medium capitalize rounded-t-lg cursor-pointer transition-colors border-b-2" style={{
              color: activeTab === t ? '#37BBA2' : '#6B7280',
              borderColor: activeTab === t ? '#37BBA2' : 'transparent',
              fontSize: 13
            }}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Available Balance', value: `${wallet.currency} ${wallet.balance}`, highlight: true },
                  { label: 'Ledger Balance', value: `${wallet.currency} ${wallet.ledger}`, highlight: false },
                  { label: 'Member ID', value: wallet.memberId },
                  { label: 'MSISDN', value: wallet.msisdn },
                  { label: 'Country', value: wallet.country },
                  { label: 'KYC Tier', value: wallet.kycTier },
                  { label: 'Profile Type', value: wallet.profileType },
                  { label: 'Created', value: wallet.created },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: item.highlight ? '#E8F8F5' : '#FAFBFC', border: '1px solid #E5E7EB' }}>
                    <p style={{ color: '#9CA3AF', fontSize: 12 }}>{item.label}</p>
                    <p className="font-semibold mt-1" style={{ color: item.highlight ? '#37BBA2' : '#04304B', fontSize: item.highlight ? 20 : 14 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'transactions' && (
            <div>
              <table className="w-full">
                <thead><tr style={{ background: '#FAFBFC' }}>
                  {['ID', 'Type', 'Amount', 'Status', 'Date'].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-3 py-3 text-xs font-mono" style={{ color: '#04304B' }}>{t.id}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#04304B' }}>{t.type}</td>
                      <td className="px-3 py-3 text-xs font-semibold" style={{ color: t.amount.startsWith('+') ? '#4CAF50' : '#F44336' }}>{wallet.currency} {t.amount}</td>
                      <td className="px-3 py-3"><Components.StatusBadge status={t.status} size="sm" /></td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#9CA3AF' }}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'fees' && (
            <div className="space-y-3">
              {[
                { txn: 'TXN-001842', fee: `${wallet.currency} 450.00`, type: 'Transfer Fee', date: '2024-03-20', status: 'settled' },
                { txn: 'TXN-001731', fee: `${wallet.currency} 100.00`, type: 'Top Up Fee', date: '2024-03-18', status: 'settled' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
                  <div>
                    <p className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{f.txn}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 12 }}>{f.type} · {f.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: '#F44336', fontSize: 13 }}>-{f.fee}</span>
                    <Components.StatusBadge status={f.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              {[
                { action: 'Wallet status changed to Active', user: 'admin@fintech.io', date: '2024-03-20 10:00' },
                { action: 'KYC tier upgraded: Silver → Gold', user: 'ops@fintech.io', date: '2024-03-15 14:30' },
                { action: 'Wallet created', user: 'system', date: '2024-01-15 09:00' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#37BBA2' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{a.action}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 12 }}>{a.user} · {a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminWallets() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [selectedWallet, setSelectedWallet] = useState<typeof wallets[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = wallets.filter(w => {
    const q = search.toLowerCase()
    const matchSearch = !search || w.id.toLowerCase().includes(q) || w.accountNo.toLowerCase().includes(q) || w.msisdn.includes(q) || w.memberId.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || w.status === statusFilter
    const matchCountry = countryFilter === 'all' || w.country === countryFilter
    return matchSearch && matchStatus && matchCountry
  })

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        <Components.AdminPageHeader title="Wallets" subtitle="Search and manage wallet accounts across the platform" />

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by wallet ID, account no, MSISDN, member ID..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = '#37BBA2'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
            <Filter size={14} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl border mb-4 grid grid-cols-5 gap-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            {[
              { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [['all','All Status'],['active','Active'],['inactive','Inactive'],['pending','Pending']] },
              { label: 'Country', value: countryFilter, onChange: setCountryFilter, options: [['all','All Countries'],['Kenya','Kenya'],['Nigeria','Nigeria'],['Ghana','Ghana'],['South Africa','South Africa']] },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>{f.label}</label>
                <select value={f.value} onChange={e => f.onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 13 }}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Profile Type</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm cursor-pointer outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }}>
                <option>All Types</option><option>Personal</option><option>Business</option><option>Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Min Balance</label>
              <input placeholder="0.00" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Max Balance</label>
              <input placeholder="999,999.00" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" style={{ borderColor: '#E5E7EB', fontSize: 13 }} />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>{filtered.length} wallets found</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Wallet ID', 'Account No', 'Member ID', 'MSISDN', 'Country', 'Currency', 'Balance', 'KYC Tier', 'Profile Type', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: '#F3F4F6' }} onClick={() => setSelectedWallet(w)}>
                  <td className="px-4 py-3"><span className="font-mono font-semibold" style={{ color: '#37BBA2', fontSize: 12 }}>{w.id}</span></td>
                  <td className="px-4 py-3"><span className="font-mono" style={{ color: '#04304B', fontSize: 12 }}>{w.accountNo}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{w.memberId}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{w.msisdn}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 12 }}>{w.country}</span></td>
                  <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{w.currency}</span></td>
                  <td className="px-4 py-3"><span className="font-semibold" style={{ color: '#04304B', fontSize: 12 }}>{w.balance}</span></td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#E8F8F5', color: '#37BBA2', fontSize: 11 }}>{w.kycTier}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 12 }}>{w.profileType}</span></td>
                  <td className="px-4 py-3"><Components.StatusBadge status={w.status} size="sm" /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Link to={`/admin/wallets/${w.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer" style={{ background: '#E8F8F5', color: '#037F67' }}>
                      <Eye size={12} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#E5E7EB' }}>
            <span style={{ color: '#9CA3AF', fontSize: 13 }}>Showing 1–{filtered.length} of {wallets.length}</span>
            <div className="flex gap-1">
              {[1,2,3].map(p => (
                <button key={p} className="w-8 h-8 rounded-lg text-sm font-medium cursor-pointer" style={{ background: p === 1 ? '#37BBA2' : '#F9FAFB', color: p === 1 ? 'white' : '#6B7280', fontSize: 13 }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {selectedWallet && <WalletDetailModal wallet={selectedWallet} onClose={() => setSelectedWallet(null)} />}
      </div>
  )
}
