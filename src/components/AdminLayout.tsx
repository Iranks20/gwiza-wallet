'use client'
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, Globe, DollarSign, ArrowLeftRight, Radio,
  Shield, Users, Group, Key, Settings2, Sliders, FileText,
  Receipt, Building2, BookOpen, Wallet, ClipboardList, ScrollText,
  Activity, ChevronDown, ChevronRight, Bell, Search, User,
  LogOut, ChevronLeft, Menu, AlertCircle, Heart, Zap
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
  const path = location.pathname
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAFBFC', fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 shrink-0"
        style={{
          width: collapsed ? 64 : 240,
          background: '#04304B',
          boxShadow: '2px 0 8px rgba(0,0,0,0.12)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#37BBA2' }}>
                <Wallet size={16} color="white" />
              </div>
              <span className="font-bold text-white text-sm tracking-wide">GwizaWallet</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: '#37BBA2' }}>
              <Wallet size={16} color="white" />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="text-white/60 hover:text-white cursor-pointer">
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="flex justify-center py-2 text-white/60 hover:text-white cursor-pointer">
            <Menu size={16} />
          </button>
        )}

        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {navItems.map(item => {
            const isDirectActive = item.to && path.startsWith(item.to)
            const isSectionActive =
              !item.to &&
              item.children?.some(child => path.startsWith(child.to))
            return (
              <div key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isDirectActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      background: isDirectActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ) : (
                <>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isSectionActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      background: isSectionActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                    }}
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
                          className="flex items-center gap-3 pl-11 pr-4 py-2 transition-colors cursor-pointer"
                          style={{
                            fontSize: 12,
                            fontWeight: 400,
                            color: path.startsWith(child.to) ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                            background: path.startsWith(child.to) ? 'rgba(255,255,255,0.10)' : 'transparent',
                          }}
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#37BBA2' }}>
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">Admin User</p>
                <p className="text-white/50 text-xs truncate">admin@fintech.io</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="cursor-pointer"
              >
                <LogOut size={14} className="text-white/40 hover:text-white" />
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center gap-4 px-6 border-b shrink-0" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
              <input
                placeholder="Search wallet ID, txn ID, MSISDN..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#E5E7EB',
                  background: '#FAFBFC',
                  color: '#04304B',
                  fontSize: 13,
                  borderRadius: 8,
                }}
                onFocus={e => { e.target.style.borderColor = '#37BBA2'; e.target.style.boxShadow = '0 0 0 3px rgba(55,187,162,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Bell size={18} style={{ color: '#04304B' }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#FF6B35' }} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border shadow-lg z-50" style={{ borderColor: '#E5E7EB' }}>
                  <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <h3 className="font-semibold text-sm" style={{ color: '#04304B' }}>Notifications</h3>
                  </div>
                  {[
                    { msg: '5 transactions flagged by rules', time: '2m ago' },
                    { msg: 'New KYC submission: WLT-00821', time: '14m ago' },
                    { msg: 'System health check passed', time: '1h ago' },
                  ].map((n, i) => (
                    <div key={i} className="p-4 border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#E5E7EB' }}>
                      <p className="text-xs font-medium" style={{ color: '#04304B' }}>{n.msg}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#37BBA2' }}>
                  AD
                </div>
                <span className="text-sm font-medium" style={{ color: '#04304B', fontSize: 13 }}>Admin</span>
                <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white rounded-xl border shadow-lg z-50" style={{ borderColor: '#E5E7EB' }}>
                  {['My Profile', 'Settings', 'Sign Out'].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { if (item === 'Sign Out') navigate('/auth') }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                      style={{ color: '#04304B', fontSize: 13 }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6" style={{ background: '#FAFBFC' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
