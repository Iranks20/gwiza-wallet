'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Components from '../components'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@/lib'
import {
  Wallet, ArrowLeftRight, DollarSign, XCircle, ShieldAlert,
  TrendingUp, TrendingDown, ExternalLink, Loader2
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { listWallets } from '@/services/walletsService'
import { listTransactions } from '@/services/transactionRegisterService'
import { listFeesLedgerEntries } from '@/services/feesLedgerService'
import { listAuditLogs } from '@/services/transactionAuditLogsService'
import type { TxnRegisterEntry } from '@/services/transactionRegisterService'
import type { TxnAuditLog } from '@/services/transactionAuditLogsService'
import { cn } from '@/lib/utils'

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

const KPI_STYLES = {
  primary: { icon: 'bg-primary-muted text-primary', trend: 'text-success' },
  info: { icon: 'bg-info-muted text-info', trend: 'text-success' },
  success: { icon: 'bg-success-muted text-success', trend: 'text-success' },
  error: { icon: 'bg-error-muted text-error', trend: 'text-error' },
  warning: { icon: 'bg-warning-muted text-warning', trend: 'text-error' },
} as const

export default function AdminDashboard() {
  const auth = useAuth()
  const firstName = auth.user?.full_name?.split(/\s+/)[0] ?? ''
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
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

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
      { label: 'Total Wallets', value: walletsTotal != null ? walletsTotal.toLocaleString() : '—', change: walletChange, up: true, icon: <Wallet size={22} />, style: 'primary' as const },
      { label: 'Transactions Today', value: txnToday.toLocaleString(), change: txnChange, up: txnToday >= txnYesterday, icon: <ArrowLeftRight size={22} />, style: 'info' as const },
      { label: 'Fees Collected Today', value: feesToday > 0 ? feesToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—', change: 'today', up: true, icon: <DollarSign size={22} />, style: 'success' as const },
      { label: 'Failed Transactions', value: String(failedToday), change: failedChange, up: false, icon: <XCircle size={22} />, style: 'error' as const },
      { label: 'Rule Blocks', value: String(ruleBlocks), change: 'from audit', up: false, icon: <ShieldAlert size={22} />, style: 'warning' as const },
    ]
  }, [walletsTotal, txnToday, txnYesterday, feesToday, failedToday, failedYesterday, ruleBlocks])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-page-title text-foreground">Dashboard</h1>
        <p className="text-caption text-muted-foreground mt-1.5">
          {firstName ? `Welcome back, ${firstName} — ` : 'Welcome back — '}here's what's happening today.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-error/30 bg-error-muted text-error text-body">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {kpis.map((kpi, i) => {
          const styles = KPI_STYLES[kpi.style]
          return (
            <div key={i} className="rounded-xl p-6 border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.icon)}>
                  {kpi.icon}
                </div>
                <span className={cn('flex items-center gap-1 text-meta font-medium', styles.trend)}>
                  {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </span>
              </div>
              <p className="font-semibold text-[1.375rem] text-foreground tracking-tight">{kpi.value}</p>
              <p className="text-caption text-muted-foreground mt-1 font-medium">{kpi.label}</p>
              <p className={cn('text-meta mt-1.5 font-medium', styles.trend)}>{kpi.change}</p>
            </div>
          )
        })}
      </div>

      <div className="mb-8">
        <div className="rounded-xl p-6 border border-border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-section text-foreground">Transaction Volume</h3>
              <p className="text-meta text-muted-foreground mt-1">Last 7 days (from recent transactions)</p>
            </div>
            <span className="text-meta px-3 py-1.5 rounded-lg font-medium bg-primary-muted text-primary w-fit">Weekly</span>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground text-body">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading chart...</span>
              </div>
            </div>
          ) : (
            <ChartContainer config={{ txns: { color: 'var(--primary)' }, fees: { color: 'var(--chart-2)' } }} className="h-52">
              <AreaChart data={chartData.length ? chartData : [{ day: '—', txns: 0, fees: 0 }]}>
                <defs>
                  <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="txns" stroke="var(--primary)" strokeWidth={2} fill="url(#txnGrad)" name="Transactions" />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-section text-foreground">Recent Transactions</h3>
            <Link to="/admin/transactions/register">
              <button className="flex items-center gap-1.5 text-caption font-medium text-primary hover:underline cursor-pointer">
                View all <ExternalLink size={12} />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground text-body">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading recent transactions...</span>
                </div>
              </div>
            ) : recentTxns.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-body">No recent transactions</div>
            ) : (
              recentTxns.map(txn => (
                <div key={txn.transactionId} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-body truncate">TXN-{txn.transactionId}</p>
                    <p className="text-meta text-muted-foreground truncate mt-0.5">WLT-{txn.srcWalletId} · {txn.operationTypeTag || txn.transactionType} · {formatRelativeTime(txn.transactionDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-foreground text-body tabular-nums">{formatAmount(txn.transactionAmount, txn.currencyCode)}</span>
                    <Components.StatusBadge status={txn.txnStatus} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-section text-foreground">Recent Audit Actions</h3>
            <Link to="/admin/transactions/audit-logs">
              <button className="flex items-center gap-1.5 text-caption font-medium text-primary hover:underline cursor-pointer">
                View all <ExternalLink size={12} />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground text-body">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading recent audit actions...</span>
                </div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-body">No recent audit logs</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-caption font-semibold text-primary-foreground bg-primary">
                    {log.performedBy.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-body truncate">{log.action}</p>
                    <p className="text-meta text-muted-foreground mt-0.5">{log.performedBy} · {formatRelativeTime(log.dateCreated)}</p>
                  </div>
                  <span className="text-meta px-2.5 py-1 rounded-md font-medium bg-warning-muted text-warning shrink-0">
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
