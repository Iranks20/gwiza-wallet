import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Link } from '@/lib'
import {
  LayoutDashboard,
  Sliders,
  Wallet,
  ClipboardList,
  ScrollText,
  Receipt,
  Activity,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  CircleCheck,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  to?: string
  children?: { label: string; to: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/admin/dashboard' },
  {
    label: 'Settings',
    icon: <Sliders size={18} />,
    children: [
      { label: 'Countries', to: '/admin/settings/countries' },
      { label: 'Currencies', to: '/admin/settings/currencies' },
      { label: 'Transaction Operation Types', to: '/admin/settings/transaction-operation-types' },
      { label: 'Profile Permissions', to: '/admin/settings/profile-permissions' },
    ],
  },
  { label: 'Wallets', icon: <Wallet size={18} />, to: '/admin/wallets' },
  {
    label: 'Transactions',
    icon: <ClipboardList size={18} />,
    children: [
      { label: 'Transaction Register', to: '/admin/transactions/register' },
      { label: 'Audit Logs', to: '/admin/transactions/audit-logs' },
      { label: 'Fees Ledger', to: '/admin/transactions/fees-ledger' },
    ],
  },
  {
    label: 'System Health',
    icon: <Activity size={18} />,
    children: [
      { label: 'Health', to: '/admin/system/health' },
      { label: 'Ready', to: '/admin/system/ready' },
    ],
  },
]

export default function AdminLayout({ children, currentPath }: { children?: React.ReactNode; currentPath?: string }) {
  const location = useLocation()
  const activePath = currentPath || location.pathname
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  useEffect(() => {
    const groupsToExpand = navItems
      .filter(item => item.children?.some(child => activePath.startsWith(child.to)))
      .map(item => item.label)
    setExpandedGroups(prev => Array.from(new Set([...prev, ...groupsToExpand])))
  }, [activePath])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => (prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]))
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      <aside className="w-64 flex flex-col" style={{ background: '#04304B' }}>
        <div className="px-4 py-4 border-b border-white/10 text-white font-semibold">GwizaWallet Admin</div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map(item => {
            const active = item.to ? location.pathname.startsWith(item.to) : item.children?.some(child => activePath.startsWith(child.to))
            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className="flex items-center gap-3 px-4 py-2.5" style={{ color: active ? '#FFF' : 'rgba(255,255,255,0.72)', background: active ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            }

            const expanded = expandedGroups.includes(item.label)
            return (
              <div key={item.label}>
                <button onClick={() => toggleGroup(item.label)} className="w-full flex items-center gap-3 px-4 py-2.5" style={{ color: active ? '#FFF' : 'rgba(255,255,255,0.72)', background: active ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                  <span className="ml-auto">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                </button>
                {expanded && (
                  <div className="pl-10 pb-1">
                    {item.children?.map(child => {
                      const childActive = activePath.startsWith(child.to)
                      return (
                        <Link key={child.label} to={child.to} className="flex items-center gap-2 py-1.5 text-sm" style={{ color: childActive ? '#37BBA2' : 'rgba(255,255,255,0.72)' }}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b px-6 flex items-center justify-between" style={{ background: '#FFF', borderColor: '#E5E7EB' }}>
          <span className="text-sm font-medium" style={{ color: '#04304B' }}>Admin Panel</span>
          <div className="flex gap-4 text-xs" style={{ color: '#6B7280' }}>
            <span className="inline-flex items-center gap-1"><HeartPulse size={14} />Monitors</span>
            <span className="inline-flex items-center gap-1"><CircleCheck size={14} />Stable</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
