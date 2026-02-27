'use client'
import React, { useState } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import {
  Wallet, ArrowLeftRight, DollarSign, XCircle, ShieldAlert,
  TrendingUp, TrendingDown, Activity, CheckCircle, AlertCircle,
  Clock, RefreshCw, ExternalLink
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'

const txnData = [
  { day: 'Mon', txns: 420, fees: 1240 },
  { day: 'Tue', txns: 680, fees: 1890 },
  { day: 'Wed', txns: 540, fees: 1520 },
  { day: 'Thu', txns: 890, fees: 2340 },
  { day: 'Fri', txns: 760, fees: 2100 },
  { day: 'Sat', txns: 320, fees: 890 },
  { day: 'Sun', txns: 280, fees: 720 },
]

const recentTxns = [
  { id: 'TXN-001842', wallet: 'WLT-00291', type: 'P2P Transfer', amount: '+$240.00', status: 'completed', time: '2 min ago' },
  { id: 'TXN-001841', wallet: 'WLT-00184', type: 'Top Up', amount: '+$500.00', status: 'completed', time: '5 min ago' },
  { id: 'TXN-001840', wallet: 'WLT-00392', type: 'Withdrawal', amount: '-$120.00', status: 'pending', time: '8 min ago' },
  { id: 'TXN-001839', wallet: 'WLT-00102', type: 'P2P Transfer', amount: '+$80.00', status: 'failed', time: '12 min ago' },
  { id: 'TXN-001838', wallet: 'WLT-00558', type: 'Bill Payment', amount: '-$45.00', status: 'blocked', time: '18 min ago' },
]

const auditLogs = [
  { user: 'admin@fintech.io', action: 'Updated KYC Tier: Gold', time: '5 min ago', type: 'update' },
  { user: 'ops@fintech.io', action: 'Created Transaction Rule #28', time: '22 min ago', type: 'create' },
  { user: 'admin@fintech.io', action: 'Deactivated Wallet WLT-00102', time: '45 min ago', type: 'delete' },
  { user: 'super@fintech.io', action: 'Modified Fee Structure: Wire', time: '1h ago', type: 'update' },
]

const kpis = [
  { label: 'Total Wallets', value: '12,842', change: '+142 today', up: true, icon: <Wallet size={22} />, color: '#37BBA2', bg: '#E8F8F5' },
  { label: 'Transactions Today', value: '3,291', change: '+18% vs yesterday', up: true, icon: <ArrowLeftRight size={22} />, color: '#2196F3', bg: '#EFF6FF' },
  { label: 'Fees Collected', value: '$8,420', change: '+$1,240 today', up: true, icon: <DollarSign size={22} />, color: '#0F8B3C', bg: '#F0FDF4' },
  { label: 'Failed Transactions', value: '48', change: '-12 vs yesterday', up: false, icon: <XCircle size={22} />, color: '#F44336', bg: '#FEF2F2' },
  { label: 'Rule Blocks', value: '17', change: '+3 vs yesterday', up: false, icon: <ShieldAlert size={22} />, color: '#FF9800', bg: '#FFF7ED' },
]

export default function AdminDashboard() {
  return (
    <Components.AdminLayout currentPath="/AdminDashboard">
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold" style={{ color: '#04304B', fontSize: 24 }}>Dashboard</h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>Welcome back — here's what's happening today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: kpi.up ? '#4CAF50' : '#F44336' }}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="font-bold" style={{ color: '#04304B', fontSize: 22 }}>{kpi.value}</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: '#6B7280' }}>{kpi.label}</p>
              <p className="text-xs mt-1" style={{ color: kpi.up ? '#4CAF50' : '#F44336' }}>{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Transactions Chart */}
          <div className="col-span-2 rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Transaction Volume</h3>
                <p style={{ color: '#9CA3AF', fontSize: 12 }}>Last 7 days</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>Weekly</span>
            </div>
            <ChartContainer config={{ txns: { color: '#37BBA2' }, fees: { color: '#FF6B35' } }} className="h-48">
              <AreaChart data={txnData}>
                <defs>
                  <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#37BBA2" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#37BBA2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="txns" stroke="#37BBA2" strokeWidth={2} fill="url(#txnGrad)" name="Transactions" />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* System Health */}
          <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#04304B', fontSize: 15 }}>System Health</h3>
            <div className="space-y-3">
              {[
                { label: 'API Health', status: 'healthy', uptime: '99.98%' },
                { label: 'Database', status: 'healthy', uptime: '99.95%' },
                { label: 'Queue Service', status: 'warning', uptime: '99.10%' },
                { label: 'Notification Svc', status: 'healthy', uptime: '100%' },
                { label: 'Readiness Probe', status: 'healthy', uptime: '100%' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: svc.status === 'healthy' ? '#4CAF50' : '#FF9800' }} />
                    <span style={{ color: '#04304B', fontSize: 13 }}>{svc.label}</span>
                  </div>
                  <span style={{ color: svc.status === 'healthy' ? '#4CAF50' : '#FF9800', fontSize: 12, fontWeight: 600 }}>{svc.uptime}</span>
                </div>
              ))}
            </div>
            <Link to="/AdminHealth">
              <button className="mt-4 w-full py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:opacity-90" style={{ background: '#E8F8F5', color: '#37BBA2', fontSize: 13 }}>
                View Full Health Report
              </button>
            </Link>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Recent Transactions */}
          <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Recent Transactions</h3>
              <Link to="/AdminTransactionRegister">
                <button className="flex items-center gap-1 text-xs font-medium cursor-pointer" style={{ color: '#37BBA2' }}>
                  View all <ExternalLink size={11} />
                </button>
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
              {recentTxns.map((txn, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{txn.id}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11 }}>{txn.wallet} · {txn.type} · {txn.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: txn.amount.startsWith('+') ? '#4CAF50' : '#F44336', fontSize: 13 }}>{txn.amount}</span>
                    <Components.StatusBadge status={txn.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Recent Audit Actions</h3>
              <Link to="/AdminAuditLogs">
                <button className="flex items-center gap-1 text-xs font-medium cursor-pointer" style={{ color: '#37BBA2' }}>
                  View all <ExternalLink size={11} />
                </button>
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
              {auditLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5" style={{ background: '#37BBA2' }}>
                    {log.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#04304B', fontSize: 13 }}>{log.action}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11 }}>{log.user} · {log.time}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{
                    background: log.type === 'create' ? '#E8F8F5' : log.type === 'delete' ? '#FEF2F2' : '#FFF7ED',
                    color: log.type === 'create' ? '#37BBA2' : log.type === 'delete' ? '#F44336' : '#FF9800',
                    fontSize: 10
                  }}>
                    {log.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Components.AdminLayout>
  )
}
