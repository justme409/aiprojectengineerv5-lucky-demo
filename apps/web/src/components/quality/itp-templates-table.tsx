'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ITPTemplateNode } from '@/schemas/neo4j';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ITPTemplatesTableProps {
  templates: ITPTemplateNode[];
  projectId: string;
}

type TemplateRow = ITPTemplateNode & {
  summary: string;
};

function buildDisplayFields(template: ITPTemplateNode): Pick<TemplateRow, 'summary'> {
  const trimmedScope = template.scopeOfWork?.trim();
  const trimmedDescription = template.description?.trim();
  const fallback = template.specRef?.trim() || template.docNo?.trim() || 'Untitled template';

  const rawSummary = trimmedScope || trimmedDescription || fallback;
  const summary = rawSummary.length > 160 ? `${rawSummary.slice(0, 157)}…` : rawSummary;

  return {
    summary,
  };
}

export function ITPTemplatesTable({ templates, projectId }: ITPTemplatesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'docNo', desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const tableData = useMemo<TemplateRow[]>(() => {
    return templates.map((template) => ({
      ...template,
      ...buildDisplayFields(template),
    }));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return tableData.filter((template) => {
      const haystack = [
        template.docNo,
        template.description,
        template.summary,
        template.scopeOfWork,
        template.workType,
        template.specRef,
        template.parentSpec,
        template.agency,
        template.jurisdiction,
        template.applicableStandards?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
      const matchesApproval = approvalFilter === 'all' || template.approvalStatus === approvalFilter;
      const matchesWorkType = workTypeFilter === 'all' || template.workType === workTypeFilter;
      return matchesSearch && matchesStatus && matchesApproval && matchesWorkType;
    });
  }, [tableData, search, statusFilter, approvalFilter, workTypeFilter]);

  const statusCounts = useMemo(() => {
    return {
      draft: tableData.filter((t) => t.status === 'draft').length,
      in_review: tableData.filter((t) => t.status === 'in_review').length,
      approved: tableData.filter((t) => t.status === 'approved').length,
      superseded: tableData.filter((t) => t.status === 'superseded').length,
      pendingApproval: tableData.filter((t) => t.approvalStatus === 'pending').length,
    };
  }, [tableData]);

  const workTypes = useMemo(
    () => Array.from(new Set(tableData.map((template) => template.workType).filter(Boolean))).sort(),
    [tableData]
  );

  const columns = useMemo<ColumnDef<TemplateRow>[]>(
    () => [
      {
        accessorKey: 'docNo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Template Ref
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/projects/${projectId}/quality/itps/templates/${encodeURIComponent(row.original.docNo)}`}
            className="hover:underline text-blue-600 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {row.original.docNo}
          </Link>
        ),
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 220,
      },
      {
        accessorKey: 'description',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Description
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="block whitespace-pre-wrap text-sm leading-5 text-foreground" title={row.original.scopeOfWork ?? row.original.description}>
            {row.original.summary}
          </span>
        ),
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 360,
      },
      {
        accessorKey: 'workType',
        header: 'Work Type',
        cell: ({ row }) => <Badge variant="outline">{row.original.workType}</Badge>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 160,
      },
      {
        accessorKey: 'specRef',
        header: 'Spec Reference',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.specRef}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 180,
      },
      {
        accessorKey: 'revisionNumber',
        header: 'Revision',
        cell: ({ row }) => <Badge variant="secondary">{row.original.revisionNumber}</Badge>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 120,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ITPStatusBadge status={row.original.status} />,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 130,
      },
      {
        accessorKey: 'approvalStatus',
        header: 'Approval',
        cell: ({ row }) => <ApprovalStatusBadge status={row.original.approvalStatus} />,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 140,
      },
      {
        id: 'revisionDate',
        accessorFn: (row) => row.revisionDate ? new Date(row.revisionDate).getTime() : null,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Revision Date
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatRevisionDate(row.original.revisionDate)}</span>,
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue<number | null>(columnId);
          const b = rowB.getValue<number | null>(columnId);
          if (a === b) return 0;
          if (a === null || a === undefined) return 1;
          if (b === null || b === undefined) return -1;
          return a < b ? -1 : 1;
        },
        size: 160,
      },
    ],
    [projectId]
  );

  const table = useReactTable<TemplateRow>({
    data: filteredTemplates,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true,
  });

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pagination.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search by doc no, description, work type..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            table.setPageIndex(0);
          }}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={approvalFilter}
          onValueChange={(value) => {
            setApprovalFilter(value);
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Approval status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Approvals</SelectItem>
            <SelectItem value="not_required">Not Required</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={workTypeFilter}
          onValueChange={(value) => {
            setWorkTypeFilter(value);
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by work type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Types</SelectItem>
            {workTypes.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                  No ITP templates found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredTemplates.length} of {tableData.length} templates
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Draft: {statusCounts.draft}</span>
          <span>In Review: {statusCounts.in_review}</span>
          <span>Approved: {statusCounts.approved}</span>
          <span>Superseded: {statusCounts.superseded}</span>
          <span>Pending Approval: {statusCounts.pendingApproval}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {Math.min(pagination.pageIndex + 1, totalPages)} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function ITPStatusBadge({ status }: { status: ITPTemplateNode['status'] }) {
  const variants: Record<ITPTemplateNode['status'], { variant: any; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    in_review: { variant: 'default', label: 'In Review' },
    approved: { variant: 'success', label: 'Approved' },
    superseded: { variant: 'outline', label: 'Superseded' },
  };
  
  const config = status ? variants[status] : undefined;
  
  return (
    <Badge variant={(config?.variant as any) ?? 'outline'}>
      {config?.label ?? 'Unknown'}
    </Badge>
  );
}

function ApprovalStatusBadge({ status }: { status: ITPTemplateNode['approvalStatus'] }) {
  const config: Record<ITPTemplateNode['approvalStatus'], { icon: any; variant: any; label: string }> = {
    not_required: { icon: null, variant: 'outline', label: 'Not Required' },
    pending: { icon: Clock, variant: 'default', label: 'Pending' },
    approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected' },
  };
  
  const item = status ? config[status] : undefined;
  const Icon = item?.icon;
  
  return (
    <Badge variant={(item?.variant as any) ?? 'outline'} className="gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {item?.label ?? 'Unknown'}
    </Badge>
  );
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'bigint') return Number(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as Record<string, unknown>) &&
    typeof (value as { toNumber?: () => number }).toNumber === 'function'
  ) {
    try {
      const result = (value as { toNumber: () => number }).toNumber();
      return Number.isNaN(result) ? null : result;
    } catch (error) {
      console.warn('Failed to convert Neo4j integer-like value', value, error);
      return null;
    }
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'year' in (value as Record<string, unknown>) &&
    'month' in (value as Record<string, unknown>) &&
    'day' in (value as Record<string, unknown>)
  ) {
    const temporal = value as {
      year: unknown;
      month: unknown;
      day: unknown;
      hour?: unknown;
      minute?: unknown;
      second?: unknown;
      nanosecond?: unknown;
      timeZoneOffsetSeconds?: unknown;
    };

    const year = toNumber(temporal.year);
    const month = toNumber(temporal.month);
    const day = toNumber(temporal.day);

    if (year === null || month === null || day === null) {
      return null;
    }

    const hour = toNumber(temporal.hour ?? 0) ?? 0;
    const minute = toNumber(temporal.minute ?? 0) ?? 0;
    const second = toNumber(temporal.second ?? 0) ?? 0;
    const nanosecond = toNumber(temporal.nanosecond ?? 0) ?? 0;
    const millisecond = Math.floor(nanosecond / 1e6);
    const offsetSeconds = toNumber(temporal.timeZoneOffsetSeconds ?? 0) ?? 0;

    const timestamp =
      Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
      offsetSeconds * 1000;

    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatRevisionDate(value: unknown): string {
  const date = toDate(value);
  if (!date) {
    return '—';
  }

  try {
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.warn('Failed to format revision date', value, error);
    return '—';
  }
}

