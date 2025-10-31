'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TestRequestNode } from '@/schemas/neo4j/test-request.schema';
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
import { TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestRequestsTableProps {
  tests: TestRequestNode[];
  projectId: string;
}

export function TestRequestsTable({ tests, projectId }: TestRequestsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredTests = tests.filter((test) => {
    const matchesSearch = 
      test.number.toLowerCase().includes(search.toLowerCase()) ||
      test.testType.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search test requests..."
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
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Number</TableHead>
              <TableHead>Test Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Completed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No test requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/quality/tests/${test.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      {test.number}
                    </Link>
                  </TableCell>
                  <TableCell>{test.testType}</TableCell>
                  <TableCell>
                    <StatusBadge status={test.status} />
                  </TableCell>
                  <TableCell>
                    {test.passed !== undefined && (
                      <ResultBadge passed={test.passed} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(test.requestedDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {test.dueDate 
                      ? format(new Date(test.dueDate), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {test.completedDate 
                      ? format(new Date(test.completedDate), 'dd MMM yyyy')
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
          Showing {filteredTests.length} of {tests.length} test requests
        </div>
        <div className="flex gap-4">
          <span>Requested: {tests.filter(t => t.status === 'requested').length}</span>
          <span>In Progress: {tests.filter(t => t.status === 'in_progress').length}</span>
          <span>Completed: {tests.filter(t => t.status === 'completed').length}</span>
          <span>Passed: {tests.filter(t => t.passed === true).length}</span>
          <span>Failed: {tests.filter(t => t.passed === false).length}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TestRequestNode['status'] }) {
  const config: Record<TestRequestNode['status'], { icon: any; variant: any; label: string }> = {
    requested: { icon: Clock, variant: 'secondary', label: 'Requested' },
    in_progress: { icon: Clock, variant: 'default', label: 'In Progress' },
    completed: { icon: CheckCircle, variant: 'success', label: 'Completed' },
    approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
    failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
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

function ResultBadge({ passed }: { passed: boolean }) {
  return (
    <Badge variant={passed ? 'success' : 'destructive'} className="gap-1">
      {passed ? (
        <>
          <CheckCircle className="h-3 w-3" />
          Passed
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          Failed
        </>
      )}
    </Badge>
  );
}

