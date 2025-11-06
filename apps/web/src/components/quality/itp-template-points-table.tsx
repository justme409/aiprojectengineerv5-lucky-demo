'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InspectionPointNode } from '@/schemas/neo4j';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

type PointRow = InspectionPointNode & { id?: string };

interface ITPTemplatePointsTableProps {
  points: PointRow[];
}

export function ITPTemplatePointsTable({ points }: ITPTemplatePointsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [holdFilter, setHoldFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'sequence', desc: false },
  ]);

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      const haystack = [
        point.description,
        point.requirement,
        point.acceptanceCriteria,
        point.testMethod,
        point.testFrequency,
        point.responsibleParty,
        point.standardsRef?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || point.type === typeFilter;
      const matchesHoldWitness =
        holdFilter === 'all' ||
        (holdFilter === 'hold' && Boolean(point.isHoldPoint)) ||
        (holdFilter === 'witness' && Boolean(point.isWitnessPoint));

      return matchesSearch && matchesType && matchesHoldWitness;
    });
  }, [points, search, typeFilter, holdFilter]);

  const pointTypes = useMemo(
    () => Array.from(new Set(points.map((point) => point.type))).sort(),
    [points]
  );

  const columns = useMemo<ColumnDef<PointRow>[]>(
    () => [
      {
        accessorKey: 'sequence',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Seq
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
          const seq = row.original.sequence ?? (row.index + 1);
          return seq != null ? seq.toString().padStart(2, '0') : '—';
        },
        enableSorting: true,
        sortingFn: 'basic',
        size: 80,
      },
      {
        accessorKey: 'description',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Inspection / Test Point
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className="whitespace-pre-wrap text-sm text-foreground">{row.original.description}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 320,
      },
      {
        accessorKey: 'requirement',
        header: 'Specification / Clause',
        cell: ({ row }) => <span className="text-sm text-foreground whitespace-pre-wrap">{row.original.requirement || '—'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 280,
      },
      {
        accessorKey: 'type',
        header: 'Point Type',
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 140,
      },
      {
        accessorKey: 'acceptanceCriteria',
        header: 'Acceptance Criteria',
        cell: ({ row }) => <span className="text-sm text-foreground whitespace-pre-wrap">{row.original.acceptanceCriteria || '—'}</span>,
        enableSorting: false,
        size: 280,
      },
      {
        accessorKey: 'testMethod',
        header: 'Test Method',
        cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-pre-wrap">{row.original.testMethod || '—'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 200,
      },
      {
        accessorKey: 'testFrequency',
        header: 'Frequency',
        cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-pre-wrap">{row.original.testFrequency || '—'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 160,
      },
      {
        accessorKey: 'responsibleParty',
        header: 'Responsible',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.responsibleParty || '—'}</span>,
        enableSorting: true,
        sortingFn: 'alphanumeric',
        size: 180,
      },
      {
        id: 'holdWitness',
        header: 'Hold / Witness',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.isHoldPoint && <Badge variant="destructive">Hold</Badge>}
            {row.original.isWitnessPoint && <Badge variant="secondary">Witness</Badge>}
            {!row.original.isHoldPoint && !row.original.isWitnessPoint && <span className="text-sm text-muted-foreground">—</span>}
          </div>
        ),
        enableSorting: false,
        size: 160,
      },
      {
        accessorKey: 'standardsRef',
        header: 'Standards',
        cell: ({ row }) => {
          const standards = row.original.standardsRef || [];
          return standards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {standards.map((standard, index) => (
                <Badge key={`${standard}-${index}`} variant="outline" className="text-xs">
                  {standard}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
        enableSorting: false,
        size: 220,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredPoints,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search points, requirements, test methods..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by point type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Point Types</SelectItem>
            {pointTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={holdFilter} onValueChange={setHoldFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Hold / Witness" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Points</SelectItem>
            <SelectItem value="hold">Hold Points</SelectItem>
            <SelectItem value="witness">Witness Points</SelectItem>
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
                  No inspection points found for this template
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

      <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
        <span>{filteredPoints.length} of {points.length} inspection points</span>
        <div className="flex gap-3">
          <span>Hold: {points.filter((point) => point.isHoldPoint).length}</span>
          <span>Witness: {points.filter((point) => point.isWitnessPoint).length}</span>
        </div>
      </div>
    </div>
  );
}

export default ITPTemplatePointsTable;

