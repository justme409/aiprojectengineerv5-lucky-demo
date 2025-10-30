'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, FileText, AlertTriangle, Users, Calendar, CheckCircle, Clock, Eye, Edit, Download } from 'lucide-react'

interface Swms {
  id: string
  title: string
  work_activity: string
  hazards: string[]
  controls: string[]
  roles_required: string[]
  expiry_date: string
  status: 'draft' | 'active' | 'expired' | 'superseded'
  approval_status: 'pending' | 'approved' | 'rejected'
  created_by: string
  approved_by?: string
  created_at: string
  updated_at: string
}

export default function SwmsRegisterPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [swms, setSwms] = useState<Swms[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSwms, setSelectedSwms] = useState<Swms | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchSwms = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/hse/swms`)
      if (response.ok) {
        const data = await response.json()
        setSwms(data.swms || [])
      }
    } catch (error) {
      console.error('Error fetching SWMS:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSwms()
  }, [fetchSwms])

  const filteredSwms = swms.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.work_activity.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      active: 'bg-green-500/10 text-green-700 border-green-500/20',
      expired: 'bg-red-500/10 text-red-700 border-red-500/20',
      superseded: 'bg-muted text-muted-foreground border-border'
    }
    return variants[status as keyof typeof variants] || 'bg-muted text-muted-foreground border-border'
  }

  const getApprovalBadge = (status: string) => {
    const variants = {
      pending: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      approved: 'bg-green-500/10 text-green-700 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-700 border-red-500/20'
    }
    return variants[status as keyof typeof variants] || 'bg-muted text-muted-foreground border-border'
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SWMS Register</h1>
          <p className="text-muted-foreground mt-2">Safe Work Method Statements</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create SWMS
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border shadow-sm card-interactive">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <div className="text-2xl font-bold text-card-foreground">{swms.length}</div>
              <div className="text-sm text-muted-foreground">Total SWMS</div>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm card-interactive">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-card-foreground">{swms.filter(s => s.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm card-interactive">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-card-foreground">{swms.filter(s => isExpiringSoon(s.expiry_date)).length}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm card-interactive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <div className="text-2xl font-bold text-card-foreground">{swms.filter(s => isExpired(s.expiry_date)).length}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search SWMS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="superseded">Superseded</option>
            </select>
          </div>
        </div>
      </div>

      {/* SWMS List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SWMS Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hazards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSwms.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.work_activity}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-gray-500">
                          {item.roles_required.join(', ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getApprovalBadge(item.approval_status)}`}>
                        {item.approval_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className={`text-sm ${isExpired(item.expiry_date) ? 'text-red-600 font-medium' : isExpiringSoon(item.expiry_date) ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                      {isExpired(item.expiry_date) && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {isExpiringSoon(item.expiry_date) && !isExpired(item.expiry_date) && (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.hazards.slice(0, 2).map((hazard, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          {hazard}
                        </span>
                      ))}
                      {item.hazards.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{item.hazards.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSwms(item)}
                        className="p-1 text-muted-foreground hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-muted-foreground hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-muted-foreground hover:text-primary"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSwms.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No SWMS Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first Safe Work Method Statement'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First SWMS
              </button>
            )}
          </div>
        )}
      </div>

      {/* SWMS Detail Modal */}
      {selectedSwms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSwms.title}</h2>
                  <p className="text-gray-600">{selectedSwms.work_activity}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedSwms.status)}`}>
                    {selectedSwms.status}
                  </span>
                  <button
                    onClick={() => setSelectedSwms(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSwms.roles_required.map((role, index) => (
                    <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Identified Hazards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSwms.hazards.map((hazard, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">{hazard}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Control Measures</h3>
                <div className="space-y-2">
                  {selectedSwms.controls.map((control, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{control}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Expiry Date</h4>
                  <p className="text-gray-600">{new Date(selectedSwms.expiry_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Created By</h4>
                  <p className="text-gray-600">{selectedSwms.created_by}</p>
                </div>
                {selectedSwms.approved_by && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Approved By</h4>
                    <p className="text-gray-600">{selectedSwms.approved_by}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Last Updated</h4>
                  <p className="text-gray-600">{new Date(selectedSwms.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
