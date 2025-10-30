'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, FileText, AlertTriangle, User, Calendar, CheckCircle, Clock, Eye, Edit, Download } from 'lucide-react'

interface Permit {
  id: string
  permit_number: string
  work_description: string
  work_type: string
  location: string
  hazards: string[]
  controls: string[]
  required_ppe: string[]
  authorized_by: string
  issued_to: string
  issued_date: string
  expiry_date: string
  status: 'draft' | 'active' | 'expired' | 'closed'
  approval_status: 'pending' | 'approved' | 'rejected'
}

export default function PermitsRegisterPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [permits, setPermits] = useState<Permit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null)

  const fetchPermits = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/hse/permits`)
      if (response.ok) {
        const data = await response.json()
        setPermits(data.permits || [])
      }
    } catch (error) {
      console.error('Error fetching permits:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.permit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.work_description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const hoursUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
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
          <h1 className="text-3xl font-bold text-gray-900">Permits to Work</h1>
          <p className="text-gray-600 mt-2">Permit management and tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Issue Permit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{permits.length}</div>
          <div className="text-sm text-gray-600">Total Permits</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{permits.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{permits.filter(p => isExpiringSoon(p.expiry_date)).length}</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{permits.filter(p => isExpired(p.expiry_date)).length}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search permits..."
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
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permit Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermits.map((permit) => (
                <tr key={permit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{permit.permit_number}</div>
                      <div className="text-sm text-gray-600">{permit.work_description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {permit.work_type} • {permit.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(permit.status)}`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isExpired(permit.expiry_date) ? 'text-red-600 font-medium' : isExpiringSoon(permit.expiry_date) ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(permit.expiry_date).toLocaleDateString()}
                      </span>
                      {isExpired(permit.expiry_date) && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {isExpiringSoon(permit.expiry_date) && !isExpired(permit.expiry_date) && (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{permit.issued_to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPermit(permit)}
                        className="p-1 text-gray-400 hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-primary"
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

        {filteredPermits.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permits Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Issue your first permit to work'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto">
                <Plus className="w-4 h-4" />
                Issue First Permit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Permit Detail Modal */}
      {selectedPermit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPermit.permit_number}</h2>
                  <p className="text-gray-600">{selectedPermit.work_description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedPermit.status)}`}>
                    {selectedPermit.status}
                  </span>
                  <button
                    onClick={() => setSelectedPermit(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Permit Information</h3>
                  <div className="space-y-2">
                    <div><strong>Work Type:</strong> {selectedPermit.work_type}</div>
                    <div><strong>Location:</strong> {selectedPermit.location}</div>
                    <div><strong>Issued Date:</strong> {new Date(selectedPermit.issued_date).toLocaleDateString()}</div>
                    <div><strong>Expiry Date:</strong> {new Date(selectedPermit.expiry_date).toLocaleDateString()}</div>
                    <div><strong>Authorized By:</strong> {selectedPermit.authorized_by}</div>
                    <div><strong>Issued To:</strong> {selectedPermit.issued_to}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Required PPE</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPermit.required_ppe.map((ppe, index) => (
                      <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Identified Hazards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPermit.hazards.map((hazard, index) => (
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
                  {selectedPermit.controls.map((control, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{control}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
