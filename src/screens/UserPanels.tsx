import React from 'react'
import { Link, useParams } from 'react-router'

const cardStyle = { background: '#FFFFFF', borderColor: '#E5E7EB' }

export function UserOverview() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        {['Total Balance', 'Active Wallets', 'Recent Transactions'].map(item => (
          <div key={item} className="rounded-xl border p-4" style={cardStyle}>
            <p className="text-xs" style={{ color: '#6B7280' }}>{item}</p>
            <p className="text-lg font-semibold" style={{ color: '#04304B' }}>—</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UserWallets() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>My Wallets</h1>
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
        <table className="w-full">
          <thead><tr className="border-b" style={{ borderColor: '#E5E7EB' }}><th className="px-4 py-3 text-left text-xs">Wallet ID</th><th className="px-4 py-3 text-left text-xs">Currency</th><th className="px-4 py-3 text-left text-xs">Actions</th></tr></thead>
          <tbody><tr><td className="px-4 py-3">WLT-1001</td><td className="px-4 py-3">RWF</td><td className="px-4 py-3"><Link to="/user/wallets/WLT-1001" style={{ color: '#37BBA2' }}>View Details</Link></td></tr></tbody>
        </table>
      </div>
    </div>
  )
}

export function UserWalletDetails() {
  const { walletId } = useParams()
  return <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>Wallet Details · {walletId}</h1>
}

export function UserTransactionDetails() {
  const { txnId } = useParams()
  return <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>Transaction Details · {txnId}</h1>
}

export function UserFeesHome() {
  return (
    <div className="space-x-4">
      <Link to="/user/fees/by-transaction" style={{ color: '#37BBA2' }}>Fees by Transaction</Link>
      <Link to="/user/fees/by-date-range" style={{ color: '#37BBA2' }}>Fees by Date Range</Link>
    </div>
  )
}

export function UserFeesByTransaction() {
  return <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>Fees by Transaction</h1>
}

export function UserFeesByDateRange() {
  return <h1 className="text-xl font-semibold" style={{ color: '#04304B' }}>Fees by Date Range</h1>
}
