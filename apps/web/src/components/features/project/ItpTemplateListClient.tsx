'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
  getPaginationRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';

// Define the shape of an ITP Template object passed as a prop
export type ItpTemplate = {
  id: string;
  name: string | null;
  version: string | null;
  status: string | null;
  attachment_count?: number; // Count of attached files
  document_number?: string | null;
};

interface ItpTemplateListClientProps {
  templates: ItpTemplate[];
  projectId: string;
  isClientPortal?: boolean; // Add prop to determine if this is being used in client portal
}

export default function ItpTemplateListClient({
  templates,
  projectId,
  isClientPortal,
}: ItpTemplateListClientProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [submittingTemplateId, setSubmittingTemplateId] = React.useState<string | null>(null);
  const [batchSubmitting, setBatchSubmitting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [filterColumn, setFilterColumn] = React.useState<string>('name');
  const [filterValue, setFilterValue] = React.useState<string>('');

  const handleSubmission = async (template: ItpTemplate) => {
    if (!template.id) return;
    setSubmittingTemplateId(template.id);
    const toastId = toast.loading(`Submitting ${template.name || 'template'} for approval...`);

    try {
      // TODO: Implement submission action for v3
      toast.success('Template submitted successfully!', { id: toastId });
    } catch (error) {
      toast.error('An unexpected error occurred during submission.', { id: toastId });
      console.error("Submission error:", error);
    }
    setSubmittingTemplateId(null);
  };

  const handleBatchSubmission = async () => {
    const selectedTemplates = table.getSelectedRowModel().rows.map(row => row.original);
    const draftTemplates = selectedTemplates.filter(template => template.status === 'Draft');

    if (draftTemplates.length === 0) {
      toast.error('No draft templates selected for submission.');
      return;
    }

    setBatchSubmitting(true);
    const toastId = toast.loading(`Submitting ${draftTemplates.length} templates for approval...`);

    try {
      // TODO: Implement batch submission for v3
      toast.success(`Successfully submitted ${draftTemplates.length} templates for approval!`, { id: toastId });

      // Clear selection after batch submission
      setRowSelection({});
    } catch (error) {
      toast.error('An unexpected error occurred during batch submission.', { id: toastId });
      console.error("Batch submission error:", error);
    }
    setBatchSubmitting(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing export...');

    try {
      // TODO: Implement export action for v3
      toast.success('Export completed successfully!', { id: toastId });
    } catch (error) {
      toast.error('An unexpected error occurred during export.', { id: toastId });
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilterColumn(column);
    setFilterValue(value);

    // Clear all current filters
    setColumnFilters([]);

    // Set new filter if value is not empty
    if (value) {
      setColumnFilters([{ id: column, value }]);
    }
  };

  const columns: ColumnDef<ItpTemplate>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 50,
        minSize: 50,
        maxSize: 50,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              ITP Template
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <Link
            href={isClientPortal ? `/portal/${projectId}/quality/itp-templates-register/${row.original.id}` : `/projects/${projectId}/quality/itp-templates-register/${row.original.id}`}
            className="block hover:underline cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {row.getValue('name') || 'Unnamed Template'}
          </Link>
        ),
        enableResizing: true,
        enableSorting: true,
        size: 300,
        minSize: 150,
      },
      {
        accessorKey: 'document_number',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              ITP Number
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
        <Link
            href={isClientPortal ? `/portal/${projectId}/quality/itp-templates-register/${row.original.id}` : `/projects/${projectId}/quality/itp-templates-register/${row.original.id}`}
            className="block hover:underline cursor-pointer text-gray-600 hover:text-gray-800 font-mono text-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {row.original.document_number || `${row.original.id.substring(0, 8)}...`}
          </Link>
        ),
        enableResizing: true,
        enableSorting: true,
        size: 200,
        minSize: 120,
      },
      {
        accessorKey: 'version',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Revision
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <span>{row.getValue('version') || 'A'}</span>
        ),
        enableResizing: true,
        enableSorting: true,
        size: 150,
        minSize: 100,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Status
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <span className="text-sm text-gray-700">
              {status || 'Unknown'}
            </span>
          );
        },
        enableResizing: true,
        enableSorting: true,
        size: 200,
        minSize: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const template = row.original;
          const isSubmittingThis = submittingTemplateId === template.id;
          return (
            <div className="flex space-x-1">
              {/* No actions needed since clicking name/number already links to details */}
            </div>
          );
        },
        enableResizing: true,
        enableSorting: false,
        size: 150,
        minSize: 100,
      },
    ],
    [projectId, submittingTemplateId, isClientPortal]
  );

  const table = useReactTable({
    data: templates,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedDraftTemplates = selectedRows.filter(row => row.original.status === 'Draft');

  // Filter options for the dropdown
  const filterOptions = [
    { value: 'name', label: 'ITP Name' },
    { value: 'id', label: 'ITP Number' },
    { value: 'version', label: 'Revision' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <div className="w-full">
      {/* Enhanced filter and search controls */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterColumn}
              onValueChange={(value) => {
                setFilterColumn(value);
                setFilterValue('');
                setColumnFilters([]);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filterColumn === 'status' ? (
            <Select
              value={filterValue || 'all'}
              onValueChange={(value) => handleFilterChange(filterColumn, value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="superseded">Superseded</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={`Filter by ${filterOptions.find(opt => opt.value === filterColumn)?.label}...`}
              value={filterValue}
              onChange={(event) => handleFilterChange(filterColumn, event.target.value)}
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' :
              selectedRows.length > 0 ? `Export ${selectedRows.length} Selected` : 'Export All'
            }
          </Button>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div className="mb-4 p-2 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            {selectedRows.length} template(s) selected
            {selectedDraftTemplates.length > 0 &&
              ` (${selectedDraftTemplates.length} draft template(s) can be submitted)`
            }
          </p>
        </div>
      )}

      {/* Full-width responsive table */}
      <div className="w-full rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="relative"
                      style={{
                        width: `${(header.getSize() / table.getTotalSize()) * 100}%`,
                        minWidth: header.column.columnDef.minSize || 50,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize hover:bg-gray-500 opacity-0 hover:opacity-100 transition-opacity"
                          style={{
                            userSelect: 'none',
                            touchAction: 'none',
                          }}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: `${(cell.column.getSize() / table.getTotalSize()) * 100}%`,
                          minWidth: cell.column.columnDef.minSize || 50,
                        }}
                      >
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
                    No ITP templates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced pagination with page numbers */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Button
                key={i}
                variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(i)}
                className="w-8 h-8"
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </div>
      </div>
    </div>
  );
}
