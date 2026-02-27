import React from 'react'
import { Outlet, useLocation, Link as RouterLink } from 'react-router'
import { LayoutDashboard, Wallet, ListChecks, Receipt } from 'lucide-react'

const items = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/user/overview' },
  { key: 'wallets', label: 'My Wallets', icon: <Wallet size={18} />, path: '/user/wallets' },
  { key: 'transactions', label: 'Transactions', icon: <ListChecks size={18} />, path: '/user/transactions' },
  { key: 'fees', label: 'Fees', icon: <Receipt size={18} />, path: '/user/fees' },
]

export default function UserLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      <aside className="flex flex-col shrink-0" style={{ width: 220, background: '#04304B' }}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10 text-white font-semibold">GwizaWallet User</div>
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
            return (
              <RouterLink key={item.key} to={item.path} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium" style={{ color: active ? '#FFF' : 'rgba(255,255,255,0.7)', background: active ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                {item.icon}
                {item.label}
              </RouterLink>
            )
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b" style={{ background: '#FFF', borderColor: '#E5E7EB' }}>
          <span className="text-sm font-semibold" style={{ color: '#04304B' }}>User Panel</span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>+250781234567</span>
        </header>
        <main className="flex-1 overflow-auto p-4"><Outlet /></main>
      </div>
    </div>
  )
}
