'use client'
import React from 'react'
import Components from '../components'
import { Link } from '@/lib'
import { Plus, Receipt } from 'lucide-react'

const rules = [
  { id: 1, country: 'Kenya', name: 'P2P Domestic', srcCountry: 'Kenya', dstCountry: 'Kenya', opType: 'P2P', channel: 'MOBILE_MONEY', group: 'Retail - Default', min: '10', max: '100,000', action: 'allow', priority: 10, active: 'active' },
  { id: 2, country: 'Nigeria', name: 'High Value Review', srcCountry: 'Nigeria', dstCountry: 'Nigeria', opType: 'P2P', channel: 'BANK_TRANSFER', group: 'Agents - Tier 2', min: '500,000', max: '5,000,000', action: 'deny', priority: 1, active: 'active' },
]

export default function AdminTransactionRules({ country, embedded, configureBasePath }: { country?: string; embedded?: boolean; configureBasePath?: string }) {
  const filtered = rules.filter(r => !country || r.country === country)
  const showFeesLink = Boolean(embedded && configureBasePath)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Rules"
          subtitle="Rule engine controlling which transactions are allowed or blocked"
          action={{ label: 'Add Rule', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

        <div
          className="rounded-xl border overflow-auto"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <table className="min-w-full">
            <thead>
              <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                {['Name', 'Country', 'Source', 'Destination', 'Operation', 'Channel', 'Profile Group', 'Amount Range', 'Action', 'Priority', 'Status', ...(showFeesLink ? ['Fees'] : [])].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13, fontWeight: 500 }}>{r.name}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.country}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.srcCountry}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.dstCountry}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.opType}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.channel}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#6B7280', fontSize: 13 }}>{r.group}</span></td>
                  <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{r.min} – {r.max}</span></td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge
                      status={r.action === 'allow' ? 'success' : 'blocked'}
                      label={r.action === 'allow' ? 'Allow' : 'Deny'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: '#F3F4F6', color: '#6B7280' }}>{r.priority}</span></td>
                  <td className="px-4 py-3">
                    <Components.StatusBadge status={r.active} size="sm" />
                  </td>
                  {showFeesLink && (
                    <td className="px-4 py-3">
                      <Link
                        to={`${configureBasePath}/transaction-rules/${r.id}/transaction-fees`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background: '#E8F8F5', color: '#037F67' }}
                      >
                        <Receipt size={12} />
                        Fees
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )

  return content
}

