'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Plus } from 'lucide-react'

const fees = [
  { id: 1, country: 'Kenya', rule: 'P2P Domestic', feeType: 'PERCENT', min: '0', max: '100,000', value: '1.5%', status: 'active' },
  { id: 2, country: 'Kenya', rule: 'P2P Domestic', feeType: 'FIXED', min: '0', max: '100,000', value: 'KES 10', status: 'active' },
  { id: 3, country: 'Nigeria', rule: 'P2P Domestic', feeType: 'FIXED', min: '0', max: '500,000', value: 'NGN 50', status: 'active' },
]

export default function AdminTransactionFees({ country, embedded }: { country?: string; embedded?: boolean }) {
  const [amount, setAmount] = useState('1000')
  const [sim, setSim] = useState<{ base: string; fixed: string; percent: string; total: string } | null>(null)

  const runSimulation = () => {
    const amt = Number(amount || '0')
    const fixed = 10
    const percent = amt * 0.015
    const total = fixed + percent
    setSim({
      base: amt.toFixed(2),
      fixed: fixed.toFixed(2),
      percent: percent.toFixed(2),
      total: total.toFixed(2),
    })
  }

  const filtered = fees.filter(f => !country || f.country === country)

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {!embedded && (
        <Components.AdminPageHeader
          title="Transaction Fees"
          subtitle="Configure fee schemes and simulate customer charges"
          action={{ label: 'Add Fee', onClick: () => {}, icon: <Plus size={15} /> }}
        />
      )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB', background: '#FAFBFC' }}>
              <span style={{ color: '#6B7280', fontSize: 13 }}>Configured Fees</span>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Rule', 'Fee Type', 'Amount Range', 'Value', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{f.rule}</span></td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#EFF6FF', color: '#1E40AF' }}>{f.feeType}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{f.min} – {f.max}</span></td>
                    <td className="px-4 py-3"><span style={{ color: '#04304B', fontSize: 13 }}>{f.value}</span></td>
                    <td className="px-4 py-3"><Components.StatusBadge status={f.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#04304B', fontSize: 15 }}>Fee Simulation Tool</h3>
            <p className="mb-4" style={{ color: '#6B7280', fontSize: 13 }}>Enter an amount to see a sample fee breakdown.</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Amount</label>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#E5E7EB', fontSize: 13 }}
                />
              </div>
            </div>
            <button
              onClick={runSimulation}
              className="w-full py-2.5 rounded-lg font-medium text-white cursor-pointer mb-4"
              style={{ background: '#37BBA2', fontSize: 14 }}
            >
              Simulate Fee
            </button>
            {sim && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#6B7280' }}>Base Amount</span>
                  <span style={{ color: '#04304B' }}>KES {sim.base}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#6B7280' }}>Fixed Fee</span>
                  <span style={{ color: '#04304B' }}>KES {sim.fixed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#6B7280' }}>Percent Fee (1.5%)</span>
                  <span style={{ color: '#04304B' }}>KES {sim.percent}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <span style={{ color: '#04304B', fontWeight: 600 }}>Total Fee</span>
                  <span style={{ color: '#F44336', fontWeight: 600 }}>KES {sim.total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )

  if (embedded) return content
  return <Components.AdminLayout>{content}</Components.AdminLayout>
}

