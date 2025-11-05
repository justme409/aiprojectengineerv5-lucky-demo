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

interface CreateNCRButtonProps {
  projectId: string;
  lotId?: string;
}

export function CreateNCRButton({ projectId, lotId }: CreateNCRButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    severity: 'minor' as 'minor' | 'major' | 'critical',
    lotNumber: lotId || '',
    raisedBy: '',
    rootCause: '',
    proposedResolution: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.lotNumber) {
        throw new Error('Lot number is required');
      }
      
      const response = await fetch(`/api/neo4j/${projectId}/ncrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create NCR');
      }
      
      toast.success('NCR created successfully');
      setOpen(false);
      router.refresh();
      
      setFormData({
        description: '',
        severity: 'minor',
        lotNumber: lotId || '',
        raisedBy: '',
        rootCause: '',
        proposedResolution: '',
      });
    } catch (error) {
      toast.error('Failed to create NCR');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Plus className="mr-2 h-4 w-4" />
          Create NCR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Non-Conformance Report</DialogTitle>
            <DialogDescription>
              Report a quality issue or non-conformance
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the non-conformance..."
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lotNumber">Lot Number *</Label>
                <Input
                  id="lotNumber"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  placeholder="Lot number"
                  required
                  disabled={!!lotId}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="raisedBy">Raised By *</Label>
              <Input
                id="raisedBy"
                value={formData.raisedBy}
                onChange={(e) => setFormData({ ...formData, raisedBy: e.target.value })}
                placeholder="User UUID"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rootCause">Root Cause</Label>
              <Textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Describe the root cause if known..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposedResolution">Proposed Resolution</Label>
              <Textarea
                id="proposedResolution"
                value={formData.proposedResolution}
                onChange={(e) => setFormData({ ...formData, proposedResolution: e.target.value })}
                placeholder="Propose how to resolve this issue..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? 'Creating...' : 'Create NCR'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

