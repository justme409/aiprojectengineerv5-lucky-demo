'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScheduleItemNode } from '@/schemas/neo4j';
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
import { FileText } from 'lucide-react';

interface ScheduleItemsTableProps {
  items: ScheduleItemNode[];
  projectId: string;
}

export function ScheduleItemsTable({ items, projectId }: ScheduleItemsTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.number.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const uniqueCategories = Array.from(new Set(items.map(i => i.category).filter(c => c !== undefined)));
  
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search schedule items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Contract Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No schedule items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/progress/schedule-items/${item.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {item.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right font-mono">
                    {item.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${item.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${(item.quantity * item.rate).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Showing {filteredItems.length} of {items.length} schedule items
        </div>
        <div className="font-semibold text-lg">
          Total Contract Value: ${totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
}

