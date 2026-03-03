'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { Link } from '@/lib'
import {
  Wallet, ArrowLeftRight, DollarSign, XCircle, ShieldAlert,
  TrendingUp, TrendingDown, ExternalLink
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { listWallets } from '@/services/walletsService'
import { listTransactions } from '@/services/transactionRegisterService'
import { listFeesLedgerEntries } from '@/services/feesLedgerService'
import { listAuditLogs } from '@/services/transactionAuditLogsService'
import type { TxnRegisterEntry } from '@/services/transactionRegisterService'
import type { TxnAuditLog } from '@/services/transactionAuditLogsService'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateOnly(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function isToday(iso: string | null): boolean {
  return toDateOnly(iso) === toDateOnly(new Date().toISOString())
}

function isYesterday(iso: string | null): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return toDateOnly(iso) === toDateOnly(yesterday.toISOString())
}

function isLast7Days(iso: string | null): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)
  return diff >= 0 && diff < 7
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return d.toLocaleDateString()
}

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletsTotal, setWalletsTotal] = useState<number | null>(null)
  const [txnToday, setTxnToday] = useState<number>(0)
  const [txnYesterday, setTxnYesterday] = useState<number>(0)
  const [feesToday, setFeesToday] = useState<number>(0)
  const [failedToday, setFailedToday] = useState<number>(0)
  const [failedYesterday, setFailedYesterday] = useState<number>(0)
  const [ruleBlocks, setRuleBlocks] = useState<number>(0)
  const [chartData, setChartData] = useState<{ day: string; txns: number; fees: number }[]>([])
  const [recentTxns, setRecentTxns] = useState<TxnRegisterEntry[]>([])
  const [auditLogs, setAuditLogs] = useState<TxnAuditLog[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const todayStart = `${todayStr}T00:00:00.000Z`
    const todayEnd = `${todayStr}T23:59:59.999Z`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10)

    Promise.all([
      listWallets({ page: 1, limit: 1 }),
      listTransactions({ page: 1, limit: 300 }),
      listFeesLedgerEntries({ startDate: todayStart, endDate: todayEnd, page: 1, limit: 500 }),
      listAuditLogs({ page: 1, limit: 10 }),
    ])
      .then(([wRes, txnRes, feesRes, auditRes]) => {
        if (cancelled) return
        setWalletsTotal(wRes.pagination?.total ?? null)
        const txns = txnRes.items
        setRecentTxns(txnRes.items.slice(0, 5))
        const todayCount = txns.filter(t => isToday(t.transactionDate)).length
        const yesterdayCount = txns.filter(t => isYesterday(t.transactionDate)).length
        setTxnToday(todayCount)
        setTxnYesterday(yesterdayCount)
        const failedT = txns.filter(t => String(t.txnStatus).toLowerCase() === 'failed')
        setFailedToday(failedT.filter(t => isToday(t.transactionDate)).length)
        setFailedYesterday(failedT.filter(t => isYesterday(t.transactionDate)).length)
        const last7 = txns.filter(t => isLast7Days(t.transactionDate))
        const byDay: Record<string, { txns: number; fees: number }> = {}
        for (let i = 0; i < 7; i++) {
          const d = new Date(sevenDaysAgo)
          d.setDate(sevenDaysAgo.getDate() + i)
          const key = d.toISOString().slice(0, 10)
          byDay[key] = { txns: 0, fees: 0 }
        }
        last7.forEach(t => {
          const key = toDateOnly(t.transactionDate)
          if (byDay[key] != null) {
            byDay[key].txns += 1
            byDay[key].fees += t.feeAmount ?? 0
          }
        })
        const chart = Object.entries(byDay)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, v]) => ({
            day: DAY_LABELS[new Date(date + 'Z').getUTCDay()],
            txns: v.txns,
            fees: Math.round(v.fees * 100) / 100,
          }))
        setChartData(chart)
        const feesItems = feesRes.items
        const completedFees = feesItems.filter(f => f.status === 'completed')
        const totalFeesToday = completedFees.reduce((s, f) => s + f.feeAmount, 0)
        setFeesToday(totalFeesToday)
        const blockRelated = auditRes.items.filter(
          a => /block|blocked|reject|rule/i.test(String(a.action))
        )
        setRuleBlocks(blockRelated.length)
        setAuditLogs(auditRes.items.slice(0, 5))
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load dashboard')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const kpis = useMemo(() => {
    const walletChange = walletsTotal != null ? `${walletsTotal.toLocaleString()} total` : '—'
    const txnChange =
      txnYesterday > 0
        ? `${((txnToday - txnYesterday) / txnYesterday * 100).toFixed(0)}% vs yesterday`
        : txnToday > 0
          ? 'vs yesterday'
          : '—'
    const failedChange =
      failedYesterday > 0 || failedToday > 0
        ? `${failedToday - failedYesterday >= 0 ? '+' : ''}${failedToday - failedYesterday} vs yesterday`
        : '—'
    return [
      {
        label: 'Total Wallets',
        value: walletsTotal != null ? walletsTotal.toLocaleString() : '—',
        change: walletChange,
        up: true,
        icon: <Wallet size={22} />,
        color: '#37BBA2',
        bg: '#E8F8F5',
      },
      {
        label: 'Transactions Today',
        value: txnToday.toLocaleString(),
        change: txnChange,
        up: txnToday >= txnYesterday,
        icon: <ArrowLeftRight size={22} />,
        color: '#2196F3',
        bg: '#EFF6FF',
      },
      {
        label: 'Fees Collected Today',
        value: feesToday > 0 ? feesToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
        change: 'today',
        up: true,
        icon: <DollarSign size={22} />,
        color: '#0F8B3C',
        bg: '#F0FDF4',
      },
      {
        label: 'Failed Transactions',
        value: String(failedToday),
        change: failedChange,
        up: false,
        icon: <XCircle size={22} />,
        color: '#F44336',
        bg: '#FEF2F2',
      },
      {
        label: 'Rule Blocks',
        value: String(ruleBlocks),
        change: 'from audit',
        up: false,
        icon: <ShieldAlert size={22} />,
        color: '#FF9800',
        bg: '#FFF7ED',
      },
    ]
  }, [walletsTotal, txnToday, txnYesterday, feesToday, failedToday, failedYesterday, ruleBlocks])

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-6">
        <h1 className="font-bold" style={{ color: '#04304B', fontSize: 24 }}>Dashboard</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Welcome back — here's what's happening today.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}

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

      <div className="mb-6">
        <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Transaction Volume</h3>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>Last 7 days (from recent transactions)</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#E8F8F5', color: '#37BBA2' }}>Weekly</span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center" style={{ color: '#6B7280', fontSize: 13 }}>Loading chart...</div>
          ) : (
            <ChartContainer config={{ txns: { color: '#37BBA2' }, fees: { color: '#FF6B35' } }} className="h-48">
              <AreaChart data={chartData.length ? chartData : [{ day: '—', txns: 0, fees: 0 }]}>
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Recent Transactions</h3>
            <Link to="/admin/transactions/register">
              <button className="flex items-center gap-1 text-xs font-medium cursor-pointer" style={{ color: '#37BBA2' }}>
                View all <ExternalLink size={11} />
              </button>
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {loading ? (
              <div className="px-5 py-6 text-center" style={{ color: '#6B7280', fontSize: 13 }}>Loading...</div>
            ) : recentTxns.length === 0 ? (
              <div className="px-5 py-6 text-center" style={{ color: '#6B7280', fontSize: 13 }}>No recent transactions</div>
            ) : (
              recentTxns.map(txn => (
                <div key={txn.transactionId} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>TXN-{txn.transactionId}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11 }}>WLT-{txn.srcWalletId} · {txn.operationTypeTag || txn.transactionType} · {formatRelativeTime(txn.transactionDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: '#04304B', fontSize: 13 }}>{formatAmount(txn.transactionAmount, txn.currencyCode)}</span>
                    <Components.StatusBadge status={txn.txnStatus} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Recent Audit Actions</h3>
            <Link to="/admin/transactions/audit-logs">
              <button className="flex items-center gap-1 text-xs font-medium cursor-pointer" style={{ color: '#37BBA2' }}>
                View all <ExternalLink size={11} />
              </button>
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {loading ? (
              <div className="px-5 py-6 text-center" style={{ color: '#6B7280', fontSize: 13 }}>Loading...</div>
            ) : auditLogs.length === 0 ? (
              <div className="px-5 py-6 text-center" style={{ color: '#6B7280', fontSize: 13 }}>No recent audit logs</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5" style={{ background: '#37BBA2' }}>
                    {log.performedBy.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#04304B', fontSize: 13 }}>{log.action}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 11 }}>{log.performedBy} · {formatRelativeTime(log.dateCreated)}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{
                    background: '#FFF7ED',
                    color: '#FF9800',
                    fontSize: 10
                  }}>
                    {log.performedByType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
