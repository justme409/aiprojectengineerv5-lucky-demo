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

interface CreateSampleButtonProps {
  projectId: string;
  lotId?: string;
}

export function CreateSampleButton({ projectId, lotId }: CreateSampleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    lotId: lotId || '',
    takenBy: '',
    labName: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.lotId) {
        throw new Error('Lot ID is required');
      }
      
      const response = await fetch(`/api/neo4j/${projectId}/samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sample');
      }
      
      toast.success('Sample created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        type: '',
        location: '',
        lotId: lotId || '',
        takenBy: '',
        labName: '',
      });
    } catch (error) {
      toast.error('Failed to create sample');
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
          Record Sample
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Sample</DialogTitle>
            <DialogDescription>
              Record a new sample taken from site
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Sample Type *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Soil, Concrete, Asphalt"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Ch 500, Layer 1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotId">Lot ID *</Label>
                <Input
                  id="lotId"
                  value={formData.lotId}
                  onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                  placeholder="Lot UUID"
                  required
                  disabled={!!lotId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="takenBy">Taken By *</Label>
                <Input
                  id="takenBy"
                  value={formData.takenBy}
                  onChange={(e) => setFormData({ ...formData, takenBy: e.target.value })}
                  placeholder="User UUID"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="labName">Laboratory</Label>
              <Input
                id="labName"
                value={formData.labName}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                placeholder="e.g., ALS Laboratory"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Sample'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

