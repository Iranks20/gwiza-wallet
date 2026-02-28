'use client'
import React from 'react'
import { useParams } from 'react-router'
import { Link } from '@/lib'
import Components from '../components'

const stubWallet = { id: 'WLT-00291', accountNo: 'ACC-8821029', memberId: 'MBR-1002', msisdn: '+254712345678', country: 'Kenya', currency: 'KES', balance: '45,200.00', ledger: '45,200.00', status: 'active', profileType: 'Personal', kycTier: 'Gold', created: '2024-01-15' }

export default function AdminWalletDetails() {
  const { walletId } = useParams<{ walletId: string }>()
  const w = stubWallet

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/admin/wallets" className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Wallets</Link>
      </div>
      <Components.AdminPageHeader
        title={`Wallet ${walletId ?? w.id}`}
        subtitle={`${w.accountNo} · ${w.memberId}`}
      />

      <div className="rounded-xl border p-5 mb-4" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Available Balance', value: `${w.currency} ${w.balance}`, highlight: true },
            { label: 'Ledger Balance', value: `${w.currency} ${w.ledger}` },
            { label: 'Member ID', value: w.memberId },
            { label: 'MSISDN', value: w.msisdn },
            { label: 'Country', value: w.country },
            { label: 'KYC Tier', value: w.kycTier },
            { label: 'Profile Type', value: w.profileType },
            { label: 'Status', value: '' },
            { label: 'Created', value: w.created },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: item.highlight ? '#E8F8F5' : '#FAFBFC', border: '1px solid #E5E7EB' }}>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>{item.label}</p>
              {item.label === 'Status' ? <Components.StatusBadge status={w.status} size="sm" /> : <p className="font-semibold mt-1" style={{ color: item.highlight ? '#37BBA2' : '#04304B', fontSize: item.highlight ? 20 : 14 }}>{item.value}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
