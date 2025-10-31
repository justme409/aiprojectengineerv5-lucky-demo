'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateProgressClaimButtonProps {
  projectId: string;
}

export function CreateProgressClaimButton({ projectId }: CreateProgressClaimButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    period: '',
    cutoffDate: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create progress claim');
      }
      
      toast.success('Progress claim created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        period: '',
        cutoffDate: '',
      });
    } catch (error) {
      toast.error('Failed to create progress claim');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Claim
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Progress Claim</DialogTitle>
            <DialogDescription>
              Create a new monthly progress claim
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period">Claim Period *</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g., January 2024"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cutoffDate">Cutoff Date *</Label>
              <Input
                id="cutoffDate"
                type="date"
                value={formData.cutoffDate}
                onChange={(e) => setFormData({ ...formData, cutoffDate: e.target.value })}
                required
              />
            </div>
            
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Add claim items from schedule items</li>
                <li>Link to conformed lots</li>
                <li>Calculate quantities and values</li>
                <li>Submit for certification</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Claim'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

