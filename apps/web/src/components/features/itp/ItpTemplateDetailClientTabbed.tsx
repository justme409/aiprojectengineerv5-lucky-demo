"use client";
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, CheckCircle2, Upload, Send, X, Unlock, Bell, PlayCircle } from 'lucide-react'
import RevisionSelector from '@/components/features/itp/RevisionSelector'
import RevisionComparison from '@/components/features/itp/RevisionComparison'
import { EmbeddedTableRenderer, parseInlineTable } from '@/components/features/itp/EmbeddedTableRenderer'
import { EmbeddedFigureRenderer } from '@/components/features/itp/EmbeddedFigureRenderer'
import { SectionLinkRenderer, parseSectionLinks } from '@/components/features/itp/SectionLinkRenderer'
import { toast } from 'sonner'

/**
 * Digital Workflow ITP Detail Component
 * 
 * Single-page ITP view with inline approval workflow.
 * Users can:
 * - Mark items as checked (based on their role)
 * - Upload attachments (test results, certificates)
 * - Approve items (based on their role)
 * - Uncheck/unapprove items
 * - Release hold points
 * - Acknowledge witness points
 * - Submit for client approval
 */

interface ItpTemplateDetailClientTabbedProps {
  template: any
  projectId: string
  templateId: string
  projectName: string
  lot?: any
  lotId?: string
  isClientPortal?: boolean
  userRole?: 'subcontractor' | 'site_engineer' | 'qa_manager' | 'client' | 'superintendent'
}

interface InspectionPointApproval {
  subcontractorChecked?: boolean
  subcontractorDate?: string
  engineerChecked?: boolean
  engineerDate?: string
  qaApproved?: boolean
  qaDate?: string
  attachmentCount?: number
  // Hold point workflow
  holdPointRequested?: boolean
  holdPointRequestedDate?: string
  holdPointReleased?: boolean
  holdPointReleaseDate?: string
  // Witness point workflow
  witnessPointRequested?: boolean
  witnessPointRequestedDate?: string
  witnessPointNotified?: boolean
  witnessPointNotifiedDate?: string
}

