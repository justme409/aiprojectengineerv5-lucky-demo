"use client";
import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, CheckCircle2 } from 'lucide-react'
import RevisionSelector from '@/components/features/itp/RevisionSelector'
import RevisionComparison from '@/components/features/itp/RevisionComparison'
import { toast } from 'sonner'
import ItpTemplateEditorEnhanced from '@/components/features/itp/ItpTemplateEditorEnhanced'

interface ItpTemplateDetailClientProps {
  template: any
  projectId: string
  templateId: string
  projectName: string
  lot?: any
  lotId?: string
  isClientPortal?: boolean
}

export default function ItpTemplateDetailClient({
  template,
  projectId,
  templateId,
  projectName,
  lot,
  lotId,
  isClientPortal = false
}: ItpTemplateDetailClientProps) {
  const actualTemplateId = templateId
  const [templateData, setTemplateData] = React.useState(template)
  const [currentRevision, setCurrentRevision] = React.useState<string>((template?.content?.revision || template?.version) || 'A')
  const [comparisonOpen, setComparisonOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

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

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <div className="px-8 py-6 border-b dark:border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-24 h-12 bg-[#1e3a8a] dark:bg-primary flex items-center justify-center text-white font-bold text-xs">
              AI PROJECT<br/>ENGINEER
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-primary text-2xl font-semibold mb-1">Inspection & Test Procedure</h1>
            <div className="text-muted-foreground">{templateData.name || 'Untitled Template'}</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-3 bg-muted/50 dark:bg-muted border-b dark:border-border">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg">ITP: {templateData.name || 'Untitled Template'}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={templateData.status === 'approved' ? 'default' : templateData.status === 'pending_client_approval' ? 'secondary' : 'outline'}>
                  {templateData.status || 'draft'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RevisionSelector
                templateId={actualTemplateId}
                currentRevision={currentRevision}
                onRevisionChange={(r) => setCurrentRevision(r)}
                onCompareRevisions={() => setComparisonOpen(true)}
                disabled={submitting}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2" disabled={exporting}>
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-background rounded-lg shadow-sm border w-full">
          {templateData?.content && (
            <div className="overflow-x-auto">
              <ItpTemplateEditorEnhanced
                templateData={{
                  ...templateData,
                  // Pass through original content so the editor can read either `itp_items` or `items`
                  content: templateData.content as any,
                }}
                projectId={projectId}
                templateId={actualTemplateId}
                disabled={false}
                onDataChange={(hasChanges) => setHasUnsavedChanges(hasChanges)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-4 border-t bg-muted/50 dark:bg-muted dark:border-border">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Page 1 of 1</div>
          <div>{template.name || 'Untitled Template'}</div>
        </div>
      </div>

      <RevisionComparison templateId={actualTemplateId} isOpen={comparisonOpen} onClose={() => setComparisonOpen(false)} />
    </div>
  )
}
