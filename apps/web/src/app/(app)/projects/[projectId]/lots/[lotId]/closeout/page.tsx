'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, Download, Eye, Calendar, MapPin, User, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

interface LotCloseout {
  id: string
  lot_id: string
  lot_name: string
  project_id: string
  status: 'draft' | 'in_review' | 'approved' | 'published'
  created_date: string
  completed_date?: string

  // Quality Documentation
  inspection_points: InspectionPoint[]
  test_results: TestResult[]
  ncr_items: NCRItem[]

  // HSE Documentation
  swms_completed: boolean
  inductions_completed: boolean
  safety_walks: SafetyWalk[]
  incidents: Incident[]

  // Material Documentation
  material_certificates: MaterialCertificate[]
  mix_designs: MixDesign[]

  // Final Documentation
  handover_documents: HandoverDocument[]
  client_signoff: ClientSignoff[]
  completion_certificate: CompletionCertificate
}

interface InspectionPoint {
  id: string
  code: string
  title: string
  status: 'pending' | 'passed' | 'failed'
  completed_date?: string
  inspector: string
}

interface TestResult {
  id: string
  test_type: string
  result: 'pass' | 'fail'
  date_completed: string
  lab_name: string
}

interface NCRItem {
  id: string
  title: string
  status: 'open' | 'closed'
  severity: 'minor' | 'major' | 'critical'
}

interface SafetyWalk {
  id: string
  date: string
  inspector: string
  findings: string[]
}

interface Incident {
  id: string
  date: string
  type: string
  severity: string
  status: 'open' | 'closed'
}

interface MaterialCertificate {
  id: string
  material: string
  supplier: string
  certificate_number: string
  expiry_date: string
}

interface MixDesign {
  id: string
  name: string
  batch_count: number
  compliance_status: 'compliant' | 'non_compliant'
}

interface HandoverDocument {
  id: string
  name: string
  type: string
  status: 'draft' | 'final'
  uploaded_date: string
}

interface ClientSignoff {
  id: string
  stakeholder: string
  role: string
  signed_date?: string
  status: 'pending' | 'signed'
}

interface CompletionCertificate {
  id: string
  issued_date?: string
  issued_by: string
  certificate_number?: string
  valid_until?: string
}

