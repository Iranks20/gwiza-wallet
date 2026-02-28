'use client'
import React from 'react'
import Components from '../components'
import { Plus } from 'lucide-react'

const rows = [
  { id: 1, country: 'Kenya', currency: 'KES', kycTier: 'Gold', profileGroup: 'Retail - Default', daily: '100,000', monthly: '1,000,000', perTxn: '50,000', active: 'active' },
  { id: 2, country: 'Nigeria', currency: 'NGN', kycTier: 'Silver', profileGroup: 'Agents - Tier 2', daily: '500,000', monthly: '5,000,000', perTxn: '250,000', active: 'active' },
]

export default function AdminThresholds({ country, embedded }: { country?: string; embedded?: boolean }) {
  const filtered = rows.filter(r => !country || r.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Threshold Settings"
          subtitle="Configure transaction limits by country, currency, KYC tier and profile group"
          action={{ label: 'Add Threshold', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Country', 'Currency', 'KYC Tier', 'Profile Group', 'Per Txn', 'Daily', 'Monthly', 'Active'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.country}</span></td>
                  <td className="px-4 py-3"><span className="font-mono font-medium" style={{ color: '#04304B', fontSize: 12 }}>{r.currency}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.kycTier}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.profileGroup}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.perTxn}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.daily}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.monthly}</span></td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={r.active} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )

  if (embedded) return content
  return content
}

