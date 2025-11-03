'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProgressClaimNode } from '@/schemas/neo4j';
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
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ProgressClaimsTableProps {
  claims: ProgressClaimNode[];
  projectId: string;
}

export function ProgressClaimsTable({ claims, projectId }: ProgressClaimsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = 
      claim.number.toLowerCase().includes(search.toLowerCase()) ||
      claim.period.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const totalClaimed = filteredClaims.reduce((sum, claim) => sum + claim.claimedValue, 0);
  const totalCertified = filteredClaims.reduce((sum, claim) => sum + (claim.certifiedValue || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search claims..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim Number</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Cutoff Date</TableHead>
              <TableHead className="text-right">Claimed Value</TableHead>
              <TableHead className="text-right">Certified Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No progress claims found
                </TableCell>
              </TableRow>
            ) : (
              filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/progress/claims/${claim.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      {claim.number}
                    </Link>
                  </TableCell>
                  <TableCell>{claim.period}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(claim.cutoffDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${claim.claimedValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600">
                    ${(claim.certifiedValue || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={claim.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {claim.submittedDate 
                      ? format(new Date(claim.submittedDate), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredClaims.length} of {claims.length} claims
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
            <div className="text-sm text-muted-foreground">Total Certified</div>
            <div className="text-xl font-bold text-green-600">
              ${totalCertified.toLocaleString(undefined, {
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

function StatusBadge({ status }: { status: ProgressClaimNode['status'] }) {
  const config: Record<ProgressClaimNode['status'], { icon: any; variant: any; label: string }> = {
    draft: { icon: Clock, variant: 'secondary', label: 'Draft' },
    submitted: { icon: Clock, variant: 'default', label: 'Submitted' },
    under_review: { icon: Clock, variant: 'default', label: 'Under Review' },
    certified: { icon: CheckCircle, variant: 'success', label: 'Certified' },
    paid: { icon: CheckCircle, variant: 'success', label: 'Paid' },
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

