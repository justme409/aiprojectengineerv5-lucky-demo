'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LotNode } from '@/schemas/neo4j/lot.schema';
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
import { format } from 'date-fns';

interface LotsTableProps {
  lots: LotNode[];
  projectId: string;
}

export function LotsTable({ lots, projectId }: LotsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter lots based on search and status
  const filteredLots = lots.filter((lot) => {
    const matchesSearch = 
      lot.number.toLowerCase().includes(search.toLowerCase()) ||
      lot.description.toLowerCase().includes(search.toLowerCase()) ||
      lot.workType.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search lots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="conformed">Conformed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Chainage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">% Complete</TableHead>
              <TableHead>Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No lots found
                </TableCell>
              </TableRow>
            ) : (
              filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/lots/${lot.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {lot.number}
                    </Link>
                  </TableCell>
                  <TableCell>{lot.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lot.workType}</Badge>
                  </TableCell>
                  <TableCell>{lot.areaCode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lot.startChainage} - {lot.endChainage}
                  </TableCell>
                  <TableCell>
                    <LotStatusBadge status={lot.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={lot.percentComplete === 100 ? 'text-green-600 font-semibold' : ''}>
                      {lot.percentComplete}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lot.startDate), 'dd MMM yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredLots.length} of {lots.length} lots
        </div>
        <div className="flex gap-4">
          <span>Open: {lots.filter(l => l.status === 'open').length}</span>
          <span>In Progress: {lots.filter(l => l.status === 'in_progress').length}</span>
          <span>Conformed: {lots.filter(l => l.status === 'conformed').length}</span>
          <span>Closed: {lots.filter(l => l.status === 'closed').length}</span>
        </div>
      </div>
    </div>
  );
}

function LotStatusBadge({ status }: { status: LotNode['status'] }) {
  const variants: Record<LotNode['status'], { variant: any; label: string }> = {
    open: { variant: 'secondary', label: 'Open' },
    in_progress: { variant: 'default', label: 'In Progress' },
    conformed: { variant: 'success', label: 'Conformed' },
    closed: { variant: 'outline', label: 'Closed' },
  };
  
  const config = variants[status];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

