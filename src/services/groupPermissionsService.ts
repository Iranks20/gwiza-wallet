/** Type Group Permissions service – replace with real API when ready */
export interface PermissionAssignment {
  id: string
  permission: string
  groupName: string
  active: boolean
}

const assignments: PermissionAssignment[] = [
  { id: '1', permission: 'wallet.view', groupName: 'Retail - Default', active: true },
  { id: '2', permission: 'wallet.view', groupName: 'Agents - Tier 1', active: true },
  { id: '3', permission: 'wallet.block', groupName: 'Ops - Supervisors', active: true },
  { id: '4', permission: 'wallet.export', groupName: 'Ops - Supervisors', active: true },
  { id: '5', permission: 'fees.manage', groupName: 'Ops - Supervisors', active: true },
  { id: '6', permission: 'fees.view', groupName: 'Retail - Default', active: true },
  { id: '7', permission: 'rules.view', groupName: 'Retail - Default', active: true },
  { id: '8', permission: 'rules.edit', groupName: 'Ops - Supervisors', active: true },
  { id: '9', permission: 'transactions.view', groupName: 'Retail - Default', active: true },
  { id: '10', permission: 'transactions.refund', groupName: 'Ops - Supervisors', active: true },
]

export async function listGroupPermissions(filters?: { groupId?: string; active?: string }): Promise<PermissionAssignment[]> {
  let out = [...assignments]
  if (filters?.active && filters.active !== 'all') out = out.filter(a => (filters.active === 'active') === a.active)
  return out
}

export async function createGroupPermission(data: Omit<PermissionAssignment, 'id'>): Promise<PermissionAssignment> {
  const next = { ...data, id: String(Date.now()) }
  assignments.push(next)
  return next
}

export async function updateGroupPermission(id: string, data: Partial<PermissionAssignment>): Promise<PermissionAssignment | null> {
  const i = assignments.findIndex(a => a.id === id)
  if (i === -1) return null
  assignments[i] = { ...assignments[i], ...data }
  return assignments[i]
}

export async function removeGroupPermission(id: string): Promise<boolean> {
  const i = assignments.findIndex(a => a.id === id)
  if (i === -1) return false
  assignments.splice(i, 1)
  return true
}
