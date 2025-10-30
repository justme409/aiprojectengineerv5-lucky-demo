'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, BookOpen, FileText, CheckCircle, AlertTriangle, Eye, Edit, Download } from 'lucide-react'

interface TestMethod {
  id: string
  code: string
  name: string
  description: string
  standard_reference: string
  version: string
  category: string
  acceptance_criteria: {
    min_value?: number
    max_value?: number
    units?: string
    qualitative_criteria?: string[]
  }
  equipment_required: string[]
  procedure_steps: string[]
  safety_precautions: string[]
  calibration_requirements: string
  status: 'draft' | 'approved' | 'superseded'
  approved_by: string
  approval_date: string
  review_frequency: string
  next_review_date: string
  attachments: string[]
  notes: string
}

export default function MethodsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [methods, setMethods] = useState<TestMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMethod, setSelectedMethod] = useState<TestMethod | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchMethods = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/methods`)
      if (response.ok) {
        const data = await response.json()
        setMethods(data.methods || [])
      }
    } catch (error) {
      console.error('Error fetching methods:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  const filteredMethods = methods.filter(method => {
    const matchesSearch = method.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.standard_reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || method.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || method.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      superseded: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isReviewOverdue = (nextReviewDate: string) => {
    return new Date(nextReviewDate) < new Date()
  }

  const categories = [...new Set(methods.map(m => m.category))]

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
          <h1 className="text-3xl font-bold text-gray-900">Methods Library</h1>
          <p className="text-gray-600 mt-2">Test methods and procedures library</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Library
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Method
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{methods.length}</div>
          <div className="text-sm text-gray-600">Total Methods</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{methods.filter(m => m.status === 'approved').length}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{categories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{methods.filter(m => isReviewOverdue(m.next_review_date)).length}</div>
          <div className="text-sm text-gray-600">Due Review</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search methods..."
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
                <option key={category} value={category}>{category}</option>
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
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="superseded">Superseded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.code}</h3>
                    <p className="text-sm text-gray-600">{method.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isReviewOverdue(method.next_review_date) && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(method.status)}`}>
                    {method.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Category:</span> {method.category}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Standard:</span> {method.standard_reference}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Version:</span> {method.version}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Next Review:</span>
                  <span className={isReviewOverdue(method.next_review_date) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {' '}{new Date(method.next_review_date).toLocaleDateString()}
                  </span>
                </div>

                {method.equipment_required.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Equipment:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {method.equipment_required.slice(0, 3).map((equipment, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {equipment}
                        </span>
                      ))}
                      {method.equipment_required.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{method.equipment_required.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {method.acceptance_criteria && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Criteria:</span>
                    {method.acceptance_criteria.min_value !== undefined && method.acceptance_criteria.max_value !== undefined ? (
                      <span className="ml-1">
                        {method.acceptance_criteria.min_value} - {method.acceptance_criteria.max_value}
                        {method.acceptance_criteria.units && ` ${method.acceptance_criteria.units}`}
                      </span>
                    ) : method.acceptance_criteria.qualitative_criteria ? (
                      <span className="ml-1">{method.acceptance_criteria.qualitative_criteria.join(', ')}</span>
                    ) : (
                      <span className="ml-1 text-gray-500">Not specified</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedMethod(method)}
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

      {filteredMethods.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Methods Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No test methods have been added yet'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Method
            </button>
          )}
        </div>
      )}

      {/* Method Detail Modal */}
      {selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMethod.code}: {selectedMethod.name}</h2>
                    <p className="text-gray-600">{selectedMethod.standard_reference} • v{selectedMethod.version}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedMethod.status)}`}>
                    {selectedMethod.status}
                  </span>
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{selectedMethod.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Method Details</h3>
                  <div className="space-y-2">
                    <div><strong>Category:</strong> {selectedMethod.category}</div>
                    <div><strong>Standard Reference:</strong> {selectedMethod.standard_reference}</div>
                    <div><strong>Version:</strong> {selectedMethod.version}</div>
                    <div><strong>Review Frequency:</strong> {selectedMethod.review_frequency}</div>
                    <div><strong>Next Review:</strong> {new Date(selectedMethod.next_review_date).toLocaleDateString()}</div>
                    {selectedMethod.approved_by && (
                      <div><strong>Approved By:</strong> {selectedMethod.approved_by} ({new Date(selectedMethod.approval_date).toLocaleDateString()})</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptance Criteria</h3>
                  {selectedMethod.acceptance_criteria ? (
                    <div className="space-y-2">
                      {selectedMethod.acceptance_criteria.min_value !== undefined && selectedMethod.acceptance_criteria.max_value !== undefined && (
                        <div>
                          <strong>Range:</strong> {selectedMethod.acceptance_criteria.min_value} - {selectedMethod.acceptance_criteria.max_value}
                          {selectedMethod.acceptance_criteria.units && ` ${selectedMethod.acceptance_criteria.units}`}
                        </div>
                      )}
                      {selectedMethod.acceptance_criteria.qualitative_criteria && (
                        <div>
                          <strong>Qualitative Criteria:</strong>
                          <ul className="mt-1 ml-4 list-disc">
                            {selectedMethod.acceptance_criteria.qualitative_criteria.map((criteria, index) => (
                              <li key={index} className="text-sm">{criteria}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No acceptance criteria specified</p>
                  )}
                </div>
              </div>

              {selectedMethod.equipment_required.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Equipment Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMethod.equipment_required.map((equipment, index) => (
                      <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod.procedure_steps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Procedure Steps</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {selectedMethod.procedure_steps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedMethod.safety_precautions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Safety Precautions</h3>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <ul className="space-y-1">
                      {selectedMethod.safety_precautions.map((precaution, index) => (
                        <li key={index} className="text-red-800 text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedMethod.calibration_requirements && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Calibration Requirements</h3>
                  <p className="text-gray-700">{selectedMethod.calibration_requirements}</p>
                </div>
              )}

              {selectedMethod.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMethod.attachments.map((attachment, index) => (
                      <div key={index} className="p-3 bg-gray-50 border rounded flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                        <button className="ml-auto text-primary hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedMethod.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
