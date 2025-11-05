'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LotWithRelationships } from '@/schemas/neo4j';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LotDetailHeaderProps {
  lot: LotWithRelationships;
  projectId: string;
}

export function LotDetailHeader({ lot, projectId }: LotDetailHeaderProps) {
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `/api/neo4j/${projectId}/lots/${lot.number}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success('Lot status updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/neo4j/${projectId}/lots/${lot.number}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete lot');
      
      toast.success('Lot deleted');
      router.push(`/projects/${projectId}/quality/lots`);
    } catch (error) {
      toast.error('Failed to delete lot');
      console.error(error);
      setDeleting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <Link href={`/projects/${projectId}/quality/lots`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lots
          </Link>
        </Button>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lot.number}</h1>
            <LotStatusBadge status={lot.status} />
          </div>
          <p className="text-lg text-muted-foreground">{lot.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={lot.status}
            onValueChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="conformed">Conformed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={deleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Lot</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this lot? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <div className="text-sm text-muted-foreground">Work Type</div>
          <div className="font-semibold">{lot.workType}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Area Code</div>
          <div className="font-semibold">{lot.areaCode}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Chainage</div>
          <div className="font-semibold">
            {lot.startChainage} - {lot.endChainage}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">% Complete</div>
          <div className="font-semibold text-lg">
            {lot.percentComplete}%
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Start Date</div>
          <div className="font-semibold">
            {format(new Date(lot.startDate), 'dd MMM yyyy')}
          </div>
        </div>
        {lot.conformedDate && (
          <div>
            <div className="text-sm text-muted-foreground">Conformed Date</div>
            <div className="font-semibold">
              {format(new Date(lot.conformedDate), 'dd MMM yyyy')}
            </div>
          </div>
        )}
        {lot.closedDate && (
          <div>
            <div className="text-sm text-muted-foreground">Closed Date</div>
            <div className="font-semibold">
              {format(new Date(lot.closedDate), 'dd MMM yyyy')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LotStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    open: { variant: 'secondary', label: 'Open' },
    in_progress: { variant: 'default', label: 'In Progress' },
    conformed: { variant: 'success', label: 'Conformed' },
    closed: { variant: 'outline', label: 'Closed' },
  };
  
  const config = variants[status] || variants.open;
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}

