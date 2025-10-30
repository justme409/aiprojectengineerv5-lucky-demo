'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Award, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Edit, Download, FileText } from 'lucide-react'

interface Certificate {
  id: string
  certificate_number: string
  title: string
  type: 'calibration' | 'msds' | 'accreditation' | 'training' | 'equipment' | 'other'
  issuing_authority: string
  issued_to: string
  issue_date: string
  expiry_date: string
  status: 'valid' | 'expired' | 'revoked' | 'pending'
  description: string
  standards_referenced: string[]
  equipment_serial_numbers?: string[]
  calibration_points?: string[]
  attachments: string[]
  reminder_days: number
  notes: string
}

export default function CertificatesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchCertificates = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/certificates`)
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || cert.type === typeFilter
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    const colors = {
      calibration: 'bg-muted text-foreground',
      msds: 'bg-green-100 text-green-800',
      accreditation: 'bg-purple-100 text-purple-800',
      training: 'bg-orange-100 text-orange-800',
      equipment: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      valid: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isExpiringSoon = (expiryDate: string, reminderDays: number) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= reminderDays && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const types = [...new Set(certificates.map(c => c.type))]

  // Calculate stats
  const stats = certificates.reduce((acc, cert) => ({
    total: acc.total + 1,
    valid: acc.valid + (cert.status === 'valid' ? 1 : 0),
    expired: acc.expired + (isExpired(cert.expiry_date) ? 1 : 0),
    expiring_soon: acc.expiring_soon + (isExpiringSoon(cert.expiry_date, cert.reminder_days) && !isExpired(cert.expiry_date) ? 1 : 0)
  }), { total: 0, valid: 0, expired: 0, expiring_soon: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Certificates Register</h1>
          <p className="text-gray-600 mt-2">Calibration certificates, MSDS, and accreditations</p>
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
            Add Certificate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Certificates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          <div className="text-sm text-gray-600">Valid</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.certificate_number}</h3>
                    <p className="text-sm text-gray-600">{cert.title}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isExpired(cert.expiry_date) && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {isExpiringSoon(cert.expiry_date, cert.reminder_days) && !isExpired(cert.expiry_date) && (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(cert.status)}`}>
                    {cert.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(cert.type)}`}>
                    {cert.type}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Authority:</span> {cert.issuing_authority}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Issued To:</span> {cert.issued_to}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Issue Date:</span> {new Date(cert.issue_date).toLocaleDateString()}
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-900">Expiry:</span>
                  <span className={isExpired(cert.expiry_date) ? 'text-red-600 font-medium' : isExpiringSoon(cert.expiry_date, cert.reminder_days) ? 'text-orange-600 font-medium' : 'text-gray-900'}>
                    {' '}{new Date(cert.expiry_date).toLocaleDateString()}
                  </span>
                  {isExpired(cert.expiry_date) && (
                    <span className="text-xs text-red-600 ml-1">EXPIRED</span>
                  )}
                  {isExpiringSoon(cert.expiry_date, cert.reminder_days) && !isExpired(cert.expiry_date) && (
                    <span className="text-xs text-orange-600 ml-1">SOON</span>
                  )}
                </div>

                {cert.standards_referenced.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Standards:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {cert.standards_referenced.slice(0, 2).map((standard, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-foreground rounded text-xs">
                          {standard}
                        </span>
                      ))}
                      {cert.standards_referenced.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{cert.standards_referenced.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {cert.equipment_serial_numbers && cert.equipment_serial_numbers.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Equipment:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {cert.equipment_serial_numbers.slice(0, 2).map((serial, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {serial}
                        </span>
                      ))}
                      {cert.equipment_serial_numbers.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{cert.equipment_serial_numbers.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {cert.attachments.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Attachments:</span> {cert.attachments.length}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedCertificate(cert)}
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

      {filteredCertificates.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No certificates have been added yet'
            }
          </p>
          {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Certificate
            </button>
          )}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCertificate.certificate_number}</h2>
                    <p className="text-gray-600">{selectedCertificate.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeBadge(selectedCertificate.type)}`}>
                    {selectedCertificate.type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedCertificate.status)}`}>
                    {selectedCertificate.status}
                  </span>
                  <button
                    onClick={() => setSelectedCertificate(null)}
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
                <p className="text-gray-700">{selectedCertificate.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Certificate Details</h3>
                  <div className="space-y-2">
                    <div><strong>Certificate Number:</strong> {selectedCertificate.certificate_number}</div>
                    <div><strong>Type:</strong> {selectedCertificate.type}</div>
                    <div><strong>Issuing Authority:</strong> {selectedCertificate.issuing_authority}</div>
                    <div><strong>Issued To:</strong> {selectedCertificate.issued_to}</div>
                    <div><strong>Issue Date:</strong> {new Date(selectedCertificate.issue_date).toLocaleDateString()}</div>
                    <div><strong>Expiry Date:</strong> {new Date(selectedCertificate.expiry_date).toLocaleDateString()}</div>
                    <div><strong>Reminder Days:</strong> {selectedCertificate.reminder_days}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Associated Information</h3>
                  {selectedCertificate.standards_referenced.length > 0 && (
                    <div className="mb-4">
                      <strong>Standards Referenced:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedCertificate.standards_referenced.map((standard, index) => (
                          <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                            {standard}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCertificate.equipment_serial_numbers && selectedCertificate.equipment_serial_numbers.length > 0 && (
                    <div className="mb-4">
                      <strong>Equipment Serial Numbers:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedCertificate.equipment_serial_numbers.map((serial, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {serial}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCertificate.calibration_points && selectedCertificate.calibration_points.length > 0 && (
                    <div>
                      <strong>Calibration Points:</strong>
                      <ul className="mt-1 ml-4 list-disc">
                        {selectedCertificate.calibration_points.map((point, index) => (
                          <li key={index} className="text-sm text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {selectedCertificate.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCertificate.attachments.map((attachment, index) => (
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

              {selectedCertificate.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedCertificate.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
