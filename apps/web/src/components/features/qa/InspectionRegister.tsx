"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface InspectionRegisterProps {
  projectId: string
}

interface LotOption {
  id: string
  number?: string
  description?: string
  workType?: string
  status?: string
  areaCode?: string
}

interface InspectionPointOption {
  id: string
  description?: string
  requirement?: string
  type?: string
  sequence?: number
  lotNumbers?: string[]
}

interface InspectionRequestRecord {
  id: string
  projectId: string
  checkpointId?: string
  name?: string
  description?: string
  status?: string
  approvalState?: string
  slaHours?: number
  scheduledAt?: string
  slaDueAt?: string
  lot?: LotOption | null
  inspectionPoints?: InspectionPointOption[]
}

interface IRFormData {
  checkpoint_id: string
  name: string
  description: string
  sla_hours: number
  scheduled_at: string
}

const formatLotLabel = (lot: LotOption) => {
  const parts = [lot.number, lot.workType].filter(Boolean)
  return parts.join(' • ') || lot.number || 'Lot'
}

const formatPointLabel = (point: InspectionPointOption) => {
  if (point.description) return point.description
  if (point.requirement) return point.requirement
  return `Inspection Point ${point.sequence ?? ''}`.trim()
}

const getStatusBadgeClass = (value?: string) => {
  switch (value?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function InspectionRegister({ projectId }: InspectionRegisterProps) {
  const { data, mutate } = useSWR(`/api/v1/inspections?projectId=${projectId}`, fetcher)
  const inspections: InspectionRequestRecord[] = data?.data ?? []

  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [formData, setFormData] = useState<IRFormData>({
    checkpoint_id: '',
    name: '',
    description: '',
    sla_hours: 24,
    scheduled_at: '',
  })

  const [lotInputValue, setLotInputValue] = useState('')
  const [lotQuery, setLotQuery] = useState('')
  const [lotResults, setLotResults] = useState<LotOption[]>([])
  const [selectedLot, setSelectedLot] = useState<LotOption | null>(null)
  const [lotDropdownOpen, setLotDropdownOpen] = useState(false)
  const [lotLoading, setLotLoading] = useState(false)
  const lotBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pointQuery, setPointQuery] = useState('')
  const [pointResults, setPointResults] = useState<InspectionPointOption[]>([])
  const [selectedPoints, setSelectedPoints] = useState<InspectionPointOption[]>([])
  const [pointDropdownOpen, setPointDropdownOpen] = useState(false)
  const [pointLoading, setPointLoading] = useState(false)
  const pointBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredInspections = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase()
    return inspections.filter((ir) => {
      const matchesText =
        normalizedFilter.length === 0 ||
        [
          ir.checkpointId,
          ir.name,
          ir.description,
          ir.lot?.number,
          ir.lot?.description,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedFilter))

      const matchesStatus =
        statusFilter === 'all' ||
        ir.status?.toLowerCase() === statusFilter ||
        ir.approvalState?.toLowerCase() === statusFilter

      return matchesText && matchesStatus
    })
  }, [inspections, filter, statusFilter])

  const resetForm = () => {
    setFormData({
      checkpoint_id: '',
      name: '',
      description: '',
      sla_hours: 24,
      scheduled_at: '',
    })
    setSelectedLot(null)
    setLotInputValue('')
    setLotQuery('')
    setLotResults([])
    setLotDropdownOpen(false)
    setLotLoading(false)
    setSelectedPoints([])
    setPointQuery('')
    setPointResults([])
    setPointDropdownOpen(false)
    setPointLoading(false)
    setFormError(null)
  }

  const handleCreateIR = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleCancel = () => {
    resetForm()
    setShowCreateModal(false)
  }

  const handleInputChange = (field: keyof IRFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitIR = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      const checkpoint = formData.checkpoint_id.trim()
      const name = formData.name.trim()
      if (!checkpoint) {
        setFormError('Checkpoint ID is required.')
        return
      }
      if (!name) {
        setFormError('Request name is required.')
        return
      }
      if (!selectedLot) {
        setFormError('Select a lot before submitting the inspection request.')
        return
      }
      if (selectedPoints.length === 0) {
        setFormError('Select at least one hold or witness point.')
        return
      }

      const response = await fetch('/api/v1/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          checkpointId: checkpoint,
          name,
          description: formData.description || undefined,
          slaHours: formData.sla_hours,
          scheduledAt: formData.scheduled_at || undefined,
          lotNodeId: selectedLot.id,
          inspectionPointNodeIds: selectedPoints.map((point) => point.id),
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        setFormError(errorPayload?.error || 'Failed to create inspection request. Please try again.')
        return
      }

      await mutate()
      resetForm()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating inspection request:', error)
      setFormError('Something went wrong while creating the inspection request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!showCreateModal) return

    const controller = new AbortController()
    const handler = setTimeout(() => {
      setLotLoading(true)
      fetch(
        `/api/v1/projects/${projectId}/quality/lots/search?query=${encodeURIComponent(lotQuery)}&limit=15`,
        { signal: controller.signal }
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
        .then((json) => setLotResults(json?.data ?? []))
        .catch((error) => {
          if ((error as Error)?.name !== 'AbortError') {
            console.error('Error fetching lots:', error)
          }
        })
        .finally(() => setLotLoading(false))
    }, 200)

    return () => {
      clearTimeout(handler)
      controller.abort()
      setLotLoading(false)
    }
  }, [lotQuery, projectId, showCreateModal])

  useEffect(() => {
    if (!showCreateModal) return

    const controller = new AbortController()
    const handler = setTimeout(() => {
      setPointLoading(true)
      const params = new URLSearchParams({
        query: pointQuery,
        limit: '25',
      })
      if (selectedLot?.id) {
        params.set('lotNodeId', selectedLot.id)
      }

      fetch(`/api/v1/projects/${projectId}/quality/inspection-points/search?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
        .then((json) => setPointResults(json?.data ?? []))
        .catch((error) => {
          if ((error as Error)?.name !== 'AbortError') {
            console.error('Error fetching inspection points:', error)
          }
        })
        .finally(() => setPointLoading(false))
    }, 200)

    return () => {
      clearTimeout(handler)
      controller.abort()
      setPointLoading(false)
    }
  }, [pointQuery, projectId, selectedLot?.id, showCreateModal])

  const selectLot = (lot: LotOption) => {
    if (lotBlurTimeoutRef.current) clearTimeout(lotBlurTimeoutRef.current)
    setSelectedLot(lot)
    setLotInputValue(formatLotLabel(lot))
    setLotDropdownOpen(false)
    setLotQuery('')
  }

  const clearLot = () => {
    setSelectedLot(null)
    setLotInputValue('')
    setLotQuery('')
    setSelectedPoints([])
  }

  const toggleInspectionPoint = (point: InspectionPointOption) => {
    setSelectedPoints((prev) => {
      const exists = prev.some((p) => p.id === point.id)
      if (exists) {
        return prev.filter((p) => p.id !== point.id)
      }
      return [...prev, point]
    })
  }

  const handleLotFocus = () => {
    if (lotBlurTimeoutRef.current) clearTimeout(lotBlurTimeoutRef.current)
    setLotDropdownOpen(true)
  }

  const handleLotBlur = () => {
    lotBlurTimeoutRef.current = setTimeout(() => setLotDropdownOpen(false), 150)
  }

  const handlePointFocus = () => {
    if (pointBlurTimeoutRef.current) clearTimeout(pointBlurTimeoutRef.current)
    setPointDropdownOpen(true)
  }

  const handlePointBlur = () => {
    pointBlurTimeoutRef.current = setTimeout(() => setPointDropdownOpen(false), 150)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter inspections..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={handleCreateIR}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Create IR
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Checkpoint ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Lot</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">SLA Due</th>
              <th className="px-4 py-2 text-left">Scheduled</th>
              <th className="px-4 py-2 text-left">Points</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInspections.map((ir) => {
              const statusValue = ir.approvalState || ir.status || 'draft'
              return (
                <tr key={ir.id} className="border-t">
                  <td className="px-4 py-2">{ir.checkpointId || '—'}</td>
                  <td className="px-4 py-2">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-900">{ir.name || 'Untitled inspection'}</p>
                      {ir.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{ir.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {ir.lot ? (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{ir.lot.number || formatLotLabel(ir.lot)}</p>
                        {ir.lot.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{ir.lot.description}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(statusValue)}`}>
                      {statusValue.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {ir.slaDueAt ? new Date(ir.slaDueAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {ir.scheduledAt ? new Date(ir.scheduledAt).toLocaleString() : 'Not scheduled'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {ir.inspectionPoints?.length ?? 0}
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-primary hover:text-foreground text-sm">View Details</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredInspections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No inspection requests found. Create inspection requests for quality checkpoints.
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Inspection Request</h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIR} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Checkpoint ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.checkpoint_id}
                    onChange={(event) => handleInputChange('checkpoint_id', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., IR-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SLA Hours</label>
                  <input
                    type="number"
                    value={formData.sla_hours}
                    onChange={(event) => handleInputChange('sla_hours', Number(event.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Inspection request title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => handleInputChange('description', event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Describe the inspection requirements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date/Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(event) => handleInputChange('scheduled_at', event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={lotInputValue}
                    onChange={(event) => {
                      setLotInputValue(event.target.value)
                      setLotQuery(event.target.value)
                      setSelectedLot(null)
                    }}
                    onFocus={handleLotFocus}
                    onBlur={handleLotBlur}
                    placeholder="Start typing a lot number..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {selectedLot && (
                    <button
                      type="button"
                      onClick={clearLot}
                      className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}

                  {lotDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg z-10">
                      {lotLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Loading lots...</div>
                      ) : lotResults.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No lots match your search.</div>
                      ) : (
                        <ul>
                          {lotResults.map((lot) => (
                            <li key={lot.id}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-primary/5"
                                onMouseDown={(event) => {
                                  event.preventDefault()
                                  selectLot(lot)
                                }}
                              >
                                <div className="font-medium text-sm text-gray-900">{lot.number || lot.id}</div>
                                {lot.description && (
                                  <div className="text-xs text-gray-500 line-clamp-2">{lot.description}</div>
                                )}
                                {lot.workType && (
                                  <div className="text-xs text-gray-400">{lot.workType}</div>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                {selectedLot && (
                  <p className="mt-1 text-xs text-gray-500">Selected lot: {formatLotLabel(selectedLot)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Points *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pointQuery}
                    onChange={(event) => setPointQuery(event.target.value)}
                    onFocus={handlePointFocus}
                    onBlur={handlePointBlur}
                    placeholder="Search hold or witness points..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  {pointDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg z-10">
                      {pointLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Loading inspection points...</div>
                      ) : pointResults.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No inspection points found.</div>
                      ) : (
                        <ul>
                          {pointResults.map((point) => {
                            const isSelected = selectedPoints.some((p) => p.id === point.id)
                            return (
                              <li key={point.id}>
                                <button
                                  type="button"
                                  className={`w-full text-left px-4 py-3 hover:bg-primary/5 ${isSelected ? 'bg-primary/10' : ''}`}
                                  onMouseDown={(event) => {
                                    event.preventDefault()
                                    toggleInspectionPoint(point)
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-gray-900">{formatPointLabel(point)}</p>
                                      {point.requirement && (
                                        <p className="text-xs text-gray-500 line-clamp-2">{point.requirement}</p>
                                      )}
                                      {point.type && (
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">{point.type}</p>
                                      )}
                                      {point.lotNumbers && point.lotNumbers.length > 0 && (
                                        <p className="text-xs text-gray-400">Lots: {point.lotNumbers.join(', ')}</p>
                                      )}
                                    </div>
                                    {isSelected && <span className="text-primary text-sm font-semibold">Selected</span>}
                                  </div>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                {selectedPoints.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPoints.map((point) => (
                      <span
                        key={point.id}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {formatPointLabel(point)}
                        <button
                          type="button"
                          onClick={() => toggleInspectionPoint(point)}
                          className="text-primary/70 hover:text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Inspection Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

