'use client'
import React, { useState } from 'react'
import { Outlet, useLocation, Link as RouterLink } from 'react-router'
import { Wallet, ListChecks, User, LayoutGrid, Receipt, Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const items = [
  { key: 'overview', label: 'Overview', icon: <LayoutGrid size={18} />, path: '/user/overview' },
  { key: 'wallets', label: 'My Wallets', icon: <Wallet size={18} />, path: '/user/wallets' },
  { key: 'transactions', label: 'Transactions', icon: <ListChecks size={18} />, path: '/user/transactions' },
  { key: 'fees', label: 'Fees', icon: <Receipt size={18} />, path: '/user/fees' },
  { key: 'profile', label: 'Profile', icon: <User size={18} />, path: '/user/profile' },
]

export default function UserLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const auth = useAuth()
  const displayName = auth.user?.full_name ?? 'User'
  const displayEmail = auth.user?.email_address ?? '—'

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'flex flex-col shrink-0 bg-secondary shadow-lg transition-all duration-300 z-50',
          isMobile ? 'fixed inset-y-0 left-0 w-64' : 'w-56',
          isMobile && !sidebarOpen && '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shrink-0">
            <Wallet size={18} className="text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">GwizaWallet</span>
            <span className="text-[11px] text-white/60">My wallet</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {items.map(item => {
            const active = location.pathname.startsWith(item.path)
            return (
              <RouterLink
                key={item.key}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors',
                  active ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </RouterLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-border bg-card shrink-0 shadow-sm">
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted cursor-pointer shrink-0" aria-label="Open menu">
              <Menu size={20} className="text-foreground" />
            </button>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 truncate max-w-[140px]">{displayEmail}</span>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
