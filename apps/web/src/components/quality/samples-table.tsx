'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SampleNode } from '@/schemas/neo4j/sample.schema';
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
import { Beaker } from 'lucide-react';

interface SamplesTableProps {
  samples: SampleNode[];
  projectId: string;
}

export function SamplesTable({ samples, projectId }: SamplesTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch = 
      sample.number.toLowerCase().includes(search.toLowerCase()) ||
      sample.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || sample.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const uniqueTypes = Array.from(new Set(samples.map(s => s.type)));
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search samples..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="collected">Collected</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="at_lab">At Lab</SelectItem>
            <SelectItem value="tested">Tested</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date Taken</TableHead>
              <TableHead>Taken By</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSamples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No samples found
                </TableCell>
              </TableRow>
            ) : (
              filteredSamples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/samples/${sample.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <Beaker className="h-4 w-4" />
                      {sample.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sample.type}</Badge>
                  </TableCell>
                  <TableCell>{sample.location}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(sample.dateTaken), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sample.takenBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sample.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredSamples.length} of {samples.length} samples
        </div>
        <div className="flex gap-4">
          <span>Collected: {samples.filter(s => s.status === 'collected').length}</span>
          <span>In Transit: {samples.filter(s => s.status === 'in_transit').length}</span>
          <span>At Lab: {samples.filter(s => s.status === 'at_lab').length}</span>
          <span>Tested: {samples.filter(s => s.status === 'tested').length}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SampleNode['status'] }) {
  const variants: Record<SampleNode['status'], { variant: any; label: string }> = {
    collected: { variant: 'secondary', label: 'Collected' },
    in_transit: { variant: 'default', label: 'In Transit' },
    at_lab: { variant: 'default', label: 'At Lab' },
    tested: { variant: 'outline', label: 'Tested' },
    disposed: { variant: 'outline', label: 'Disposed' },
  };
  
  const config = variants[status];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

