'use client'

import { useState, useEffect } from 'react'
import { FileText, Eye, Edit, Download, Plus, Search, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QseDocument {
  id: string
  title: string
  type: string
  category: string
  status: 'draft' | 'approved' | 'pending_review'
  createdAt: string
  updatedAt: string
  createdBy: string
  approvedBy?: string
  metadata: Record<string, any>
}

export default function CorpPolicyRolesPage() {
  const [documents, setDocuments] = useState<QseDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<QseDocument | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/v1/qse?category=policy_roles')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching QSE documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      approved: 'default',
      pending_review: 'destructive',
    } as const

    const labels = {
      draft: 'Draft',
      approved: 'Approved',
      pending_review: 'Pending Review',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const renderDocumentContent = (document: QseDocument) => {
    const content = document.metadata?.content

    if (!content) {
      return <p>No content available.</p>
    }

    switch (document.type) {
      case 'policy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{content.title || document.title}</h2>
              {content.purpose && (
                <p className="text-gray-600 italic mb-4">{content.purpose}</p>
              )}
            </div>

            {content.scope && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Scope</h3>
                <p>{content.scope}</p>
              </div>
            )}

            {content.objectives && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Objectives</h3>
                <ul className="list-disc pl-5">
                  {Array.isArray(content.objectives)
                    ? content.objectives.map((obj: string, index: number) => (
                        <li key={index}>{obj}</li>
                      ))
                    : <li>{content.objectives}</li>
                  }
                </ul>
              </div>
            )}

            {content.responsibilities && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                <p>{content.responsibilities}</p>
              </div>
            )}

            {content.procedures && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Procedures</h3>
                <p>{content.procedures}</p>
              </div>
            )}
          </div>
        )

      case 'procedure':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{content.title || document.title}</h2>
              {content.purpose && (
                <p className="text-gray-600 italic mb-4">{content.purpose}</p>
              )}
            </div>

            {content.scope && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Scope</h3>
                <p>{content.scope}</p>
              </div>
            )}

            {content.steps && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Procedure Steps</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {Array.isArray(content.steps)
                    ? content.steps.map((step: any, index: number) => (
                        <li key={index}>
                          {typeof step === 'string' ? step : (
                            <div>
                              <div className="font-medium">{step.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                            </div>
                          )}
                        </li>
                      ))
                    : <li>{content.steps}</li>
                  }
                </ol>
              </div>
            )}

            {content.records && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Records</h3>
                <p>{content.records}</p>
              </div>
            )}
          </div>
        )

      case 'form':
      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{content.title || document.title}</h2>
              {content.description && (
                <p className="text-gray-600 italic mb-4">{content.description}</p>
              )}
            </div>

            {content.fields && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Form Fields</h3>
                <div className="space-y-3">
                  {Array.isArray(content.fields)
                    ? content.fields.map((field: any, index: number) => (
                        <div key={index} className="border rounded p-3">
                          <div className="font-medium">{field.label || field.name}</div>
                          <div className="text-sm text-gray-600">
                            Type: {field.type || 'text'}
                            {field.required && <span className="text-red-500 ml-2">*</span>}
                          </div>
                          {field.description && (
                            <div className="text-sm text-gray-500 mt-1">{field.description}</div>
                          )}
                        </div>
                      ))
                    : <p>{content.fields}</p>
                  }
                </div>
              </div>
            )}

            {content.instructions && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <p>{content.instructions}</p>
              </div>
            )}
          </div>
        )

      default:
        // Fallback to raw content display
        if (typeof content === 'string') {
          return <p>{content}</p>
        } else if (typeof content === 'object') {
          return <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
        } else {
          return <p>{String(content)}</p>
        }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Corporate Policy & Roles</h1>
          <p className="text-gray-600 mt-2">QSE Policy Statements and Roles Matrix</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Document
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                  <CardDescription className="mt-1 capitalize">{doc.type}</CardDescription>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>

                {doc.approvedBy && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Approved by: {doc.approvedBy}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No documents found' : 'No policy documents yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first policy document to get started'
            }
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Policy
            </Button>
          )}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDocument.title}</h2>
                  <p className="text-gray-600 capitalize">{selectedDocument.type}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedDocument.status)}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDocument(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                {selectedDocument.metadata?.content ? (
                  <div className="whitespace-pre-wrap text-gray-700">
                    {renderDocumentContent(selectedDocument)}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>No content available for this document.</p>
                    <p className="text-sm">Content may be stored externally or not yet uploaded.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedDocument.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Last Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedDocument.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Created By:</span>
                    <span className="ml-2 text-gray-600">{selectedDocument.createdBy}</span>
                  </div>
                  {selectedDocument.approvedBy && (
                    <div>
                      <span className="font-medium text-gray-900">Approved By:</span>
                      <span className="ml-2 text-gray-600">{selectedDocument.approvedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
