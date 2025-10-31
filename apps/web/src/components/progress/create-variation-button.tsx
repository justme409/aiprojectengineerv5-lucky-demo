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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateVariationButtonProps {
  projectId: string;
}

export function CreateVariationButton({ projectId }: CreateVariationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    dateIdentified: new Date().toISOString().split('T')[0],
    claimedValue: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          claimedValue: parseFloat(formData.claimedValue),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create variation');
      }
      
      toast.success('Variation created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        description: '',
        dateIdentified: new Date().toISOString().split('T')[0],
        claimedValue: '',
      });
    } catch (error) {
      toast.error('Failed to create variation');
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
          Create Variation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Variation</DialogTitle>
            <DialogDescription>
              Create a new contract variation or change order
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the variation..."
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateIdentified">Date Identified *</Label>
                <Input
                  id="dateIdentified"
                  type="date"
                  value={formData.dateIdentified}
                  onChange={(e) => setFormData({ ...formData, dateIdentified: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimedValue">Claimed Value ($) *</Label>
                <Input
                  id="claimedValue"
                  type="number"
                  step="0.01"
                  value={formData.claimedValue}
                  onChange={(e) => setFormData({ ...formData, claimedValue: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Notify the client of the variation</li>
                <li>Link affected schedule items</li>
                <li>Submit for approval</li>
                <li>Track approval status</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Variation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

