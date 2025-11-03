'use client';

import { QuantityNode } from '@/schemas/neo4j';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface QuantitiesTableProps {
  quantities: QuantityNode[];
  projectId: string;
  lotId: string;
}

export function QuantitiesTable({ quantities, projectId, lotId }: QuantitiesTableProps) {
  const totalQuantity = quantities.reduce((sum, q) => sum + q.quantity, 0);
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schedule Item</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">% Complete</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quantities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No quantities found
                </TableCell>
              </TableRow>
            ) : (
              quantities.map((qty) => (
                <TableRow key={qty.id}>
                  <TableCell className="font-medium">
                    {qty.scheduleItemId}
                  </TableCell>
                  <TableCell>{qty.unit}</TableCell>
                  <TableCell className="text-right font-mono">
                    {qty.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${qty.percentComplete}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{qty.percentComplete}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={qty.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {quantities.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Total: {quantities.length} schedule items
          </div>
          <div className="font-semibold">
            Total Quantity: {totalQuantity.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: QuantityNode['status'] }) {
  const variants: Record<QuantityNode['status'], { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    in_progress: { variant: 'default', label: 'In Progress' },
    completed: { variant: 'outline', label: 'Completed' },
  };
  
  const config = variants[status];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

