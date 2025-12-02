'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Save, X, Loader2, ChevronDown, ChevronRight, GitCommit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PlanSectionWithChildren } from '@/lib/management-plans/plan-utils';

interface SectionEditorProps {
  section: PlanSectionWithChildren;
  onUpdate: (sectionId: string, updates: Partial<PlanSectionWithChildren>) => void;
  depth?: number;
}

function SectionEditor({ section, onUpdate, depth = 0 }: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [localBody, setLocalBody] = useState(section.body || '');

  // Dynamic import for TinyMCE editor
  const TinyMCEEditor = useMemo(
    () =>
      dynamic<any>(
        () => import('@tinymce/tinymce-react').then((m) => m.Editor as unknown as React.ComponentType<any>),
        { ssr: false }
      ),
    []
  );

  const handleHeadingChange = (value: string) => {
    onUpdate(section.id!, { heading: value });
  };

  const handleHeadingNumberChange = (value: string) => {
    onUpdate(section.id!, { headingNumber: value });
  };

  const handleBodySave = () => {
    onUpdate(section.id!, { body: localBody });
    setIsEditingBody(false);
  };

  const handleBodyCancel = () => {
    setLocalBody(section.body || '');
    setIsEditingBody(false);
  };

  return (
    <Card className={cn('mb-4', depth > 0 && 'ml-6 border-l-4 border-l-muted')}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={section.headingNumber || ''}
              onChange={(e) => handleHeadingNumberChange(e.target.value)}
              className="w-16 h-8 text-sm font-mono"
              placeholder="#"
            />
            <Input
              value={section.heading || ''}
              onChange={(e) => handleHeadingChange(e.target.value)}
              className="flex-1 h-8 font-semibold"
              placeholder="Section heading..."
            />
          </div>

          <span className="text-xs text-muted-foreground">
            Level {section.level}
          </span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4">
          {/* Body Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Content</Label>
              {!isEditingBody && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingBody(true)}
                >
                  Edit Content
                </Button>
              )}
            </div>

            {isEditingBody ? (
              <div className="space-y-2">
                {TinyMCEEditor && (
                  <TinyMCEEditor
                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
                    value={localBody}
                    onEditorChange={(content: string) => setLocalBody(content)}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: 'table lists link',
                      toolbar:
                        'undo redo | bold italic underline | bullist numlist | link | table',
                      license_key: 'gpl',
                      valid_elements: '*[*]',
                      content_style: `
                        body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.6; }
                        table{border-collapse:collapse;width:100%}
                        th,td{border:1px solid #d1d5db;padding:0.5rem}
                        ul,ol{margin:0;padding-left:1.25rem}
                      `,
                      promotion: false,
                      branding: false,
                    }}
                  />
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBodySave}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBodyCancel}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'prose prose-sm max-w-none p-3 rounded border bg-muted/30 min-h-[60px]',
                  '[&_table]:w-full [&_table]:border-collapse',
                  '[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted/50',
                  '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1',
                )}
                dangerouslySetInnerHTML={{ __html: section.body || '<em class="text-muted-foreground">No content</em>' }}
              />
            )}
          </div>

          {/* Nested sections */}
          {section.children.length > 0 && (
            <div className="mt-4">
              {section.children.map((child) => (
                <SectionEditor
                  key={child.id}
                  section={child}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export interface PlanSectionEditorProps {
  projectId: string;
  planType: string;
  planId: string;
  sections: PlanSectionWithChildren[];
  planTitle: string;
  planVersion: string;
  onClose: () => void;
  onSaved: () => void;
}

export function PlanSectionEditor({
  projectId,
  planType,
  planId,
  sections: initialSections,
  planTitle,
  planVersion,
  onClose,
  onSaved,
}: PlanSectionEditorProps) {
  const [sections, setSections] = useState<PlanSectionWithChildren[]>(initialSections);
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<PlanSectionWithChildren>>>(new Map());
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(planTitle);
  const [currentVersion, setCurrentVersion] = useState(planVersion);

  const hasChanges = pendingChanges.size > 0 || editingTitle !== planTitle;

  const handleSectionUpdate = useCallback((sectionId: string, updates: Partial<PlanSectionWithChildren>) => {
    // Update local state
    const updateSectionInTree = (items: PlanSectionWithChildren[]): PlanSectionWithChildren[] => {
      return items.map((item) => {
        if (item.id === sectionId) {
          return { ...item, ...updates };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateSectionInTree(item.children) };
        }
        return item;
      });
    };
    setSections(updateSectionInTree(sections));

    // Track pending changes
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(sectionId) || {};
      next.set(sectionId, { ...existing, ...updates });
      return next;
    });
  }, [sections]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save plan metadata (title) if changed
      if (editingTitle !== planTitle) {
        await fetch(
          `/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/update`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editingTitle }),
          }
        );
      }

      // Save each changed section
      for (const [sectionId, updates] of pendingChanges.entries()) {
        await fetch(
          `/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/sections/${encodeURIComponent(sectionId)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }
        );
      }

      setPendingChanges(new Map());
      onSaved();
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  };

  const handleCommitRevision = async () => {
    setCommitting(true);
    try {
      // First save any pending changes
      if (hasChanges) {
        await handleSave();
      }

      // Then commit a new revision (increment version)
      const res = await fetch(
        `/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/commit`,
        { method: 'POST' }
      );
      
      if (res.ok) {
        const data = await res.json();
        if (data.version) {
          setCurrentVersion(data.version);
        }
        onSaved();
      }
    } catch (err) {
      console.error('Failed to commit revision:', err);
    }
    setCommitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b pb-4 -mx-4 px-4 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Document Title</Label>
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="text-lg font-semibold h-10"
              placeholder="Plan title..."
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Version {currentVersion}
            </span>
            <Button
              onClick={handleSave}
              disabled={saving || committing || !hasChanges}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={handleCommitRevision}
              disabled={saving || committing}
              title="Save changes and create a new revision"
            >
              {committing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GitCommit className="h-4 w-4 mr-2" />
              )}
              Commit Revision
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving || committing}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        {hasChanges && (
          <p className="text-xs text-amber-600 mt-2">
            You have unsaved changes
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.length > 0 ? (
          sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onUpdate={handleSectionUpdate}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sections found for this plan.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

