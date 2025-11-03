'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VariationNode } from '@/schemas/neo4j/variation.schema';
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
import { FileEdit, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VariationsTableProps {
  variations: VariationNode[];
  projectId: string;
}

export function VariationsTable({ variations, projectId }: VariationsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredVariations = variations.filter((variation) => {
    const matchesSearch = 
      variation.number.toLowerCase().includes(search.toLowerCase()) ||
      variation.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || variation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const totalClaimed = filteredVariations.reduce((sum, v) => sum + v.claimedValue, 0);
  const totalApproved = filteredVariations.reduce((sum, v) => sum + (v.approvedValue || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search variations..."
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
            <SelectItem value="identified">Identified</SelectItem>
            <SelectItem value="notified">Notified</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variation Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date Identified</TableHead>
              <TableHead>Date Notified</TableHead>
              <TableHead className="text-right">Claimed Value</TableHead>
              <TableHead className="text-right">Approved Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No variations found
                </TableCell>
              </TableRow>
            ) : (
              filteredVariations.map((variation) => (
                <TableRow key={variation.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/progress/variations/${variation.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileEdit className="h-4 w-4" />
                      {variation.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">{variation.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(variation.dateIdentified), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {variation.dateNotified 
                      ? format(new Date(variation.dateNotified), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${variation.claimedValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600">
                    ${(variation.approvedValue || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={variation.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredVariations.length} of {variations.length} variations
        </div>
        <div className="flex gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Total Claimed</div>
            <div className="text-xl font-bold">
              ${totalClaimed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Approved</div>
            <div className="text-xl font-bold text-green-600">
              ${totalApproved.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: VariationNode['status'] }) {
  const config: Record<VariationNode['status'], { icon: any; variant: any; label: string }> = {
    identified: { icon: Clock, variant: 'secondary', label: 'Identified' },
    notified: { icon: Clock, variant: 'default', label: 'Notified' },
    quoted: { icon: Clock, variant: 'default', label: 'Quoted' },
    approved: { icon: CheckCircle, variant: 'outline', label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected' },
    implemented: { icon: CheckCircle, variant: 'outline', label: 'Implemented' },
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

