'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Settings, Shield, Users, Database, Bell, Save, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

interface ProjectSettings {
  name: string
  description: string
  location: string
  client_name: string
  status: string
  compliance_pack: string
  feature_flags: Record<string, boolean>
  notification_settings: {
    email_notifications: boolean
    inspection_reminders: boolean
    approval_deadlines: boolean
  }
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [settings, setSettings] = useState<ProjectSettings>({
    name: '',
    description: '',
    location: '',
    client_name: '',
    status: 'draft',
    compliance_pack: '',
    feature_flags: {
      quality_module: true,
      hse_module: true,
      field_operations: true,
      approvals: true,
      reporting: true
    },
    notification_settings: {
      email_notifications: true,
      inspection_reminders: true,
      approval_deadlines: true
    }
  })

  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string, user_id: string, email: string, permissions: string[] }>>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const PERMS = ['read','write','approve','settings','admin','portal_client','site'] as const

  const fetchProjectSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setSettings({
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          client_name: data.client_name || '',
          status: data.status || 'draft',
          compliance_pack: data.settings?.compliance_pack || '',
          feature_flags: data.settings?.feature_flags || settings.feature_flags,
          notification_settings: data.settings?.notification_settings || settings.notification_settings
        })
      }
    } catch (error) {
      console.error('Error fetching project settings:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, settings.feature_flags, settings.notification_settings])

  useEffect(() => {
    fetchProjectSettings()
  }, [fetchProjectSettings])

  // Fetch team when Team tab active
  useEffect(() => {
    if (activeTab !== 'team') return
    let mounted = true
    ;(async () => {
      try {
        setTeamLoading(true)
        const res = await fetch(`/api/v1/projects/${projectId}/team`, { cache: 'no-store' })
        if (!mounted) return
        if (res.ok) {
          const json = await res.json()
          setTeamMembers(json.members || [])
        }
      } finally {
        if (mounted) setTeamLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [activeTab, projectId])

  const togglePerm = (idx: number, perm: string) => {
    setTeamMembers(prev => {
      const copy = [...prev]
      const row = { ...copy[idx] }
      const cur = new Set(row.permissions || [])
      if (cur.has(perm)) cur.delete(perm); else cur.add(perm)
      row.permissions = Array.from(cur)
      copy[idx] = row
      return copy
    })
  }

  const applyPreset = (idx: number, preset: 'admin'|'client'|'contractor'|'site') => {
    const map: Record<string, string[]> = {
      admin: ['read','write','approve','settings','admin'],
      client: ['read','approve','portal_client'],
      contractor: ['read','write'],
      site: ['read','write','settings','site'],
    }
    setTeamMembers(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], permissions: map[preset] }
      return copy
    })
  }

  const saveTeam = async () => {
    setTeamLoading(true)
    try {
      // Persist each member's permissions (simple approach)
      for (const m of teamMembers) {
        await fetch(`/api/v1/projects/${projectId}/team`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: m.id, permissions: m.permissions || [] })
        })
      }
      alert('Team updated')
    } catch (e) {
      console.error(e)
      alert('Failed to update team')
    } finally {
      setTeamLoading(false)
    }
  }

  const addMember = async () => {
    const email = newMemberEmail.trim().toLowerCase()
    if (!email) return
    setTeamLoading(true)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permissions: ['read'] })
      })
      if (res.ok) {
        setNewMemberEmail('')
        // refresh
        const list = await fetch(`/api/v1/projects/${projectId}/team`, { cache: 'no-store' }).then(r => r.json())
        setTeamMembers(list.members || [])
      } else {
        alert('Failed to add member')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to add member')
    } finally {
      setTeamLoading(false)
    }
  }

  const removeMember = async (id: string) => {
    if (!confirm('Remove this member?')) return
    setTeamLoading(true)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/team?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        setTeamMembers(prev => prev.filter(m => m.id !== id))
      } else {
        alert('Failed to remove member')
      }
    } finally { setTeamLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          description: settings.description,
          location: settings.location,
          client_name: settings.client_name,
          status: settings.status,
          settings: {
            compliance_pack: settings.compliance_pack,
            feature_flags: settings.feature_flags,
            notification_settings: settings.notification_settings
          }
        })
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Error saving settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'features', label: 'Features', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users }
  ]

  const compliancePacks = [
    { id: 'NSW_Q6_2024_02', name: 'NSW Q6 (2024)', description: 'New South Wales Quality Systems' },
    { id: 'QLD_MRTS50_2025_03', name: 'QLD MRTS50 (2025)', description: 'Queensland Major Roads Technical Specification' },
    { id: 'VIC_SEC160_MW_2018_11', name: 'VIC SEC160 MW (2018)', description: 'Victorian Major Works Standards' },
    { id: 'SA_PCQA2_2024_09', name: 'SA PCQA2 (2024)', description: 'South Australian Principal Certifying Authority' },
    { id: 'TAS_SEC160_2025_06', name: 'TAS SEC160 (2025)', description: 'Tasmanian Engineering Standards' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
        <p className="text-gray-600 mt-2">Configure project details, compliance requirements, and feature settings.</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={settings.client_name}
                    onChange={(e) => setSettings({...settings, client_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => setSettings({...settings, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={settings.status}
                    onChange={(e) => setSettings({...settings, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Compliance Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Compliance Pack
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compliancePacks.map((pack) => (
                      <div
                        key={pack.id}
                        onClick={() => setSettings({...settings, compliance_pack: pack.id})}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          settings.compliance_pack === pack.id
                            ? 'border-primary bg-muted'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{pack.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Feature Flags</h2>
              <div className="space-y-4">
                {Object.entries(settings.feature_flags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{key.replace('_', ' ').toUpperCase()}</h3>
                      <p className="text-sm text-gray-600">Enable/disable this feature module</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          feature_flags: {
                            ...settings.feature_flags,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Settings</h2>
              <div className="space-y-4">
                {Object.entries(settings.notification_settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{key.replace('_', ' ').toUpperCase()}</h3>
                      <p className="text-sm text-gray-600">Receive notifications for this event type</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          notification_settings: {
                            ...settings.notification_settings,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Management</h2>
              <p className="text-sm text-gray-600">Add users by email and set permissions. No organization restriction.</p>

              {/* Add member */}
              <div className="flex gap-2 items-center">
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1"
                />
                <Button onClick={addMember} variant="outline" size="sm" disabled={teamLoading || !newMemberEmail}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* Members table */}
              <div className="overflow-x-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      {PERMS.map(p => (
                        <TableHead key={p} className="capitalize">
                          {p === 'portal_client' ? 'Client portal' : p === 'site' ? 'Site' : p}
                        </TableHead>
                      ))}
                      <TableHead>Presets</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamLoading && teamMembers.length === 0 ? (
                      <TableRow><TableCell colSpan={PERMS.length + 3} className="text-sm text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : teamMembers.length === 0 ? (
                      <TableRow><TableCell colSpan={PERMS.length + 3} className="text-sm text-muted-foreground">No team members yet.</TableCell></TableRow>
                    ) : (
                      teamMembers.map((m, idx) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm">{m.email || m.user_id}</TableCell>
                          {PERMS.map(p => (
                            <TableCell key={p}>
                              <Checkbox
                                checked={(m.permissions || []).includes(p)}
                                onCheckedChange={() => togglePerm(idx, p)}
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => applyPreset(idx, 'admin')}>Admin</Button>
                              <Button size="sm" variant="outline" onClick={() => applyPreset(idx, 'client')}>Client</Button>
                              <Button size="sm" variant="outline" onClick={() => applyPreset(idx, 'contractor')}>Contractor</Button>
                              <Button size="sm" variant="outline" onClick={() => applyPreset(idx, 'site')}>Site</Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="destructive" size="sm" onClick={() => removeMember(m.id)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveTeam} disabled={teamLoading} variant="default">
                  {teamLoading ? 'Saving…' : 'Save Team Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
