'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, Sliders, Users, Wallet, Activity,
  ChevronDown, ChevronRight, Bell, Search, LogOut, ChevronLeft, Menu
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth, getUserInitials } from '@/contexts/AuthContext'
import { getCountryById } from '@/services/countriesService'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ReactNode
  to?: string
  children?: { label: string; to: string }[]
}

const baseSettingsChildren = [
  { label: 'Currencies', to: '/admin/settings/currencies' },
  { label: 'Transaction Operation Types', to: '/admin/settings/transaction-operation-types' },
  { label: 'Profile Permissions', to: '/admin/settings/profile-permissions' },
  { label: 'User Access Levels', to: '/admin/settings/user-access-levels' },
]

const baseNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/admin/dashboard' },
  {
    label: 'Settings',
    icon: <Sliders size={18} />,
    children: [{ label: 'Countries', to: '/admin/settings/countries' }, ...baseSettingsChildren],
  },
  { label: 'User Management', icon: <Users size={18} />, to: '/admin/user-accounts' },
  { label: 'Wallets', icon: <Wallet size={18} />, to: '/admin/wallets' },
  {
    label: 'Transactions',
    icon: <Activity size={18} />,
    children: [
      { label: 'Transaction Register', to: '/admin/transactions/register' },
      { label: 'Audit Logs', to: '/admin/transactions/audit-logs' },
      { label: 'Fees Ledger', to: '/admin/transactions/fees-ledger' },
    ],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const user = auth.user
  const displayName = user?.full_name ?? 'Admin User'
  const displayEmail = user?.email_address ?? 'admin@fintech.io'
  const initials = getUserInitials(user?.full_name) || 'AD'
  const path = location.pathname
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [opcoCountryName, setOpcoCountryName] = useState<string | null>(null)

  const profileType = (user?.user_profile_type ?? 'global').toLowerCase()
  const countryId = user?.country_id

  useEffect(() => {
    if (profileType === 'opco' && countryId != null && countryId > 0) {
      getCountryById(countryId).then((c) => setOpcoCountryName(c?.name ?? null)).catch(() => setOpcoCountryName(null))
    } else {
      setOpcoCountryName(null)
    }
  }, [profileType, countryId])

  const navItems = useMemo((): NavItem[] => {
    const countryNavItem =
      profileType === 'opco' && countryId != null && countryId > 0
        ? {
            label: opcoCountryName ?? `Country ${countryId}`,
            to: `/admin/settings/countries/${countryId}/configure`,
          }
        : { label: 'Countries', to: '/admin/settings/countries' }

    return baseNavItems.map((item) => {
      if (item.label === 'Settings') {
        return {
          ...item,
          children: [countryNavItem, ...baseSettingsChildren],
        }
      }
      return item
    })
  }, [profileType, countryId, opcoCountryName])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    )
  }

  useEffect(() => {
    const groupsToExpand: string[] = []
    navItems.forEach(item => {
      if (!item.children) return
      if (item.children.some(child => path.startsWith(child.to))) {
        groupsToExpand.push(item.label)
      }
    })
    setExpandedGroups(prev => Array.from(new Set([...prev, ...groupsToExpand])))
  }, [path])

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false)
  }, [isMobile])

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shrink-0">
              <Wallet size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">GwizaWallet</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto bg-primary shrink-0">
            <Wallet size={16} className="text-primary-foreground" />
          </div>
        )}
        {!collapsed && !isMobile && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-white/60 hover:text-white cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
      {collapsed && !isMobile && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex justify-center py-2 text-white/60 hover:text-white cursor-pointer w-full"
          aria-label="Expand sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navItems.map(item => {
          const isDirectActive = item.to && path.startsWith(item.to)
          const isSectionActive =
            !item.to && item.children?.some(child => path.startsWith(child.to))
          return (
            <div key={item.label}>
              {item.to ? (
                <Link
                  to={item.to}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer text-sm font-medium',
                    isDirectActive
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer text-sm font-medium',
                      isSectionActive
                        ? 'text-white bg-white/5'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {expandedGroups.includes(item.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </>
                    )}
                  </button>
                  {!collapsed && expandedGroups.includes(item.label) && (
                    <div className="bg-black/20">
                      {item.children?.map(child => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={closeSidebar}
                          className={cn(
                            'flex items-center gap-3 pl-11 pr-4 py-2 transition-colors cursor-pointer text-xs',
                            path.startsWith(child.to)
                              ? 'text-white bg-white/10'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold bg-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{displayName}</p>
              <p className="text-white/50 text-xs truncate">{displayEmail}</p>
            </div>
            <button
              type="button"
              onClick={() => { auth.signOut(); closeSidebar() }}
              className="cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={14} className="text-white/40 hover:text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col shrink-0 bg-secondary shadow-lg transition-all duration-300 z-50',
          isMobile
            ? 'fixed inset-y-0 left-0 w-64 transform transition-transform'
            : 'w-16',
          !isMobile && !collapsed && 'w-60',
          isMobile && !sidebarOpen && '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 lg:h-16 flex items-center gap-3 lg:gap-4 px-4 lg:px-6 border-b border-border bg-card shrink-0 shadow-sm">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-foreground" />
            </button>
          )}
          <div className="flex-1 min-w-0 max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search wallet ID, txn ID, MSISDN..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary admin-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer transition-colors min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-chart-2" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 lg:w-80 bg-card rounded-xl border border-border shadow-lg z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                  </div>
                  {[
                    { msg: '5 transactions flagged by rules', time: '2m ago' },
                    { msg: 'New KYC submission: WLT-00821', time: '14m ago' },
                    { msg: 'System health check passed', time: '1h ago' },
                  ].map((n, i) => (
                    <div key={i} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-foreground">{n.msg}</p>
                      <p className="text-xs mt-0.5 text-muted-foreground">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors min-h-[44px] lg:min-h-0"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold bg-primary shrink-0">
                  {initials}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline truncate max-w-[120px]">{displayName}</span>
                <ChevronDown size={14} className="text-muted-foreground hidden sm:inline" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 w-48 bg-card rounded-xl border border-border shadow-lg z-50">
                  {['My Profile', 'Settings', 'Sign Out'].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { if (item === 'Sign Out') auth.signOut(); setProfileOpen(false) }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer transition-colors text-foreground first:rounded-t-xl last:rounded-b-xl"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
