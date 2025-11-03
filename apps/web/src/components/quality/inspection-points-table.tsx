'use client';

import { useState } from 'react';
import { InspectionPointNode } from '@/schemas/neo4j/inspection-point.schema';
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
import { CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react';

interface InspectionPointsTableProps {
  points: InspectionPointNode[];
  projectId: string;
}

export function InspectionPointsTable({ points, projectId }: InspectionPointsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const filteredPoints = points.filter((point) => {
    const matchesSearch = 
      point.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || point.status === statusFilter;
    const matchesType = typeFilter === 'all' || point.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search inspection points..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hold">Hold Point</SelectItem>
            <SelectItem value="witness">Witness Point</SelectItem>
            <SelectItem value="surveillance">Surveillance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Required By</TableHead>
              <TableHead>Completed By</TableHead>
              <TableHead>Completed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No inspection points found
                </TableCell>
              </TableRow>
            ) : (
              filteredPoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium max-w-md">
                    {point.description}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={point.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={point.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {point.requiredBy || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {point.completedBy || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {point.completedDate 
                      ? format(new Date(point.completedDate), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredPoints.length} of {points.length} inspection points
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Hold: {points.filter(p => p.type === 'hold').length}
          </span>
          <span className="flex items-center gap-1">
            <Circle className="h-4 w-4 text-blue-500" />
            Witness: {points.filter(p => p.type === 'witness').length}
          </span>
          <span>Pending: {points.filter(p => p.status === 'pending').length}</span>
          <span>Completed: {points.filter(p => p.status === 'completed').length}</span>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: InspectionPointNode['type'] }) {
  const config: Record<InspectionPointNode['type'], { icon: any; variant: any; label: string }> = {
    hold: { icon: AlertCircle, variant: 'destructive', label: 'Hold Point' },
    witness: { icon: Circle, variant: 'default', label: 'Witness Point' },
    surveillance: { icon: Circle, variant: 'secondary', label: 'Surveillance' },
    record: { icon: Circle, variant: 'outline', label: 'Record' },
  };
  
  const item = config[type];
  const Icon = item.icon;
  
  return (
    <Badge variant={item.variant as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: InspectionPointNode['status'] }) {
  const config: Record<InspectionPointNode['status'], { icon: any; variant: any; label: string }> = {
    pending: { icon: Circle, variant: 'secondary', label: 'Pending' },
    in_progress: { icon: Circle, variant: 'default', label: 'In Progress' },
    completed: { icon: CheckCircle2, variant: 'outline', label: 'Completed' },
    approved: { icon: CheckCircle2, variant: 'outline', label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected' },
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

