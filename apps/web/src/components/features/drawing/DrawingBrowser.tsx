'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Eye, Download, Link, History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { toast } from 'sonner'

interface Drawing {
  id: string
  asset_uid: string
  version: number
  is_current: boolean
  supersedes_asset_id?: string
  name: string
  subtype?: string
  document_number?: string
  revision_code?: string
  status: string
  approval_state: string
  created_at: string
  updated_at: string
  content?: any
  metadata?: any
}

interface DrawingBrowserProps {
  projectId: string
}

// Drawing subtypes for categorization
const DRAWING_TYPES = [
  'General Arrangement',
  'Section',
  'Elevation',
  'Detail',
  'Plan',
  'Schedule',
  'Diagram',
  'Layout'
]

// Helper function to get drawing subtype from content/metadata
function getDrawingSubtype(drawing: Drawing): string {
  try {
    // Check metadata first
    if (drawing.metadata?.subtype) {
      return drawing.metadata.subtype
    }

    // Check content for subtype
    if (drawing.content?.subtype) {
      return drawing.content.subtype
    }

    // Default to general arrangement if no subtype
    return drawing.subtype || 'General Arrangement'
  } catch (error) {
    console.warn('Error extracting drawing subtype:', error)
    return 'General Arrangement'
  }
}

// Helper function to get drawing revision from revision_code or metadata
function getDrawingRevision(drawing: Drawing): string {
  try {
    // Use revision_code from assets table if available
    if (drawing.revision_code) {
      return drawing.revision_code
    }

    // Check metadata for revision
    if (drawing.metadata?.revision) {
      return drawing.metadata.revision
    }

    // Check content for revision
    if (drawing.content?.revision) {
      return drawing.content.revision
    }

    // Default to A for first revision
    return 'A'
  } catch (error) {
    console.warn('Error extracting drawing revision:', error)
    return 'A'
  }
}

// Helper function to get drawing number
function getDrawingNumber(drawing: Drawing): string {
  try {
    // Use document_number from assets table if available
    if (drawing.document_number) {
      return drawing.document_number
    }

    // Check metadata for document number
    if (drawing.metadata?.document_number) {
      return drawing.metadata.document_number
    }

    // Check content for document number
    if (drawing.content?.document_number) {
      return drawing.content.document_number
    }

    return '-'
  } catch (error) {
    console.warn('Error extracting drawing number:', error)
    return '-'
  }
}

// Helper function to check if drawing has previous revisions
function hasPreviousRevisions(drawing: Drawing, allDrawings: Drawing[]): boolean {
  if (!drawing.document_number) return false

  return allDrawings.some(d =>
    d.document_number === drawing.document_number &&
    d.asset_uid === drawing.asset_uid &&
    d.version < drawing.version
  )
}

// Helper function to get previous revision drawings
function getPreviousRevisions(drawing: Drawing, allDrawings: Drawing[]): Drawing[] {
  if (!drawing.document_number) return []

  return allDrawings.filter(d =>
    d.document_number === drawing.document_number &&
    d.asset_uid === drawing.asset_uid &&
    d.version < drawing.version
  ).sort((a, b) => b.version - a.version) // Most recent first
}

// Helper function to get all revisions of a drawing (including current)
function getAllRevisions(drawing: Drawing, allDrawings: Drawing[]): Drawing[] {
  if (!drawing.document_number) return [drawing]

  return allDrawings.filter(d =>
    d.document_number === drawing.document_number &&
    d.asset_uid === drawing.asset_uid
  ).sort((a, b) => b.version - a.version) // Most recent first
}

