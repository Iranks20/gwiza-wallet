import React from 'react'
import { Outlet, useLocation, Link as RouterLink } from 'react-router'
import { Wallet, ListChecks, User } from 'lucide-react'

const items = [
  { key: 'home', label: 'Home', icon: <Wallet size={18} />, path: '/user/home' },
  { key: 'transactions', label: 'Activity', icon: <ListChecks size={18} />, path: '/user/transactions' },
  { key: 'profile', label: 'Profile', icon: <User size={18} />, path: '/user/profile' },
]

export default function UserLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 220,
          background: '#04304B',
          boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#37BBA2' }}>
            <Wallet size={18} color="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">GwizaWallet</span>
            <span className="text-[11px] text-white/60">My wallet</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map(item => {
            const active = location.pathname.startsWith(item.path)
            return (
              <RouterLink
                key={item.key}
                to={item.path}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors"
                style={{
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </RouterLink>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-14 flex items-center justify-between px-6 border-b shrink-0"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: '#6B7280' }}>
              Logged in as
            </span>
            <span className="text-sm font-semibold" style={{ color: '#04304B' }}>
              Jane Doe
            </span>
          </div>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            +250781234567
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


