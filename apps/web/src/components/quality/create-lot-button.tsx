'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateOption {
  docNo: string;
  description: string;
  workType: string;
}

interface AreaOption {
  code: string;
  name: string;
  chainageStart?: number;
  chainageEnd?: number;
}

interface CreateLotButtonProps {
  projectId: string;
}

export function CreateLotButton({ projectId }: CreateLotButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [formData, setFormData] = useState({
    number: '',
    description: '',
    templateDocNo: '',
    workType: '',
    areaCode: '',
    startChainage: '',
    endChainage: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadReferenceData = async () => {
      setDataLoading(true);
      try {
        const [templateRes, areaRes] = await Promise.all([
          fetch(`/api/neo4j/${projectId}/itp-templates?status=approved`),
          fetch(`/api/neo4j/${projectId}/lbs`),
        ]);

        if (templateRes.ok) {
          const templateJson = await templateRes.json();
          const templateData: TemplateOption[] = (templateJson.data || []).map((item: any) => ({
            docNo: item.docNo,
            description: item.description,
            workType: item.workType,
          }));
          setTemplates(templateData);
        } else {
          toast.error('Failed to load ITP templates');
        }

        if (areaRes.ok) {
          const areaJson = await areaRes.json();
          const areaData: AreaOption[] = (areaJson.data || []).map((item: any) => ({
            code: item.code,
            name: item.name,
            chainageStart: item.chainageStart,
            chainageEnd: item.chainageEnd,
          }));
          setAreas(areaData);
        } else {
          toast.error('Failed to load LBS areas');
        }
      } catch (error) {
        console.error('Failed to load lot reference data', error);
        toast.error('Unable to load reference data for lots');
      } finally {
        setDataLoading(false);
      }
    };

    loadReferenceData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const startChainageValue = parseFloat(formData.startChainage);
      const endChainageValue = parseFloat(formData.endChainage);

      if (!formData.templateDocNo) {
        throw new Error('Please select an ITP template');
      }

      if (Number.isNaN(startChainageValue) || Number.isNaN(endChainageValue)) {
        throw new Error('Please provide valid chainage values');
      }

      const response = await fetch(`/api/neo4j/${projectId}/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startChainage: startChainageValue,
          endChainage: endChainageValue,
          percentComplete: 0,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create lot');
      }
      
      toast.success('Lot created successfully');
      setOpen(false);
      router.refresh();
      
      // Reset form
      setFormData({
        number: '',
        description: '',
        templateDocNo: '',
        workType: '',
        areaCode: '',
        startChainage: '',
        endChainage: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lot');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTemplateChange = (value: string) => {
    const template = templates.find((item) => item.docNo === value);
    setFormData((prev) => ({
      ...prev,
      templateDocNo: value,
      workType: template?.workType || prev.workType,
    }));
  };

  const handleAreaChange = (value: string) => {
    const area = areas.find((item) => item.code === value);
    setFormData((prev) => ({
      ...prev,
      areaCode: value,
      startChainage: area?.chainageStart != null ? String(area.chainageStart) : prev.startChainage,
      endChainage: area?.chainageEnd != null ? String(area.chainageEnd) : prev.endChainage,
    }));
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">ITP Template *</Label>
                <Select
                  value={formData.templateDocNo}
                  onValueChange={handleTemplateChange}
                  disabled={dataLoading || templates.length === 0}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder={dataLoading ? 'Loading templates...' : 'Select template'} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.docNo} value={template.docNo}>
                        {template.docNo} — {template.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  value={formData.areaCode}
                  onValueChange={handleAreaChange}
                  disabled={dataLoading || areas.length === 0}
                >
                  <SelectTrigger id="areaCode">
                    <SelectValue placeholder={dataLoading ? 'Loading areas...' : 'Select area'} />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.code} value={area.code}>
                        {area.code} — {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button type="submit" disabled={loading || dataLoading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Lot'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

