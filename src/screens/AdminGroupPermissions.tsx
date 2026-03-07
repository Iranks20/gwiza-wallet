'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router'
import Components from '../components'
import { Trash2 } from 'lucide-react'
import type { ProfileTypeGroupPermission } from '@/services/groupPermissionsService'
import { listGroupPermissions, createGroupPermission, updateGroupPermission, removeGroupPermission } from '@/services/groupPermissionsService'
import type { PermissionCatalogItem } from '@/services/permissionsCatalogService'
import { listPermissionsCatalog } from '@/services/permissionsCatalogService'
import { getProfileTypeGroupById } from '@/services/profileTypeGroupsService'
import { ApiError } from '@/api/client'

export default function AdminGroupPermissions({ embedded, countryId: countryIdProp, groupId: groupIdProp }: { country?: string; embedded?: boolean; countryId?: number; groupId?: number }) {
  const params = useParams<{ groupId?: string; countryId?: string }>()
  const countryId = countryIdProp ?? (params.countryId ? parseInt(params.countryId, 10) : 0)
  const groupIdNum = groupIdProp ?? (params.groupId !== undefined && params.groupId !== '' ? parseInt(params.groupId, 10) : NaN)
  const hasValidGroup = typeof groupIdNum === 'number' && !Number.isNaN(groupIdNum) && groupIdNum >= 0 && groupIdNum > 0

  const [groupName, setGroupName] = useState<string>('')
  const [assignments, setAssignments] = useState<ProfileTypeGroupPermission[]>([])
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchAssigned, setSearchAssigned] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchCatalog, setSearchCatalog] = useState('')

  const profileTypeGroupsListPath = countryId ? `/admin/settings/countries/${countryId}/configure/profile-types/profile-type-groups` : ''

  const loadAssignments = () => {
    setError(null)
    if (!hasValidGroup) {
      setAssignments([])
      return
    }
    setLoading(true)
    listGroupPermissions({ groupId: groupIdNum })
      .then(setAssignments)
      .catch(e => { setError(e instanceof ApiError ? e.message : 'Failed to load permissions') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAssignments() }, [groupIdNum, hasValidGroup])

  useEffect(() => {
    if (!hasValidGroup) {
      setGroupName('')
      return
    }
    getProfileTypeGroupById(groupIdNum)
      .then(g => { if (g) setGroupName(g.name) })
      .catch(() => {})
  }, [groupIdNum, hasValidGroup])

  useEffect(() => {
    setCatalogLoading(true)
    setCatalogError(null)
    listPermissionsCatalog()
      .then(setCatalog)
      .catch(e => {
        setCatalogError(e instanceof ApiError ? e.message : 'Failed to load permissions catalog')
      })
      .finally(() => setCatalogLoading(false))
  }, [])

  const assignedScopes = useMemo(() => new Set(assignments.map(a => a.permissionScope)), [assignments])

  const scopeToPermission = useMemo(() => {
    const map: Record<string, PermissionCatalogItem> = {}
    catalog.forEach(p => {
      if (p.scope) map[p.scope] = p
    })
    return map
  }, [catalog])

  const filteredAssignments = useMemo(() => {
    let list = assignments
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter)
    const q = searchAssigned.trim().toLowerCase()
    if (q) {
      list = list.filter(a => {
        const perm = scopeToPermission[a.permissionScope]
        const name = (perm?.code ?? perm?.description ?? '').toLowerCase()
        return (
          a.permissionScope.toLowerCase().includes(q) ||
          name.includes(q)
        )
      })
    }
    return list
  }, [assignments, statusFilter, searchAssigned, scopeToPermission])

  const filteredCatalog = useMemo(() => {
    let list = catalog
    const q = searchCatalog.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        p.code.toLowerCase().includes(q) ||
        p.scope.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      )
    }
    return list
  }, [catalog, searchCatalog])

  const handleToggleStatus = async (assignment: ProfileTypeGroupPermission) => {
    setError(null)
    const nextStatus = assignment.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await updateGroupPermission(assignment.id, { status: nextStatus })
      if (updated) {
        setAssignments(prev => prev.map(a => (a.id === assignment.id ? updated : a)))
      } else {
        loadAssignments()
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to update permission status')
    }
  }

  const handleAssignScope = async (scope: string) => {
    if (!hasValidGroup) return
    setError(null)
    try {
      await createGroupPermission({ profileTypeGroupId: groupIdNum, permissionScope: scope, status: 'active' })
      loadAssignments()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to assign permission')
    }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    setError(null)
    try {
      await removeGroupPermission(deleteId)
      loadAssignments()
      setDeleteId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to remove permission')
    }
  }

  const content = (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {embedded && profileTypeGroupsListPath && (
        <div className="mb-4">
          <Link to={profileTypeGroupsListPath} className="text-sm cursor-pointer" style={{ color: '#37BBA2' }}>← Back to Profile Type Groups</Link>
        </div>
      )}
      {!embedded && (
        <Components.AdminPageHeader
          title="Type Group Permissions"
          subtitle={groupName ? `Manage permissions for "${groupName}"` : 'Assign permissions to this profile type group'}
        />
      )}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold" style={{ color: '#04304B', fontSize: 18 }}>Group Permissions</h2>
            {groupName && <p style={{ color: '#6B7280', fontSize: 12 }}>For group: {groupName}</p>}
          </div>
        </div>
      )}
      {error && <p className="mb-2 text-sm" style={{ color: '#B91C1C' }}>{error}</p>}
      {(!hasValidGroup && embedded) && !loading && (
        <p className="text-sm" style={{ color: '#6B7280' }}>Select a group to manage permissions.</p>
      )}
      {hasValidGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Assigned Permissions</h3>
                <p style={{ color: '#9CA3AF', fontSize: 12 }}>{assignments.length} total assignments</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={searchAssigned}
                  onChange={e => setSearchAssigned(e.target.value)}
                  placeholder="Search assigned..."
                  className="px-3 py-1.5 border rounded-lg text-xs outline-none"
                  style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 12 }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-2.5 py-1.5 border rounded-lg text-xs cursor-pointer outline-none"
                  style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 12 }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            {loading && <p className="mb-2 text-sm" style={{ color: '#6B7280' }}>Loading permissions…</p>}
            {!loading && (
              <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                      {['Permission', 'Scope', 'Status', 'Assigned on', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map(a => {
                      const perm = scopeToPermission[a.permissionScope]
                      const name = perm?.code ?? perm?.description ?? a.permissionScope
                      return (
                        <tr key={a.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                          <td className="px-4 py-3">
                            <span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: '#6B7280', fontSize: 13 }}>{a.permissionScope}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Components.StatusBadge status={a.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: '#6B7280', fontSize: 13 }}>
                              {a.dateCreated
                                ? new Date(a.dateCreated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(a)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer"
                                style={{
                                  background: '#EFF6FF',
                                  color: a.status === 'active' ? '#1E40AF' : '#6B7280',
                                }}
                              >
                                {a.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => setDeleteId(a.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                style={{ color: '#F44336' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {!loading && filteredAssignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                          No permissions assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: '#04304B', fontSize: 15 }}>Available Permissions</h3>
                <p style={{ color: '#9CA3AF', fontSize: 12 }}>From permissions catalog</p>
              </div>
              <input
                value={searchCatalog}
                onChange={e => setSearchCatalog(e.target.value)}
                placeholder="Search catalog..."
                className="px-3 py-1.5 border rounded-lg text-xs outline-none"
                style={{ borderColor: '#E5E7EB', color: '#04304B', fontSize: 12 }}
              />
            </div>
            {catalogError && (
              <p className="mb-2 text-xs" style={{ color: '#B91C1C' }}>{catalogError}</p>
            )}
            {catalogLoading ? (
              <p className="text-sm" style={{ color: '#6B7280' }}>Loading permissions catalog…</p>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#FAFBFC', borderBottom: '1px solid #E5E7EB' }}>
                      {['Permission', 'Scope', 'Tag', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map(p => {
                      const assigned = assignedScopes.has(p.scope)
                      return (
                        <tr key={p.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                          <td className="px-4 py-3">
                            <span className="font-medium" style={{ color: '#04304B', fontSize: 13 }}>{p.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: '#6B7280', fontSize: 13 }}>{p.scope}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: '#6B7280', fontSize: 13 }}>{p.tag}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Components.StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            {assigned ? (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: '#E8F8F5', color: '#037F67' }}>
                                Assigned
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAssignScope(p.scope)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer"
                                style={{ background: '#E8F8F5', color: '#037F67' }}
                              >
                                Assign
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {!catalogLoading && filteredCatalog.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                          No permissions found in catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <Components.ConfirmModal
        open={deleteId != null}
        title="Remove permission?"
        message={<>Remove this permission from the group?</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )

  return content
}
