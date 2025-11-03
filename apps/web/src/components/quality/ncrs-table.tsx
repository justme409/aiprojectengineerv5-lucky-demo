'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NCRNode } from '@/schemas/neo4j';
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
import { AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface NCRsTableProps {
  ncrs: NCRNode[];
  projectId: string;
}

export function NCRsTable({ ncrs, projectId }: NCRsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  const filteredNCRs = ncrs.filter((ncr) => {
    const matchesSearch = 
      ncr.number.toLowerCase().includes(search.toLowerCase()) ||
      ncr.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ncr.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || ncr.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search NCRs..."
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
            <SelectItem value="investigation">Investigation</SelectItem>
            <SelectItem value="resolution_proposed">Resolution Proposed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NCR Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Raised Date</TableHead>
              <TableHead>Raised By</TableHead>
              <TableHead>Closed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNCRs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No NCRs found
                </TableCell>
              </TableRow>
            ) : (
              filteredNCRs.map((ncr) => (
                <TableRow key={ncr.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/ncrs/${ncr.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {ncr.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {ncr.description}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={ncr.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ncr.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ncr.raisedDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ncr.raisedBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ncr.closedDate 
                      ? format(new Date(ncr.closedDate), 'dd MMM yyyy')
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
          Showing {filteredNCRs.length} of {ncrs.length} NCRs
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            Critical: {ncrs.filter(n => n.severity === 'critical').length}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Major: {ncrs.filter(n => n.severity === 'major').length}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Minor: {ncrs.filter(n => n.severity === 'minor').length}
          </span>
          <span>Open: {ncrs.filter(n => n.status !== 'closed').length}</span>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: NCRNode['severity'] }) {
  const config: Record<NCRNode['severity'], { icon: any; variant: any; label: string }> = {
    minor: { icon: AlertCircle, variant: 'secondary', label: 'Minor' },
    major: { icon: AlertTriangle, variant: 'default', label: 'Major' },
    critical: { icon: AlertOctagon, variant: 'destructive', label: 'Critical' },
  };
  
  const item = config[severity];
  const Icon = item.icon;
  
  return (
    <Badge variant={item.variant as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: NCRNode['status'] }) {
  const variants: Record<NCRNode['status'], { variant: any; label: string }> = {
    open: { variant: 'destructive', label: 'Open' },
    investigation: { variant: 'default', label: 'Investigation' },
    resolution_proposed: { variant: 'default', label: 'Resolution Proposed' },
    approved: { variant: 'success', label: 'Approved' },
    closed: { variant: 'outline', label: 'Closed' },
  };
  
  const config = variants[status];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

