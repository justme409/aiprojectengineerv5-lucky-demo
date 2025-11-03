'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ITPTemplateNode } from '@/schemas/neo4j';
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
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ITPTemplatesTableProps {
  templates: ITPTemplateNode[];
  projectId: string;
}

export function ITPTemplatesTable({ templates, projectId }: ITPTemplatesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.docNo.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.workType.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || template.approvalStatus === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
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
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Approval status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Approvals</SelectItem>
            <SelectItem value="not_required">Not Required</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doc No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Spec Reference</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Revision Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No ITP templates found
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/itps/templates/${template.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {template.docNo}
                    </Link>
                  </TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.workType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {template.specRef}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template.revisionNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    <ITPStatusBadge status={template.status} />
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={template.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(template.revisionDate), 'dd MMM yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
        <div className="flex gap-4">
          <span>Draft: {templates.filter(t => t.status === 'draft').length}</span>
          <span>In Review: {templates.filter(t => t.status === 'in_review').length}</span>
          <span>Approved: {templates.filter(t => t.status === 'approved').length}</span>
          <span>Pending Approval: {templates.filter(t => t.approvalStatus === 'pending').length}</span>
        </div>
      </div>
    </div>
  );
}

function ITPStatusBadge({ status }: { status: ITPTemplateNode['status'] }) {
  const variants: Record<ITPTemplateNode['status'], { variant: any; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    in_review: { variant: 'default', label: 'In Review' },
    approved: { variant: 'success', label: 'Approved' },
    superseded: { variant: 'outline', label: 'Superseded' },
  };
  
  const config = variants[status];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

function ApprovalStatusBadge({ status }: { status: ITPTemplateNode['approvalStatus'] }) {
  const config: Record<ITPTemplateNode['approvalStatus'], { icon: any; variant: any; label: string }> = {
    not_required: { icon: null, variant: 'outline', label: 'Not Required' },
    pending: { icon: Clock, variant: 'default', label: 'Pending' },
    approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected' },
  };
  
  const item = config[status];
  const Icon = item.icon;
  
  return (
    <Badge variant={item.variant as any} className="gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {item.label}
    </Badge>
  );
}

