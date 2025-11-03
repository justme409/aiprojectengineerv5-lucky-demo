'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ITPInstanceNode } from '@/schemas/neo4j/itp-instance.schema';
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
import { FileCheck, CheckCircle, Clock } from 'lucide-react';

interface ITPInstancesTableProps {
  instances: ITPInstanceNode[];
  projectId: string;
}

export function ITPInstancesTable({ instances, projectId }: ITPInstancesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredInstances = instances.filter((instance) => {
    const matchesSearch = 
      instance.templateId.toLowerCase().includes(search.toLowerCase()) ||
      instance.lotId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search ITP instances..."
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
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template ID</TableHead>
              <TableHead>Lot ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">% Complete</TableHead>
              <TableHead>Completed Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No ITP instances found
                </TableCell>
              </TableRow>
            ) : (
              filteredInstances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/itps/instances/${instance.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileCheck className="h-4 w-4" />
                      {instance.templateId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {instance.lotId}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={instance.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">-</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    -
                  </TableCell>
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
        <div className="flex gap-4">
          <span>Pending: {instances.filter(i => i.status === 'pending').length}</span>
          <span>In Progress: {instances.filter(i => i.status === 'in_progress').length}</span>
          <span>Completed: {instances.filter(i => i.status === 'completed').length}</span>
          <span>Approved: {instances.filter(i => i.status === 'approved').length}</span>
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

