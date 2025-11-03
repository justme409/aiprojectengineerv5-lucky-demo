'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialNode } from '@/schemas/neo4j';
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
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';

interface MaterialsTableProps {
  materials: MaterialNode[];
  projectId: string;
}

export function MaterialsTable({ materials, projectId }: MaterialsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.supplier.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || material.approvalStatus === statusFilter;
    const matchesType = typeFilter === 'all' || material.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const uniqueTypes = Array.from(new Set(materials.map(m => m.type)));
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search materials..."
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
              <TableHead>Material Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Product Code</TableHead>
              <TableHead>Specification</TableHead>
              <TableHead>Approval Status</TableHead>
              <TableHead>Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No materials found
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/materials/${material.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      {material.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{material.type}</Badge>
                  </TableCell>
                  <TableCell>{material.supplier}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {material.specification}
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={material.approvalStatus} />
                  </TableCell>
                  <TableCell>
                    {material.certificateId ? (
                      <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Uploaded</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredMaterials.length} of {materials.length} materials
        </div>
        <div className="flex gap-4">
          <span>Pending: {materials.filter(m => m.approvalStatus === 'pending').length}</span>
          <span>Approved: {materials.filter(m => m.approvalStatus === 'approved').length}</span>
          <span>Rejected: {materials.filter(m => m.approvalStatus === 'rejected').length}</span>
          <span>With Certificates: {materials.filter(m => m.certificateId).length}</span>
        </div>
      </div>
    </div>
  );
}

function ApprovalStatusBadge({ status }: { status: MaterialNode['approvalStatus'] }) {
  const config: Record<MaterialNode['approvalStatus'], { icon: any; variant: any; label: string }> = {
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

