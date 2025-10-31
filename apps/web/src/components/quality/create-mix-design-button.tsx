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

interface CreateMixDesignButtonProps {
  projectId: string;
}

export function CreateMixDesignButton({ projectId }: CreateMixDesignButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'concrete' as 'concrete' | 'asphalt',
    targetStrength: '',
    slump: '',
    notes: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/mix-designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetStrength: formData.targetStrength ? parseFloat(formData.targetStrength) : undefined,
          slump: formData.slump ? parseFloat(formData.slump) : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create mix design');
      }
      
      toast.success('Mix design created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        code: '',
        description: '',
        type: 'concrete',
        targetStrength: '',
        slump: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create mix design');
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
          Add Mix Design
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Mix Design</DialogTitle>
            <DialogDescription>
              Add a new concrete or asphalt mix design
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mix Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., C32/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="asphalt">Asphalt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., 32 MPa Concrete for Pavement"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetStrength">Target Strength (MPa)</Label>
                <Input
                  id="targetStrength"
                  type="number"
                  step="0.1"
                  value={formData.targetStrength}
                  onChange={(e) => setFormData({ ...formData, targetStrength: e.target.value })}
                  placeholder="e.g., 32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slump">Slump (mm)</Label>
                <Input
                  id="slump"
                  type="number"
                  step="1"
                  value={formData.slump}
                  onChange={(e) => setFormData({ ...formData, slump: e.target.value })}
                  placeholder="e.g., 80"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Mix Design'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

