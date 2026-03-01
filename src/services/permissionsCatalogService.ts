/** Profile Permissions catalog – replace with real API when ready */
export interface PermissionCatalogItem {
  id: number
  code: string
  scope: string
  tag: string
  description: string
  status: string
}

const mock: PermissionCatalogItem[] = [
  { id: 1, code: 'wallet.view', scope: 'wallet', tag: 'read', description: 'View wallet details', status: 'active' },
  { id: 2, code: 'wallet.block', scope: 'wallet', tag: 'write', description: 'Block / unblock wallets', status: 'active' },
  { id: 3, code: 'wallet.export', scope: 'wallet', tag: 'write', description: 'Export wallet reports', status: 'active' },
  { id: 4, code: 'fees.manage', scope: 'fees', tag: 'admin', description: 'Manage fee schemes', status: 'inactive' },
  { id: 5, code: 'fees.view', scope: 'fees', tag: 'read', description: 'View fee configuration', status: 'active' },
  { id: 6, code: 'rules.view', scope: 'rules', tag: 'read', description: 'View transaction rules', status: 'active' },
  { id: 7, code: 'rules.edit', scope: 'rules', tag: 'write', description: 'Edit transaction rules', status: 'active' },
  { id: 8, code: 'transactions.view', scope: 'transactions', tag: 'read', description: 'View transaction history', status: 'active' },
  { id: 9, code: 'transactions.refund', scope: 'transactions', tag: 'write', description: 'Process refunds', status: 'active' },
  { id: 10, code: 'users.manage', scope: 'wallet', tag: 'admin', description: 'Manage user accounts', status: 'active' },
]

export async function listPermissionsCatalog(filters?: { scope?: string; tag?: string; status?: string }): Promise<PermissionCatalogItem[]> {
  let out = [...mock]
  if (filters?.scope && filters.scope !== 'all') out = out.filter(p => p.scope === filters.scope)
  if (filters?.tag && filters.tag !== 'all') out = out.filter(p => p.tag === filters.tag)
  if (filters?.status && filters.status !== 'all') out = out.filter(p => p.status === filters.status)
  return out
}

export async function getPermissionCatalogById(id: number): Promise<PermissionCatalogItem | null> {
  return mock.find(p => p.id === id) ?? null
}

export async function createPermissionCatalog(data: Omit<PermissionCatalogItem, 'id'>): Promise<PermissionCatalogItem> {
  const next = { ...data, id: Math.max(0, ...mock.map(p => p.id)) + 1 }
  mock.push(next)
  return next
}

export async function updatePermissionCatalog(id: number, data: Partial<PermissionCatalogItem>): Promise<PermissionCatalogItem | null> {
  const i = mock.findIndex(p => p.id === id)
  if (i === -1) return null
  mock[i] = { ...mock[i], ...data }
  return mock[i]
}

export async function removePermissionCatalog(id: number): Promise<boolean> {
  const i = mock.findIndex(p => p.id === id)
  if (i === -1) return false
  mock.splice(i, 1)
  return true
}
