'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Beaker, CheckCircle, AlertTriangle, Clock, Eye, Edit, Download, FileText } from 'lucide-react'

interface MixDesign {
  id: string
  mix_design_code: string
  name: string
  description: string
  concrete_grade: string
  slump_target: number
  max_aggregate_size: number
  water_cement_ratio: number
  cement_content: number // kg/m³
  water_content: number // kg/m³
  fine_aggregate: number // kg/m³
  coarse_aggregate: number // kg/m³
  admixture_type: string
  admixture_dosage: number // kg/m³
  status: 'draft' | 'approved' | 'superseded' | 'rejected'
  approval_date?: string
  approved_by?: string
  created_date: string
  last_modified: string
  target_strength: number // MPa
  air_content?: number // %
  workability: string
  exposure_class: string
  durability_requirements: string[]
  quality_tests: string[]
  batch_records: string[]
  notes: string
}

export default function MixDesignsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [mixDesigns, setMixDesigns] = useState<MixDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMixDesign, setSelectedMixDesign] = useState<MixDesign | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchMixDesigns = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/mix-designs`)
      if (response.ok) {
        const data = await response.json()
        setMixDesigns(data.mixDesigns || [])
      }
    } catch (error) {
      console.error('Error fetching mix designs:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMixDesigns()
  }, [fetchMixDesigns])

  const filteredMixDesigns = mixDesigns.filter(design => {
    const matchesSearch = design.mix_design_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.concrete_grade.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      superseded: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getWorkabilityBadge = (workability: string) => {
    const colors = {
      'Very Low': 'bg-red-100 text-red-800',
      'Low': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-green-100 text-green-800',
      'Very High': 'bg-muted text-foreground'
    }
    return colors[workability as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Mix Designs</h1>
          <p className="text-gray-600 mt-2">Concrete mix design specifications and approvals</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Designs
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Mix Design
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{mixDesigns.length}</div>
          <div className="text-sm text-gray-600">Total Designs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{mixDesigns.filter(d => d.status === 'approved').length}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{mixDesigns.filter(d => d.status === 'draft').length}</div>
          <div className="text-sm text-gray-600">Draft</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-primary">
            {mixDesigns.filter(d => d.quality_tests.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Tested</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search mix designs..."
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
              <option value="approved">Approved</option>
              <option value="superseded">Superseded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mix Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMixDesigns.map((design) => (
          <div key={design.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Beaker className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{design.mix_design_code}</h3>
                    <p className="text-sm text-gray-600">{design.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(design.status)}`}>
                  {design.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Grade:</span> {design.concrete_grade}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Target Strength:</span> {design.target_strength} MPa
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">W/C Ratio:</span> {design.water_cement_ratio.toFixed(3)}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Slump:</span> {design.slump_target}mm
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Workability:</span>
                  <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${getWorkabilityBadge(design.workability)}`}>
                    {design.workability}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Max Aggregate:</span> {design.max_aggregate_size}mm
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Cement:</span> {design.cement_content} kg/m³
                </div>

                {design.air_content && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Air Content:</span> {design.air_content}%
                  </div>
                )}

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Exposure Class:</span> {design.exposure_class}
                </div>

                {design.quality_tests.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Tests:</span> {design.quality_tests.length} completed
                  </div>
                )}

                {design.batch_records.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Batches:</span> {design.batch_records.length} produced
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedMixDesign(design)}
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

      {filteredMixDesigns.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mix Designs Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No mix designs have been created yet'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Mix Design
            </button>
          )}
        </div>
      )}

      {/* Mix Design Detail Modal */}
      {selectedMixDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Beaker className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMixDesign.mix_design_code}: {selectedMixDesign.name}</h2>
                    <p className="text-gray-600">{selectedMixDesign.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedMixDesign.status)}`}>
                    {selectedMixDesign.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getWorkabilityBadge(selectedMixDesign.workability)}`}>
                    {selectedMixDesign.workability}
                  </span>
                  <button
                    onClick={() => setSelectedMixDesign(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Specifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Concrete Grade:</span>
                      <span className="font-medium">{selectedMixDesign.concrete_grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Strength:</span>
                      <span className="font-medium">{selectedMixDesign.target_strength} MPa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slump Target:</span>
                      <span className="font-medium">{selectedMixDesign.slump_target}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Aggregate:</span>
                      <span className="font-medium">{selectedMixDesign.max_aggregate_size}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">W/C Ratio:</span>
                      <span className="font-medium">{selectedMixDesign.water_cement_ratio.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exposure Class:</span>
                      <span className="font-medium">{selectedMixDesign.exposure_class}</span>
                    </div>
                    {selectedMixDesign.air_content && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Air Content:</span>
                        <span className="font-medium">{selectedMixDesign.air_content}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mix Proportions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mix Proportions (kg/m³)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cement:</span>
                      <span className="font-medium">{selectedMixDesign.cement_content}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water:</span>
                      <span className="font-medium">{selectedMixDesign.water_content}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fine Aggregate:</span>
                      <span className="font-medium">{selectedMixDesign.fine_aggregate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coarse Aggregate:</span>
                      <span className="font-medium">{selectedMixDesign.coarse_aggregate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admixture:</span>
                      <span className="font-medium">{selectedMixDesign.admixture_type} ({selectedMixDesign.admixture_dosage})</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-800 font-medium">Total:</span>
                      <span className="font-bold">
                        {selectedMixDesign.cement_content + selectedMixDesign.water_content + selectedMixDesign.fine_aggregate + selectedMixDesign.coarse_aggregate + selectedMixDesign.admixture_dosage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Dates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Status & Dates</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{new Date(selectedMixDesign.created_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Modified:</span>
                      <div className="font-medium">{new Date(selectedMixDesign.last_modified).toLocaleDateString()}</div>
                    </div>
                    {selectedMixDesign.approval_date && selectedMixDesign.approved_by && (
                      <div>
                        <span className="text-gray-600">Approved:</span>
                        <div className="font-medium">
                          {new Date(selectedMixDesign.approval_date).toLocaleDateString()} by {selectedMixDesign.approved_by}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Durability Requirements */}
              {selectedMixDesign.durability_requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Durability Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMixDesign.durability_requirements.map((req, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Tests */}
              {selectedMixDesign.quality_tests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Quality Tests ({selectedMixDesign.quality_tests.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMixDesign.quality_tests.map((test, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">{test}</span>
                        <button className="ml-auto text-green-600 hover:text-green-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch Records */}
              {selectedMixDesign.batch_records.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Batch Records ({selectedMixDesign.batch_records.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedMixDesign.batch_records.map((batch, index) => (
                      <div key={index} className="p-3 bg-muted border border-border rounded flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground">{batch}</span>
                        <button className="ml-auto text-primary hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMixDesign.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedMixDesign.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
