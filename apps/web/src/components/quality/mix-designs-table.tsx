'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MixDesignNode } from '@/schemas/neo4j';
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
import { FlaskConical, CheckCircle, Clock, XCircle } from 'lucide-react';

interface MixDesignsTableProps {
  mixDesigns: MixDesignNode[];
  projectId: string;
}

export function MixDesignsTable({ mixDesigns, projectId }: MixDesignsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const filteredMixDesigns = mixDesigns.filter((mix) => {
    const matchesSearch = 
      mix.code.toLowerCase().includes(search.toLowerCase()) ||
      mix.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || mix.approvalStatus === statusFilter;
    const matchesType = typeFilter === 'all' || mix.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const uniqueTypes = Array.from(new Set(mixDesigns.map(m => m.type)));
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search mix designs..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
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
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mix Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target Strength</TableHead>
              <TableHead>Slump</TableHead>
              <TableHead>Approval Status</TableHead>
              <TableHead>Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMixDesigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No mix designs found
                </TableCell>
              </TableRow>
            ) : (
              filteredMixDesigns.map((mix) => (
                <TableRow key={mix.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/mix-designs/${mix.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FlaskConical className="h-4 w-4" />
                      {mix.code}
                    </Link>
                  </TableCell>
                  <TableCell>{mix.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{mix.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {mix.strength || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {mix.slump || '-'}
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={mix.approvalStatus} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">-</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredMixDesigns.length} of {mixDesigns.length} mix designs
        </div>
        <div className="flex gap-4">
          <span>Pending: {mixDesigns.filter(m => m.approvalStatus === 'pending').length}</span>
          <span>Approved: {mixDesigns.filter(m => m.approvalStatus === 'approved').length}</span>
          <span>Rejected: {mixDesigns.filter(m => m.approvalStatus === 'rejected').length}</span>
        </div>
      </div>
    </div>
  );
}

function ApprovalStatusBadge({ status }: { status: MixDesignNode['approvalStatus'] }) {
  const config: Record<MixDesignNode['approvalStatus'], { icon: any; variant: any; label: string }> = {
    pending: { icon: Clock, variant: 'default', label: 'Pending' },
    approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
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