export default function ItpTemplateDetailClientTabbed({
  template,
  projectId,
  templateId,
  projectName,
  lot,
  lotId,
  isClientPortal = false,
  userRole = 'site_engineer',
}: ItpTemplateDetailClientTabbedProps) {
  const [templateData, setTemplateData] = React.useState(template)
  const [currentRevision, setCurrentRevision] = React.useState<string>((template?.content?.revision || template?.version) || 'A')
  const [comparisonOpen, setComparisonOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)

  // Track approvals for each inspection point
  const [approvals, setApprovals] = React.useState<Record<string, InspectionPointApproval>>({})

  if (!templateData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Template Not Found</h3>
            <p className="text-muted-foreground">The requested ITP template could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const inspectionPoints = templateData?.content?.items || []

  // Handle checking an item
  const handleCheck = async (pointId: string, role: 'subcontractor' | 'engineer') => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        ...(role === 'subcontractor'
          ? { subcontractorChecked: true, subcontractorDate: now }
          : { engineerChecked: true, engineerDate: now }
        )
      }
    }))
    toast.success('Item marked as checked')
  }

  // Handle unchecking an item
  const handleUncheck = async (pointId: string, role: 'subcontractor' | 'engineer') => {
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        ...(role === 'subcontractor'
          ? { subcontractorChecked: false, subcontractorDate: undefined }
          : { engineerChecked: false, engineerDate: undefined }
        )
      }
    }))
    toast.success('Item unchecked')
  }

  // Handle QA approval
  const handleApprove = async (pointId: string) => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        qaApproved: true,
        qaDate: now
      }
    }))
    toast.success('Item approved')
  }

  // Handle QA unapprove
  const handleUnapprove = async (pointId: string) => {
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        qaApproved: false,
        qaDate: undefined
      }
    }))
    toast.success('Approval removed')
  }

  // Handle requesting a hold point inspection
  const handleRequestHoldPoint = async (pointId: string) => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        holdPointRequested: true,
        holdPointRequestedDate: now
      }
    }))
    toast.success('Hold point inspection requested')
  }

  // Handle cancelling a hold point request
  const handleCancelHoldPointRequest = async (pointId: string) => {
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        holdPointRequested: false,
        holdPointRequestedDate: undefined
      }
    }))
    toast.success('Hold point request cancelled')
  }

  // Handle hold point release
  const handleReleaseHoldPoint = async (pointId: string) => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        holdPointReleased: true,
        holdPointReleaseDate: now
      }
    }))
    toast.success('Hold point released')
  }

  // Handle requesting a witness point inspection
  const handleRequestWitnessPoint = async (pointId: string) => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        witnessPointRequested: true,
        witnessPointRequestedDate: now
      }
    }))
    toast.success('Witness point inspection requested')
  }

  // Handle cancelling a witness point request
  const handleCancelWitnessPointRequest = async (pointId: string) => {
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        witnessPointRequested: false,
        witnessPointRequestedDate: undefined
      }
    }))
    toast.success('Witness point request cancelled')
  }

  // Handle witness point notification
  const handleNotifyWitnessPoint = async (pointId: string) => {
    const now = new Date().toISOString().split('T')[0]
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        witnessPointNotified: true,
        witnessPointNotifiedDate: now
      }
    }))
    toast.success('Witness point notification sent')
  }

  // Handle file upload
  const handleUpload = async (pointId: string) => {
    setApprovals(prev => ({
      ...prev,
      [pointId]: {
        ...prev[pointId],
        attachmentCount: (prev[pointId]?.attachmentCount || 0) + 1
      }
    }))
    toast.success('Attachment uploaded')
  }

  // Submit for client approval
  const handleSubmitForApproval = async () => {
    setSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Submitted for client approval')
    } catch (error) {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const canCheck = userRole === 'subcontractor' || userRole === 'site_engineer'
  const canApprove = userRole === 'qa_manager' || userRole === 'superintendent'
  const canReleaseHoldPoint = userRole === 'qa_manager' || userRole === 'superintendent' || userRole === 'client'
  const canSubmitForApproval = userRole === 'qa_manager'

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b dark:border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-24 h-12 bg-[#1e3a8a] dark:bg-primary flex items-center justify-center text-white font-bold text-xs">
              AI PROJECT<br />ENGINEER
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-primary text-2xl font-semibold mb-1">Inspection & Test Plan</h1>
            <div className="text-muted-foreground">{templateData.name || 'Untitled Template'}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 bg-muted/50 dark:bg-muted border-b dark:border-border">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg">ITP: {templateData.name || 'Untitled Template'}</h2>
              <Badge variant={templateData.status === 'approved' ? 'default' : templateData.status === 'pending_client_approval' ? 'secondary' : 'outline'}>
                {templateData.status || 'draft'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Role: {userRole.replace('_', ' ')}
              </Badge>
            </div>
            <RevisionSelector
              templateId={templateId}
              currentRevision={currentRevision}
              onRevisionChange={(r) => setCurrentRevision(r)}
              onCompareRevisions={() => setComparisonOpen(true)}
              disabled={submitting}
              hasUnsavedChanges={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2" disabled={exporting}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {canSubmitForApproval && (
              <Button
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleSubmitForApproval}
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit for Client Approval'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ITP Table */}
      <div className="flex-1 overflow-x-auto p-8">
        <div className="bg-background rounded-lg shadow-sm border overflow-hidden min-w-[1400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e3a8a] text-white text-xs">
                <th className="px-2 py-3 text-left w-12">#</th>
                <th className="px-2 py-3 text-left w-48">Description</th>
                <th className="px-2 py-3 text-left w-64">Acceptance Criteria</th>
                <th className="px-2 py-3 text-left w-32">Spec/Clause</th>
                <th className="px-2 py-3 text-left w-28">Test Method</th>
                <th className="px-2 py-3 text-left w-24">Frequency</th>
                <th className="px-2 py-3 text-left w-28">Responsibility</th>
                <th className="px-2 py-3 text-center w-16">H/W</th>
                <th className="px-2 py-3 text-center w-20">Sub</th>
                <th className="px-2 py-3 text-center w-20">Eng</th>
                <th className="px-2 py-3 text-center w-20">QA</th>
                <th className="px-2 py-3 text-center w-16">Files</th>
                <th className="px-2 py-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspectionPoints.map((point: any, index: number) => {
                const pointId = point.id || `point-${index}`
                const approval = approvals[pointId] || {}
                const isSection = point.isSection || point.type === 'section'
                const isHoldPoint = point.isHoldPoint
                const isWitnessPoint = point.isWitnessPoint

                if (isSection) {
                  return (
                    <tr key={pointId} className="bg-gray-100 border-b">
                      <td colSpan={13} className="px-2 py-2 font-semibold text-gray-700 text-sm">
                        {point.itemNumber || point.sequence}. {point.description || point.section}
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={pointId}
                    className={`border-b transition-colors text-xs ${index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                  >
                    {/* Item Number */}
                    <td className="px-2 py-2 align-top font-medium">
                      {point.itemNumber || point.sequence}
                    </td>

                    {/* Description */}
                    <td className="px-2 py-2 align-top">
                      <div className="font-medium">{point.description}</div>
                      {point.notes && (
                        <div className="text-gray-500 mt-1 text-xs italic">{point.notes}</div>
                      )}
                    </td>

                    {/* Acceptance Criteria */}
                    <td className="px-2 py-2 align-top">
                      <div className="max-w-md">
                        {/* Main acceptance criteria text */}
                        <div className="whitespace-pre-wrap">
                          {(() => {
                            const text = point.acceptanceCriteria || '-';
                            // Try to parse inline tables from text
                            const parsed = parseInlineTable(text);
                            return parsed ? parsed.text : text;
                          })()}
                        </div>

                        {/* Embedded tables from JSON string (Neo4j stores as string) */}
                        {point.embeddedTablesJson && (() => {
                          try {
                            const tables = JSON.parse(point.embeddedTablesJson);
                            return tables && tables.length > 0 ? <EmbeddedTableRenderer tables={tables} /> : null;
                          } catch {
                            return null;
                          }
                        })()}

                        {/* Fallback: Embedded tables from array (for backward compatibility) */}
                        {!point.embeddedTablesJson && point.embeddedTables && point.embeddedTables.length > 0 && (
                          <EmbeddedTableRenderer tables={point.embeddedTables} />
                        )}

                        {/* Parse inline tables from text if no structured tables */}
                        {!point.embeddedTablesJson && (!point.embeddedTables || point.embeddedTables.length === 0) && point.acceptanceCriteria && (() => {
                          const parsed = parseInlineTable(point.acceptanceCriteria);
                          return parsed?.tables ? <EmbeddedTableRenderer tables={parsed.tables} /> : null;
                        })()}

                        {/* Embedded figures from JSON string (MinIO URLs) */}
                        {point.embeddedFiguresJson && (() => {
                          try {
                            const figures = JSON.parse(point.embeddedFiguresJson);
                            return figures && figures.length > 0 ? <EmbeddedFigureRenderer figures={figures} /> : null;
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </td>

                    {/* Spec/Clause */}
                    <td className="px-2 py-2 align-top">
                      <div className="text-gray-900">{point.requirement || '-'}</div>
                      {/* Section links - clickable references to source content */}
                      {point.sectionLinksJson && (() => {
                        const links = parseSectionLinks(point.sectionLinksJson);
                        return links.length > 0 ? (
                          <div className="mt-1">
                            <SectionLinkRenderer links={links} />
                          </div>
                        ) : null;
                      })()}
                      {/* Fallback: show standardsRef as plain text if no section links */}
                      {!point.sectionLinksJson && point.standardsRef && point.standardsRef.length > 0 && (
                        <div className="text-gray-500 mt-1 text-[10px]">
                          {point.standardsRef.slice(0, 2).join(', ')}
                          {point.standardsRef.length > 2 && '...'}
                        </div>
                      )}
                    </td>

                    {/* Test Method */}
                    <td className="px-2 py-2 align-top">
                      {point.testMethod || '-'}
                    </td>

                    {/* Frequency */}
                    <td className="px-2 py-2 align-top">
                      {point.testFrequency || '-'}
                    </td>

                    {/* Responsibility */}
                    <td className="px-2 py-2 align-top">
                      {point.responsibleParty || '-'}
                    </td>

                    {/* Hold/Witness Point */}
                    <td className="px-2 py-2 align-top text-center">
                      {isHoldPoint && (
                        <Badge variant="outline" className="text-xs border-gray-400">
                          H
                        </Badge>
                      )}
                      {isWitnessPoint && (
                        <Badge variant="outline" className="text-xs border-gray-400">
                          W
                        </Badge>
                      )}
                      {!isHoldPoint && !isWitnessPoint && '-'}
                    </td>

                    {/* Subcontractor Check */}
                    <td className="px-2 py-2 align-top text-center">
                      {approval.subcontractorChecked ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-[10px] text-gray-500">{approval.subcontractorDate}</span>
                          {userRole === 'subcontractor' && (
                            <button
                              onClick={() => handleUncheck(pointId, 'subcontractor')}
                              className="text-gray-400 hover:text-red-500"
                              title="Uncheck"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <Checkbox
                          disabled={userRole !== 'subcontractor'}
                          className="border-gray-400"
                          onCheckedChange={() => userRole === 'subcontractor' && handleCheck(pointId, 'subcontractor')}
                        />
                      )}
                    </td>

                    {/* Engineer Check */}
                    <td className="px-2 py-2 align-top text-center">
                      {approval.engineerChecked ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-[10px] text-gray-500">{approval.engineerDate}</span>
                          {userRole === 'site_engineer' && (
                            <button
                              onClick={() => handleUncheck(pointId, 'engineer')}
                              className="text-gray-400 hover:text-red-500"
                              title="Uncheck"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <Checkbox
                          disabled={userRole !== 'site_engineer'}
                          className="border-gray-400"
                          onCheckedChange={() => userRole === 'site_engineer' && handleCheck(pointId, 'engineer')}
                        />
                      )}
                    </td>

                    {/* QA Approve */}
                    <td className="px-2 py-2 align-top text-center">
                      {approval.qaApproved ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-[10px] text-gray-500">{approval.qaDate}</span>
                          {canApprove && (
                            <button
                              onClick={() => handleUnapprove(pointId)}
                              className="text-gray-400 hover:text-red-500"
                              title="Remove approval"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : canApprove ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleApprove(pointId)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Attachments */}
                    <td className="px-2 py-2 align-top text-center">
                      <button
                        onClick={() => handleUpload(pointId)}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600"
                        title="Upload attachment"
                      >
                        <Upload className="h-3 w-3" />
                        <span>{approval.attachmentCount || 0}</span>
                      </button>
                    </td>

                    {/* Actions - Hold/Witness Point Workflow */}
                    <td className="px-2 py-2 align-top text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {isHoldPoint && (
                          approval.holdPointReleased ? (
                            // Released state
                            <div className="flex flex-col items-center">
                              <Badge variant="outline" className="text-[10px] bg-green-50 border-green-300 text-green-700">
                                Released
                              </Badge>
                              <span className="text-[9px] text-gray-500">{approval.holdPointReleaseDate}</span>
                            </div>
                          ) : approval.holdPointRequested ? (
                            // Requested - waiting for release
                            canReleaseHoldPoint ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-300 text-slate-700">
                                  Requested
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-5 text-[10px] px-2 gap-1"
                                    onClick={() => handleReleaseHoldPoint(pointId)}
                                  >
                                    <Unlock className="h-3 w-3" />
                                    Release
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 text-[10px] px-1 text-gray-400 hover:text-gray-600"
                                    onClick={() => handleCancelHoldPointRequest(pointId)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-300 text-slate-700">
                                  Requested
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-500">{approval.holdPointRequestedDate}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                    onClick={() => handleCancelHoldPointRequest(pointId)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          ) : (
                            // Not yet requested - show Request button
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 gap-1"
                              onClick={() => handleRequestHoldPoint(pointId)}
                            >
                              <PlayCircle className="h-3 w-3" />
                              Request
                            </Button>
                          )
                        )}
                        {isWitnessPoint && (
                          approval.witnessPointNotified ? (
                            // Notified state
                            <div className="flex flex-col items-center">
                              <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-300 text-blue-700">
                                Notified
                              </Badge>
                              <span className="text-[9px] text-gray-500">{approval.witnessPointNotifiedDate}</span>
                            </div>
                          ) : approval.witnessPointRequested ? (
                            // Requested - can notify
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-300 text-slate-700">
                                Requested
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-5 text-[10px] px-2 gap-1"
                                  onClick={() => handleNotifyWitnessPoint(pointId)}
                                >
                                  <Bell className="h-3 w-3" />
                                  Notify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[10px] px-1 text-gray-400 hover:text-gray-600"
                                  onClick={() => handleCancelWitnessPointRequest(pointId)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Not yet requested - show Request button
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 gap-1"
                              onClick={() => handleRequestWitnessPoint(pointId)}
                            >
                              <PlayCircle className="h-3 w-3" />
                              Request
                            </Button>
                          )
                        )}
                        {!isHoldPoint && !isWitnessPoint && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-gray-400">H</Badge>
                <span>Hold Point</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-gray-400">W</Badge>
                <span>Witness Point</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-gray-500" />
                <span>Upload Attachment</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {inspectionPoints.filter((p: any) => !p.isSection && !p.type?.includes('section')).length} inspection points
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t bg-muted/50 dark:bg-muted dark:border-border">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Rev: {currentRevision}</div>
          <div>{templateData.name || 'Untitled Template'}</div>
        </div>
      </div>

      <RevisionComparison templateId={templateId} isOpen={comparisonOpen} onClose={() => setComparisonOpen(false)} />
    </div>
  )
}