export default function LotCloseoutPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const lotId = params.lotId as string

  const [closeout, setCloseout] = useState<LotCloseout | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCloseoutData = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/lots/${lotId}/closeout`)
      if (response.ok) {
        const data = await response.json()
        setCloseout(data.closeout || null)
      }
    } catch (error) {
      console.error('Error fetching closeout data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, lotId])

  useEffect(() => {
    fetchCloseoutData()
  }, [fetchCloseoutData])

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-muted text-foreground'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getComplianceBadge = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      minor: 'bg-yellow-100 text-yellow-800',
      major: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const canPublish = () => {
    if (!closeout) return false

    const allInspectionsPassed = closeout.inspection_points.every(ip => ip.status === 'passed')
    const allTestsPassed = closeout.test_results.every(tr => tr.result === 'pass')
    const noOpenNCRs = closeout.ncr_items.every(ncr => ncr.status === 'closed')
    const allSignoffsComplete = closeout.client_signoff.every(so => so.status === 'signed')

    return allInspectionsPassed && allTestsPassed && noOpenNCRs && allSignoffsComplete
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!closeout) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Closeout Data Not Found</h2>
          <p className="text-red-600 mb-4">The requested lot closeout data could not be found.</p>
          <Link
            href={`/projects/${projectId}/quality/lots`}
            className="text-primary hover:text-foreground font-medium"
          >
            ← Back to Lots
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${projectId}/quality/lots`}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lot Closeout</h1>
            <p className="text-gray-600">{closeout.lot_name} ({closeout.lot_id})</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(closeout.status)}`}>
            {closeout.status}
          </span>
          {canPublish() && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Publish Closeout
            </button>
          )}
        </div>
      </div>

      {/* Readiness Check */}
      {!canPublish() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">Closeout Not Ready</h3>
              <p className="text-yellow-600 text-sm">Complete all requirements before publishing the closeout package.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quality Documentation */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Quality Documentation
            </h2>

            <div className="space-y-4">
              {/* Inspection Points */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Inspection Points</h3>
                <div className="space-y-2">
                  {closeout.inspection_points.map((ip) => (
                    <div key={ip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{ip.code}: {ip.title}</span>
                        <span className="text-sm text-gray-600 ml-2">by {ip.inspector}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ip.status === 'passed' ? 'bg-green-100 text-green-800' :
                          ip.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ip.status}
                        </span>
                        {ip.completed_date && (
                          <span className="text-xs text-gray-500">{new Date(ip.completed_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Test Results</h3>
                <div className="space-y-2">
                  {closeout.test_results.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{test.test_type}</span>
                        <span className="text-sm text-gray-600 ml-2">by {test.lab_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          test.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.result}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(test.date_completed).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NCR Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Non-Conformance Reports</h3>
                <div className="space-y-2">
                  {closeout.ncr_items.map((ncr) => (
                    <div key={ncr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{ncr.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(ncr.severity)}`}>
                          {ncr.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ncr.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ncr.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HSE Documentation */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              HSE Documentation
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                {closeout.swms_completed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={closeout.swms_completed ? 'text-green-600' : 'text-red-600'}>
                  SWMS Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                {closeout.inductions_completed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={closeout.inductions_completed ? 'text-green-600' : 'text-red-600'}>
                  Inductions Completed
                </span>
              </div>
            </div>

            {/* Safety Walks */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Safety Walks</h3>
              <div className="space-y-2">
                {closeout.safety_walks.map((walk) => (
                  <div key={walk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{new Date(walk.date).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-600 ml-2">by {walk.inspector}</span>
                    </div>
                    <span className="text-sm text-gray-600">{walk.findings.length} findings</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Incidents</h3>
              <div className="space-y-2">
                {closeout.incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{incident.type}</span>
                      <span className="text-sm text-gray-600 ml-2">{new Date(incident.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        incident.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Signoff */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Client Signoff</h2>

            <div className="space-y-3">
              {closeout.client_signoff.map((signoff) => (
                <div key={signoff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{signoff.stakeholder}</span>
                    <span className="text-sm text-gray-600 ml-2">({signoff.role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {signoff.status === 'signed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Signed {new Date(signoff.signed_date!).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Completion Certificate */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Completion Certificate</h3>

            {closeout.completion_certificate.issued_date ? (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Certificate Number:</span>
                  <p className="font-medium">{closeout.completion_certificate.certificate_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Issued Date:</span>
                  <p className="font-medium">{new Date(closeout.completion_certificate.issued_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Valid Until:</span>
                  <p className="font-medium">{new Date(closeout.completion_certificate.valid_until!).toLocaleDateString()}</p>
                </div>
                <button className="w-full mt-3 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Certificate
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Certificate not yet issued</p>
              </div>
            )}
          </div>

          {/* Materials & Mix Designs */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Materials & Mix Designs</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Material Certificates</h4>
                <div className="space-y-1">
                  {closeout.material_certificates.map((cert) => (
                    <div key={cert.id} className="text-xs text-gray-600">
                      {cert.material} - {cert.certificate_number}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Mix Designs</h4>
                <div className="space-y-1">
                  {closeout.mix_designs.map((mix) => (
                    <div key={mix.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{mix.name}</span>
                      <span className={`px-1 py-0.5 text-xs font-medium rounded ${getComplianceBadge(mix.compliance_status)}`}>
                        {mix.compliance_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Handover Documents */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Handover Documents</h3>

            <div className="space-y-2">
              {closeout.handover_documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{doc.name}</span>
                    <span className="text-xs text-gray-600 ml-2">({doc.type})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1 py-0.5 text-xs font-medium rounded ${
                      doc.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                    <button className="text-primary hover:text-foreground">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                <Eye className="w-4 h-4 inline mr-2" />
                Preview Closeout
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                <Download className="w-4 h-4 inline mr-2" />
                Export Package
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                <FileText className="w-4 h-4 inline mr-2" />
                Generate Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

