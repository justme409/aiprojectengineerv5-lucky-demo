'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, Plus, GitCompare, History, GitCommit, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RevisionItem {
  id: string;
  version: number;
  created_at: string;
  commit_message?: string | null;
  status?: 'draft' | 'approved' | 'superseded' | 'pending_approval';
}

interface RevisionSelectorProps {
  templateId: string;
  currentRevision: string;
  onRevisionChange: (revision: string) => void;
  onCompareRevisions?: () => void;
  disabled?: boolean;
  hasUnsavedChanges?: boolean;
  onSaveChanges?: () => Promise<void>;
  onCommitRevision?: () => Promise<void>;
}

export default function RevisionSelector({
  templateId,
  currentRevision,
  onRevisionChange,
  onCompareRevisions,
  disabled = false,
  hasUnsavedChanges = false,
  onSaveChanges,
  onCommitRevision
}: RevisionSelectorProps) {
  const [revisions, setRevisions] = React.useState<RevisionItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [changeLog, setChangeLog] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const loadRevisionHistory = React.useCallback(async () => {
    if (typeof window === 'undefined') return; // Prevent SSR fetch
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/assets/${encodeURIComponent(templateId)}/revisions`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load revisions (${res.status})`);
      const json = await res.json();
      setRevisions(json.revisions || []);
    } catch (error) {
      console.error('Error loading revision history:', error);
      toast.error('Failed to load revision history');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  React.useEffect(() => {
    loadRevisionHistory();
  }, [loadRevisionHistory]);

  const handleCreateRevision = async () => {
    if (!changeLog.trim()) {
      toast.error('Change log is required');
      return;
    }

    if (hasUnsavedChanges) {
      toast.error('Please save your changes before creating a new revision');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/v1/assets/${encodeURIComponent(templateId)}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage: changeLog })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Failed to create new revision');
      } else {
        toast.success('New revision created successfully');
        setCreateDialogOpen(false);
        setChangeLog('');
        await loadRevisionHistory();
      }
    } catch (error) {
      console.error('Error creating revision:', error);
      toast.error('Failed to create new revision');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!onSaveChanges) return;
    setSaving(true);
    try {
      await onSaveChanges();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRevisionStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="ml-2">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="ml-2">Pending</Badge>;
      case 'superseded':
        return <Badge variant="outline" className="ml-2">Superseded</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">Draft</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-3">
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Unsaved changes</span>
        </div>
      )}

      {hasUnsavedChanges && onSaveChanges && (
        <Button variant="outline" size="sm" onClick={handleSaveChanges} disabled={saving || disabled}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={disabled || loading}>
            <History className="w-4 h-4 mr-2" />
            Revision {currentRevision}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Revision History</div>
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading revisions...</div>
          ) : revisions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No revisions found</div>
          ) : (
            revisions.map((revision) => (
              <DropdownMenuItem key={revision.id} onClick={() => onRevisionChange(String(revision.version))} className="flex flex-col items-start py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Revision {revision.version}</span>
                  {getRevisionStatusBadge(revision.status)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatDate(revision.created_at)}</div>
                {revision.commit_message && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{revision.commit_message}</div>
                )}
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={hasUnsavedChanges} className="text-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create New Revision
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Revision</DialogTitle>
                <DialogDescription>
                  This will create a new revision of the template. Please describe the changes you&apos;ve made.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="changeLog">Change Log *</Label>
                  <Textarea id="changeLog" placeholder="Describe the changes made in this revision..." value={changeLog} onChange={(e) => setChangeLog(e.target.value)} rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setCreateDialogOpen(false); setChangeLog(''); }} disabled={creating}>Cancel</Button>
                  <Button onClick={handleCreateRevision} disabled={creating || !changeLog.trim()}>
                    <GitCommit className="w-4 h-4 mr-2" />
                    {creating ? 'Creating...' : 'Create Revision'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {onCompareRevisions && revisions.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCompareRevisions}>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Revisions
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!hasUnsavedChanges && onCommitRevision && (
        <Button size="sm" onClick={onCommitRevision} disabled={disabled}>
          <GitCommit className="w-4 h-4 mr-2" />
          Commit as New Revision
        </Button>
      )}
    </div>
  );
}
