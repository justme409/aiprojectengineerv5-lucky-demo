'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ITPInstanceNode } from '@/schemas/neo4j';
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
import { ArrowDown, ArrowUp, ArrowUpDown, FileCheck, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ITPInstancesTableProps {
  instances: ITPInstanceNode[];
  projectId: string;
}

type InstanceRow = ITPInstanceNode & { id?: string; templateId?: string };

export function ITPInstancesTable({ instances, projectId }: ITPInstancesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'templateDocNo', desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const filteredInstances = useMemo(() => {
    return instances.filter((instance) => {
      const haystack = [instance.templateDocNo, instance.lotNumber, instance.notes, instance.approvedBy]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [instances, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      pending: instances.filter((item) => item.status === 'pending').length,
      in_progress: instances.filter((item) => item.status === 'in_progress').length,
      completed: instances.filter((item) => item.status === 'completed').length,
      approved: instances.filter((item) => item.status === 'approved').length,
    };
  }, [instances]);

  const columns = useMemo<ColumnDef<InstanceRow>[]>(
    () => [
      {
        accessorKey: 'templateDocNo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Template
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const id = row.original.id ?? row.original.templateId ?? row.original.templateDocNo;
          return (
            <Link
              href={`/projects/${projectId}/quality/itps/instances/${id}`}
              className="hover:underline text-blue-600 flex items-center gap-2"
            >
              <FileCheck className="h-4 w-4" />
              {row.original.templateDocNo}
            </Link>
          );
        },
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 220,
      },
      {
        accessorKey: 'lotNumber',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Lot
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lotNumber || '-'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 160,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 140,
      },
      {
        id: 'startDate',
        accessorFn: (row) => (row.startDate ? new Date(row.startDate).getTime() : null),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Start Date
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateValue(row.original.startDate)}</span>,
        enableSorting: true,
        sortingFn: dateSortingFn,
        size: 150,
      },
      {
        id: 'completedDate',
        accessorFn: (row) => (row.completedDate ? new Date(row.completedDate).getTime() : null),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Completed
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateValue(row.original.completedDate)}</span>,
        enableSorting: true,
        sortingFn: dateSortingFn,
        size: 150,
      },
      {
        id: 'approvedDate',
        accessorFn: (row) => (row.approvedDate ? new Date(row.approvedDate).getTime() : null),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Approved
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateValue(row.original.approvedDate)}</span>,
        enableSorting: true,
        sortingFn: dateSortingFn,
        size: 150,
      },
      {
        accessorKey: 'approvedBy',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Approved By
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.approvedBy || '-'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 180,
      },
    ],
    [projectId]
  );

  const table = useReactTable({
    data: filteredInstances,
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

  const totalPages = Math.max(1, Math.ceil(filteredInstances.length / pagination.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search by template, lot, notes..."
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
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
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
                  No ITP instances found
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
          Showing {filteredInstances.length} of {instances.length} ITP instances
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Pending: {statusCounts.pending}</span>
          <span>In Progress: {statusCounts.in_progress}</span>
          <span>Completed: {statusCounts.completed}</span>
          <span>Approved: {statusCounts.approved}</span>
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

function StatusBadge({ status }: { status: ITPInstanceNode['status'] }) {
  const config: Record<ITPInstanceNode['status'], { icon: any; variant: any; label: string }> = {
    pending: { icon: Clock, variant: 'secondary', label: 'Pending' },
    in_progress: { icon: Clock, variant: 'default', label: 'In Progress' },
    completed: { icon: CheckCircle, variant: 'outline', label: 'Completed' },
    approved: { icon: CheckCircle, variant: 'outline', label: 'Approved' },
  };
  
  const item = config[status];
  const Icon = item.icon;
  
  return (
    <Badge variant={item.variant as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function dateSortingFn(rowA: any, rowB: any, columnId: string) {
  const a = rowA.getValue<number | null>(columnId);
  const b = rowB.getValue<number | null>(columnId);
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return a < b ? -1 : 1;
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

function formatDateValue(value: unknown): string {
  const date = toDate(value);
  if (!date) {
    return '—';
  }

  try {
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.warn('Failed to format instance date', value, error);
    return '—';
  }
}

