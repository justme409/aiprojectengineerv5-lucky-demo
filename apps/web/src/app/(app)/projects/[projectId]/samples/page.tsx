'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, TestTube, MapPin, Calendar, Clock, User, Eye, Edit, Download, Beaker as FlaskIcon } from 'lucide-react'

interface Sample {
  id: string
  sample_id: string
  test_request_id: string
  description: string
  sample_type: string
  location_collected: string
  collected_by: string
  collected_date: string
  collection_method: string
  quantity: string
  condition: 'good' | 'fair' | 'poor' | 'damaged'
  storage_location: string
  storage_conditions: string
  expiry_date: string
  chain_of_custody: string[]
  tests_required: string[]
  status: 'collected' | 'in_transit' | 'at_lab' | 'tested' | 'disposed'
  notes: string
}

export default function SamplesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchSamples = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/samples`)
      if (response.ok) {
        const data = await response.json()
        setSamples(data.samples || [])
      }
    } catch (error) {
      console.error('Error fetching samples:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSamples()
  }, [fetchSamples])

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.test_request_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      collected: 'bg-muted text-foreground',
      in_transit: 'bg-yellow-100 text-yellow-800',
      at_lab: 'bg-purple-100 text-purple-800',
      tested: 'bg-green-100 text-green-800',
      disposed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getConditionBadge = (condition: string) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      damaged: 'bg-red-100 text-red-800'
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
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
          <h1 className="text-3xl font-bold text-gray-900">Sample Register</h1>
          <p className="text-gray-600 mt-2">Sample collection, storage, and chain of custody</p>
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
            New Sample
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{samples.length}</div>
          <div className="text-sm text-gray-600">Total Samples</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{samples.filter(s => s.status === 'collected').length}</div>
          <div className="text-sm text-gray-600">Collected</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{samples.filter(s => s.status === 'at_lab').length}</div>
          <div className="text-sm text-gray-600">At Lab</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{samples.filter(s => s.status === 'tested').length}</div>
          <div className="text-sm text-gray-600">Tested</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{samples.filter(s => isExpired(s.expiry_date)).length}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search samples..."
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
              <option value="collected">Collected</option>
              <option value="in_transit">In Transit</option>
              <option value="at_lab">At Lab</option>
              <option value="tested">Tested</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{sample.sample_id}</div>
                      <div className="text-sm text-gray-600">{sample.description}</div>
                      <div className="text-xs text-gray-500">{sample.sample_type} • {sample.collection_method}</div>
                      <div className="text-xs text-gray-500">Request: {sample.test_request_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(sample.status)}`}>
                      {sample.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionBadge(sample.condition)}`}>
                      {sample.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isExpired(sample.expiry_date) ? 'text-red-600 font-medium' : isExpiringSoon(sample.expiry_date) ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(sample.expiry_date).toLocaleDateString()}
                      </span>
                      {isExpired(sample.expiry_date) && (
                        <span className="text-xs text-red-600">EXPIRED</span>
                      )}
                      {isExpiringSoon(sample.expiry_date) && !isExpired(sample.expiry_date) && (
                        <span className="text-xs text-orange-600">SOON</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{sample.storage_location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSample(sample)}
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
                        title="Chain of Custody"
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

        {filteredSamples.length === 0 && (
          <div className="text-center py-12">
            <FlaskIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Samples Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No samples have been collected yet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Collect Sample
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sample Detail Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <FlaskIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSample.sample_id}</h2>
                    <p className="text-gray-600">{selectedSample.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedSample.status)}`}>
                    {selectedSample.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionBadge(selectedSample.condition)}`}>
                    {selectedSample.condition}
                  </span>
                  <button
                    onClick={() => setSelectedSample(null)}
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
                  <h3 className="text-lg font-semibold mb-3">Sample Information</h3>
                  <div className="space-y-2">
                    <div><strong>Test Request ID:</strong> {selectedSample.test_request_id}</div>
                    <div><strong>Sample Type:</strong> {selectedSample.sample_type}</div>
                    <div><strong>Collection Method:</strong> {selectedSample.collection_method}</div>
                    <div><strong>Quantity:</strong> {selectedSample.quantity}</div>
                    <div><strong>Collected By:</strong> {selectedSample.collected_by}</div>
                    <div><strong>Collection Date:</strong> {new Date(selectedSample.collected_date).toLocaleDateString()}</div>
                    <div><strong>Expiry Date:</strong> {new Date(selectedSample.expiry_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Storage & Location</h3>
                  <div className="space-y-2">
                    <div><strong>Location Collected:</strong> {selectedSample.location_collected}</div>
                    <div><strong>Storage Location:</strong> {selectedSample.storage_location}</div>
                    <div><strong>Storage Conditions:</strong> {selectedSample.storage_conditions}</div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 mt-6">Tests Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSample.tests_required.map((test, index) => (
                      <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Chain of Custody</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedSample.chain_of_custody.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{entry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSample.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedSample.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
