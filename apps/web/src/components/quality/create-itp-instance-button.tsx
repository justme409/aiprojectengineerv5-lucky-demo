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

interface CreateITPInstanceButtonProps {
  projectId: string;
  lotId?: string;
}

export function CreateITPInstanceButton({ projectId, lotId }: CreateITPInstanceButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateId: '',
    lotId: lotId || '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/itp-instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ITP instance');
      }
      
      toast.success('ITP instance created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        templateId: '',
        lotId: lotId || '',
      });
    } catch (error) {
      toast.error('Failed to create ITP instance');
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
          Create ITP Instance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create ITP Instance</DialogTitle>
            <DialogDescription>
              Create a lot-specific ITP instance from a template
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateId">ITP Template ID *</Label>
              <Input
                id="templateId"
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                placeholder="Template UUID"
                required
              />
            </div>
            
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
            
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">What happens next:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>ITP instance is created from the template</li>
                <li>Inspection points are copied to the instance</li>
                <li>Points can be checked off as work progresses</li>
                <li>Track completion percentage</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Instance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

