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

interface CreateITPTemplateButtonProps {
  projectId: string;
}

export function CreateITPTemplateButton({ projectId }: CreateITPTemplateButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    docNo: '',
    description: '',
    workType: '',
    specRef: '',
    revisionNumber: 'A',
    revisionDate: new Date().toISOString().split('T')[0],
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/neo4j/${projectId}/itp-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ITP template');
      }
      
      toast.success('ITP template created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        docNo: '',
        description: '',
        workType: '',
        specRef: '',
        revisionNumber: 'A',
        revisionDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to create ITP template');
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
          Create ITP Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create ITP Template</DialogTitle>
            <DialogDescription>
              Add a new Inspection and Test Plan template
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docNo">Document Number *</Label>
                <Input
                  id="docNo"
                  value={formData.docNo}
                  onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                  placeholder="e.g., ITP-SG-001"
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
                placeholder="e.g., Subgrade Preparation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specRef">Specification Reference *</Label>
              <Input
                id="specRef"
                value={formData.specRef}
                onChange={(e) => setFormData({ ...formData, specRef: e.target.value })}
                placeholder="e.g., MRTS05 Clause 1.2"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revisionNumber">Revision *</Label>
                <Input
                  id="revisionNumber"
                  value={formData.revisionNumber}
                  onChange={(e) => setFormData({ ...formData, revisionNumber: e.target.value })}
                  placeholder="A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revisionDate">Revision Date *</Label>
                <Input
                  id="revisionDate"
                  type="date"
                  value={formData.revisionDate}
                  onChange={(e) => setFormData({ ...formData, revisionDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