// Define columns for TanStack Table
const columns: ColumnDef<Drawing>[] = [
  {
    accessorKey: "name",
    header: "Drawing Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "document_number",
    header: "Drawing Number",
    cell: ({ row }) => <div>{getDrawingNumber(row.original)}</div>,
  },
  {
    accessorKey: "subtype",
    header: "Type",
    cell: ({ row }) => <div>{getDrawingSubtype(row.original)}</div>,
  },
  {
    accessorKey: "revision_code",
    header: "Revision",
    cell: ({ row }) => <div>{getDrawingRevision(row.original)}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'approved' ? 'default' : status === 'in_review' ? 'secondary' : 'outline'}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "approval_state",
    header: "Approval",
    cell: ({ row }) => {
      const approvalState = row.getValue("approval_state") as string
      return (
        <Badge variant={
          approvalState === 'approved' ? 'default' :
          approvalState === 'rejected' ? 'destructive' :
          approvalState === 'pending_review' ? 'secondary' : 'outline'
        }>
          {approvalState.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Upload Date",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      if (!date) return <div>N/A</div>
      return <div>{new Date(date).toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const drawing = row.original
      const allDrawings = (table.options.data as Drawing[]) || []
      const hasPrevious = hasPreviousRevisions(drawing, allDrawings)
      const allRevisions = getAllRevisions(drawing, allDrawings)

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement view drawing
              toast.info('View drawing functionality coming soon')
            }}
            title="View"
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement download drawing
              toast.info('Download drawing functionality coming soon')
            }}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>

          {drawing.document_number && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  title="View All Revisions"
                  aria-label="View All Revisions"
                >
                  <History className="h-4 w-4" />
                  {allRevisions.length > 1 && (
                    <span className="ml-1 text-xs bg-muted text-foreground px-1 rounded">
                      {allRevisions.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>All Revisions - {getDrawingNumber(drawing)}</DialogTitle>
                  <DialogDescription>
                    Complete revision history for this drawing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {allRevisions.map((revisionDrawing, index) => (
                    <Card key={revisionDrawing.id} className={index === 0 ? 'border-border bg-muted' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{revisionDrawing.name}</h4>
                              {index === 0 && (
                                <Badge variant="default" className="text-xs">Latest</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Revision {getDrawingRevision(revisionDrawing)} • Version {revisionDrawing.version}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(revisionDrawing.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {revisionDrawing.status} • Approval: {revisionDrawing.approval_state.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement view revision
                                toast.info('View revision functionality coming soon')
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement download revision
                                toast.info('Download revision functionality coming soon')
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )
    },
  },
]

export default function DrawingBrowser({ projectId }: DrawingBrowserProps) {
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState<string>("All")

  const fetchDrawings = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/assets?projectId=${projectId}&type=drawing`)
      if (response.ok) {
        const data = await response.json()
        setDrawings(data.assets || [])
      } else {
        console.error('Failed to fetch drawings:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching drawings:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDrawings()
  }, [fetchDrawings])


  // Group drawings by type
  const drawingsByType = useMemo(() => {
    const grouped: Record<string, Drawing[]> = { All: drawings }

    DRAWING_TYPES.forEach(type => {
      grouped[type] = drawings.filter(drawing =>
        getDrawingSubtype(drawing) === type
      )
    })

    return grouped
  }, [drawings])

  const currentDrawings = useMemo(() => drawingsByType[activeTab] || [], [drawingsByType, activeTab])

  const table = useReactTable({
    data: currentDrawings,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {drawings.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search drawings..."
              className="max-w-sm"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              {drawings.length} drawing{drawings.length !== 1 ? 's' : ''}
            </div>
          </div>

          <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="All">
                All ({drawings.length})
              </TabsTrigger>
              {DRAWING_TYPES.slice(0, 4).map(type => (
                <TabsTrigger key={type} value={type}>
                  {type} ({drawingsByType[type]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="All" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Drawings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No drawings found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {DRAWING_TYPES.map(type => (
              <TabsContent key={type} value={type} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{type} Drawings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drawing Name</TableHead>
                          <TableHead>Drawing Number</TableHead>
                          <TableHead>Revision</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Approval</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drawingsByType[type]?.length ? (
                          drawingsByType[type].map((drawing) => (
                            <TableRow key={drawing.id}>
                              <TableCell className="font-medium">{drawing.name}</TableCell>
                              <TableCell>{getDrawingNumber(drawing)}</TableCell>
                              <TableCell>{getDrawingRevision(drawing)}</TableCell>
                              <TableCell>
                                <Badge variant={drawing.status === 'approved' ? 'default' : 'outline'}>
                                  {drawing.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  drawing.approval_state === 'approved' ? 'default' :
                                  drawing.approval_state === 'rejected' ? 'destructive' :
                                  drawing.approval_state === 'pending_review' ? 'secondary' : 'outline'
                                }>
                                  {drawing.approval_state.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(drawing.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast.info('View drawing functionality coming soon')
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast.info('Download drawing functionality coming soon')
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {hasPreviousRevisions(drawing, drawings) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        toast.info('Revision history functionality coming soon')
                                      }}
                                    >
                                      <History className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-24 text-center"
                            >
                              No {type.toLowerCase()} drawings found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drawings yet</h3>
          <p className="text-gray-500 mb-6">Upload your first project drawing to get started.</p>
        </div>
      )}
    </div>
  )
}
