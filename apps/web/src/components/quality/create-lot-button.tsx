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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateLotButtonProps {
  projectId: string;
}

export function CreateLotButton({ projectId }: CreateLotButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    description: '',
    workType: '',
    areaCode: '',
    startChainage: '',
    endChainage: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startChainage: parseFloat(formData.startChainage),
          endChainage: parseFloat(formData.endChainage),
          percentComplete: 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lot');
      }
      
      toast.success('Lot created successfully');
      setOpen(false);
      router.refresh();
      
      // Reset form
      setFormData({
        number: '',
        description: '',
        workType: '',
        areaCode: '',
        startChainage: '',
        endChainage: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to create lot');
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
          Create Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Lot</DialogTitle>
            <DialogDescription>
              Add a new construction lot for quality tracking
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Lot Number *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g., SG-CH0000-CH0500-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type *</Label>
                <Input
                  id="workType"
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                  placeholder="e.g., SG, PV, BASE"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Subgrade Ch 0 to 500"
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code *</Label>
                <Input
                  id="areaCode"
                  value={formData.areaCode}
                  onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
                  placeholder="e.g., MC01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startChainage">Start Chainage *</Label>
                <Input
                  id="startChainage"
                  type="number"
                  step="0.01"
                  value={formData.startChainage}
                  onChange={(e) => setFormData({ ...formData, startChainage: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endChainage">End Chainage *</Label>
                <Input
                  id="endChainage"
                  type="number"
                  step="0.01"
                  value={formData.endChainage}
                  onChange={(e) => setFormData({ ...formData, endChainage: e.target.value })}
                  placeholder="500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

