'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DocumentNode } from '@/schemas/neo4j/document.schema';
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
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentsTableProps {
  documents: DocumentNode[];
  projectId: string;
}

export function DocumentsTable({ documents, projectId }: DocumentsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.number.toLowerCase().includes(search.toLowerCase()) ||
      doc.title.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const uniqueTypes = Array.from(new Set(documents.map(d => d.type)));
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search documents..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="for_review">For Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/documents/${doc.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {doc.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">{doc.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.revision}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(doc.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell>
                    {doc.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={doc.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
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
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
        <div className="flex gap-4">
          <span>Draft: {documents.filter(d => d.status === 'draft').length}</span>
          <span>For Review: {documents.filter(d => d.status === 'for_review').length}</span>
          <span>Approved: {documents.filter(d => d.status === 'approved').length}</span>
          <span>Superseded: {documents.filter(d => d.status === 'superseded').length}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentNode['status'] }) {
  const variants: Record<DocumentNode['status'], { variant: any; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    for_review: { variant: 'default', label: 'For Review' },
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

