'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Package, CheckCircle, AlertTriangle, Clock, Eye, Edit, Download, FileText } from 'lucide-react'

interface Material {
  id: string
  material_code: string
  name: string
  description: string
  category: 'concrete' | 'steel' | 'timber' | 'chemical' | 'aggregate' | 'other'
  supplier: string
  batch_number: string
  quantity_received: number
  quantity_remaining: number
  unit_of_measure: string
  received_date: string
  expiry_date?: string
  status: 'approved' | 'pending_approval' | 'rejected' | 'expired' | 'depleted'
  quality_status: 'passed' | 'failed' | 'pending' | 'not_tested'
  approval_date?: string
  approved_by?: string
  certificates: string[]
  test_results: string[]
  storage_location: string
  safety_data_sheet: string
  notes: string
}

export default function MaterialsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/materials?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setMaterials(data.materials || [])
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryBadge = (category: string) => {
    const colors = {
      concrete: 'bg-muted text-foreground',
      steel: 'bg-gray-100 text-gray-800',
      timber: 'bg-brown-100 text-brown-800',
      chemical: 'bg-purple-100 text-purple-800',
      aggregate: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800',
      depleted: 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getQualityBadge = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      not_tested: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isExpired = (expiryDate?: string) => {
    return expiryDate && new Date(expiryDate) < new Date()
  }

  const isLowStock = (remaining: number, received: number) => {
    return remaining / received < 0.1 // Less than 10% remaining
  }

  const categories = [...new Set(materials.map(m => m.category))]

  // Calculate stats
  const stats = materials.reduce((acc, material) => ({
    total: acc.total + 1,
    approved: acc.approved + (material.status === 'approved' ? 1 : 0),
    pending: acc.pending + (material.status === 'pending_approval' ? 1 : 0),
    expired: acc.expired + (isExpired(material.expiry_date) ? 1 : 0),
    low_stock: acc.low_stock + (isLowStock(material.quantity_remaining, material.quantity_received) ? 1 : 0)
  }), { total: 0, approved: 0, pending: 0, expired: 0, low_stock: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Materials Register</h1>
          <p className="text-gray-600 mt-2">Material approvals, tracking, and quality control</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Register
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Materials</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.low_stock}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending_approval">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="depleted">Depleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{material.material_code}</h3>
                    <p className="text-sm text-gray-600">{material.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isExpired(material.expiry_date) && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {isLowStock(material.quantity_remaining, material.quantity_received) && <Clock className="w-5 h-5 text-orange-600" />}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(material.status)}`}>
                    {material.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(material.category)}`}>
                    {material.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityBadge(material.quality_status)}`}>
                    {material.quality_status}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Supplier:</span> {material.supplier}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Batch:</span> {material.batch_number}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Quantity:</span>
                  {material.quantity_remaining} / {material.quantity_received} {material.unit_of_measure}
                  {isLowStock(material.quantity_remaining, material.quantity_received) && (
                    <span className="text-orange-600 ml-1 font-medium">LOW STOCK</span>
                  )}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Received:</span> {new Date(material.received_date).toLocaleDateString()}
                </div>

                {material.expiry_date && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Expiry:</span>
                    <span className={isExpired(material.expiry_date) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {' '}{new Date(material.expiry_date).toLocaleDateString()}
                    </span>
                    {isExpired(material.expiry_date) && (
                      <span className="text-xs text-red-600 ml-1">EXPIRED</span>
                    )}
                  </div>
                )}

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Location:</span> {material.storage_location}
                </div>

                {material.certificates.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Certificates:</span> {material.certificates.length}
                  </div>
                )}

                {material.test_results.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Tests:</span> {material.test_results.length}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedMaterial(material)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-primary rounded hover:bg-muted text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Materials Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No materials have been added yet'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Material
            </button>
          )}
        </div>
      )}

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.material_code}: {selectedMaterial.name}</h2>
                    <p className="text-gray-600">{selectedMaterial.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryBadge(selectedMaterial.category)}`}>
                    {selectedMaterial.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedMaterial.status)}`}>
                    {selectedMaterial.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getQualityBadge(selectedMaterial.quality_status)}`}>
                    {selectedMaterial.quality_status}
                  </span>
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Material Details</h3>
                  <div className="space-y-2">
                    <div><strong>Material Code:</strong> {selectedMaterial.material_code}</div>
                    <div><strong>Name:</strong> {selectedMaterial.name}</div>
                    <div><strong>Category:</strong> {selectedMaterial.category}</div>
                    <div><strong>Supplier:</strong> {selectedMaterial.supplier}</div>
                    <div><strong>Batch Number:</strong> {selectedMaterial.batch_number}</div>
                    <div><strong>Storage Location:</strong> {selectedMaterial.storage_location}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Quantity & Dates</h3>
                  <div className="space-y-2">
                    <div><strong>Quantity Received:</strong> {selectedMaterial.quantity_received} {selectedMaterial.unit_of_measure}</div>
                    <div><strong>Quantity Remaining:</strong> {selectedMaterial.quantity_remaining} {selectedMaterial.unit_of_measure}</div>
                    <div><strong>Received Date:</strong> {new Date(selectedMaterial.received_date).toLocaleDateString()}</div>
                    {selectedMaterial.expiry_date && (
                      <div><strong>Expiry Date:</strong> {new Date(selectedMaterial.expiry_date).toLocaleDateString()}</div>
                    )}
                    {selectedMaterial.approval_date && selectedMaterial.approved_by && (
                      <div><strong>Approved:</strong> {new Date(selectedMaterial.approval_date).toLocaleString()} by {selectedMaterial.approved_by}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedMaterial.certificates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Certificates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMaterial.certificates.map((cert, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">{cert}</span>
                        <button className="ml-auto text-green-600 hover:text-green-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMaterial.test_results.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMaterial.test_results.map((test, index) => (
                      <div key={index} className="p-3 bg-muted border border-border rounded flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground">{test}</span>
                        <button className="ml-auto text-primary hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMaterial.safety_data_sheet && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Safety Data Sheet</h3>
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{selectedMaterial.safety_data_sheet}</span>
                    <button className="ml-auto text-red-600 hover:text-red-800">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {selectedMaterial.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedMaterial.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
