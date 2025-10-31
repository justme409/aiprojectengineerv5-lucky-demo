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

interface CreateScheduleItemButtonProps {
  projectId: string;
}

export function CreateScheduleItemButton({ projectId }: CreateScheduleItemButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    description: '',
    unit: '',
    contractQuantity: '',
    rate: '',
    category: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/schedule-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contractQuantity: parseFloat(formData.contractQuantity),
          rate: parseFloat(formData.rate),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule item');
      }
      
      toast.success('Schedule item created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        number: '',
        description: '',
        unit: '',
        contractQuantity: '',
        rate: '',
        category: '',
      });
    } catch (error) {
      toast.error('Failed to create schedule item');
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
          Add Schedule Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
            <DialogDescription>
              Add a new item from the contract schedule of rates
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Item Number *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g., 1.1.1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Earthworks"
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
                placeholder="Item description..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., m3, m2, each"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractQuantity">Contract Quantity *</Label>
                <Input
                  id="contractQuantity"
                  type="number"
                  step="0.01"
                  value={formData.contractQuantity}
                  onChange={(e) => setFormData({ ...formData, contractQuantity: e.target.value })}
                  placeholder="1000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Rate ($) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="50.00"
                  required
                />
              </div>
            </div>
            
            {formData.contractQuantity && formData.rate && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">Total Item Value</div>
                <div className="text-2xl font-bold">
                  ${(parseFloat(formData.contractQuantity) * parseFloat(formData.rate)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Schedule Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

