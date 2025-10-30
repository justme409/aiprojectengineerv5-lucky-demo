'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import RowAttachmentUploader from './RowAttachmentUploader';
import { toast } from 'sonner';
import { saveAssetContent, commitAssetRevision } from '@/lib/actions/asset-actions';

const AutoResizingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, value, onChange, onBlur, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const combinedRef = ref || internalRef;

  const autoResize = useCallback(() => {
    const element = typeof combinedRef === 'function' ? null : (combinedRef as any)?.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  }, [combinedRef]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <textarea
      ref={combinedRef as any}
      className={cn('min-h-[24px] w-full resize-none overflow-hidden', className)}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        autoResize();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        autoResize();
      }}
      {...props}
    />
  );
});
AutoResizingTextarea.displayName = 'AutoResizingTextarea';

interface ItpItem {
  id: string;
  item_no: string;
  parentId: string | null;
  thinking?: string | null;
  section_name?: string | null;
  'Inspection/Test Point'?: string | null;
  'Acceptance Criteria'?: string | null;
  'Specification Clause'?: string | null;
  'Inspection/Test Method'?: string | null;
  Frequency?: string | null;
  Responsibility?: string | null;
  'Hold/Witness Point'?: string | null;
  attachments?: any[] | null;
  // Database field names (snake_case)
  inspection_test_point?: string | null;
  acceptance_criteria?: string | null;
  specification_clause?: string | null;
  inspection_test_method?: string | null;
  hold_witness_point?: string | null;
  frequency?: string | null;
  responsibility?: string | null;
}

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
}

function EditableCellInner({ value, onChange, placeholder, disabled }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);

  useEffect(() => {
    setCellValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (cellValue !== value) {
      onChange(cellValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.metaKey) {
      handleBlur();
    }
  };

  if (!isEditing) {
    return (
      <div
        className="w-full min-h-[24px] cursor-text whitespace-pre-wrap py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 transition-colors"
        onClick={() => !disabled && setIsEditing(true)}
      >
        {cellValue || <span className="text-gray-400 italic">{placeholder || 'Click to edit'}</span>}
      </div>
    );
  }

  return (
    <AutoResizingTextarea
      className="w-full h-auto bg-transparent border-0 focus:ring-0 resize-none overflow-hidden"
      value={cellValue}
      onChange={(e) => setCellValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  );
}

interface TemplateData {
  id: string;
  name: string | null;
  version: string | null;
  status: string | null;
  content?: ItpItem[] | { items?: ItpItem[]; [key: string]: any };
}

export function ItpTemplateEditorEnhanced({
  templateData,
  projectId,
  templateId,
  onDataChange,
  disabled = false,
}: {
  templateData: TemplateData;
  projectId: string;
  templateId: string;
  onDataChange?: (hasChanges: boolean, data: TemplateData) => void;
  disabled?: boolean;
}) {
  const [data, setData] = useState(templateData);
  const [originalData, setOriginalData] = useState(templateData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [rowAttachments, setRowAttachments] = useState<Record<string, any[]>>({});

  const [columnSizingState, setColumnSizingState] = useState<Record<string, number>>(() => {
    try {
      if (typeof window === 'undefined') return {} as any;
      const saved = window.localStorage.getItem('itpTableSizingPreferences');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {} as any;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (Object.keys(columnSizingState as any).length > 0) {
      window.localStorage.setItem('itpTableSizingPreferences', JSON.stringify(columnSizingState));
    }
  }, [columnSizingState]);

  useEffect(() => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
    onDataChange?.(hasChanges, data);
  }, [data, originalData, onDataChange]);

  const rows = React.useMemo(() => {
    if (!data.content) return [] as any[];
    const contentObj = data.content as any;

    // Extract items from the correct path: content.itp_items
    let items: ItpItem[] = [];
    if (Array.isArray(contentObj.itp_items)) {
      items = contentObj.itp_items as ItpItem[];
    } else if (Array.isArray(contentObj.items)) {
      items = contentObj.items as ItpItem[];
    } else if (Array.isArray(contentObj)) {
      // Fallback: direct array
      items = contentObj as ItpItem[];
    }

    return items.map((item, index) => ({
      id: item.id,
      isSection: item.parentId === null,
      item: {
        ...item,
        // Map database field names to display field names
        'Inspection/Test Point': (item as any)['Inspection/Test Point'] ?? item.inspection_test_point ?? '',
        'Acceptance Criteria': (item as any)['Acceptance Criteria'] ?? item.acceptance_criteria ?? '',
        'Specification Clause': (item as any)['Specification Clause'] ?? item.specification_clause ?? '',
        'Inspection/Test Method': (item as any)['Inspection/Test Method'] ?? item.inspection_test_method ?? '',
        'Hold/Witness Point': (item as any)['Hold/Witness Point'] ?? item.hold_witness_point ?? '',
        Frequency: (item as any)['Frequency'] ?? item.frequency ?? '',
        Responsibility: (item as any)['Responsibility'] ?? item.responsibility ?? '',
      },
      originalIndex: index,
    }));
  }, [data]);

  const updateItemById = useCallback((itemId: string, updater: (prev: ItpItem) => ItpItem) => {
    setData(prevData => {
      if (!prevData.content) return prevData;

      const contentObj = prevData.content as any;
      let items: ItpItem[] = [];

      // Get items from the correct path
      if (Array.isArray(contentObj.itp_items)) {
        items = contentObj.itp_items as ItpItem[];
      } else if (Array.isArray(contentObj.items)) {
        items = contentObj.items as ItpItem[];
      } else if (Array.isArray(contentObj)) {
        items = contentObj as ItpItem[];
      }

      const newItems = items.map(item => item.id === itemId ? updater(item) : item);

      // Update the correct path in content
      if (Array.isArray(contentObj.itp_items)) {
        return { ...prevData, content: { ...contentObj, itp_items: newItems } };
      } else if (Array.isArray(contentObj.items)) {
        return { ...prevData, content: { ...contentObj, items: newItems } };
      } else if (Array.isArray(contentObj)) {
        return { ...prevData, content: newItems };
      }

      return prevData;
    });
  }, []);

  const handleCellUpdate = useCallback((itemId: string, field: string, value: string) => {
    updateItemById(itemId, (prev) => ({ ...prev, [field]: value } as any));
  }, [updateItemById]);

  const handleAttachmentChange = useCallback((rowId: string, attachments: any[]) => {
    setRowAttachments(prev => {
      const current = prev[rowId] || [];
      if (JSON.stringify(current) === JSON.stringify(attachments)) {
        return prev;
      }
      return { ...prev, [rowId]: attachments };
    });
    setHasUnsavedChanges(true);

    // Update the item with attachments
    updateItemById(rowId, (prev) => ({ ...prev, attachments } as any));
  }, [updateItemById]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Preserve original content shape: if object with itp_items, update itp_items; if array, save array
      const contentForSave = Array.isArray(data.content)
        ? data.content
        : data.content && typeof data.content === 'object'
          ? data.content
          : [];
      const result = await saveAssetContent(templateId, projectId, contentForSave as any);

      if (result.success) {
        setOriginalData(data);
        setHasUnsavedChanges(false);
        toast.success('Changes saved successfully');
      } else {
        toast.error((result as any).message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  }, [data, projectId, templateId]);

  const handleCommit = useCallback(async () => {
    if (hasUnsavedChanges) {
      toast.error('Please save your changes before creating a new revision');
      return;
    }

    const changeLog = prompt('Enter a description of the changes for this revision:');
    if (!changeLog?.trim()) {
      toast.error('Change log is required to create a new revision');
      return;
    }

    setCommitting(true);
    try {
      const result = await commitAssetRevision({
        assetId: templateId,
        projectId,
        commitMessage: changeLog.trim(),
        isApproval: false,
      });

      if ((result as any).success) {
        toast.success('New revision created successfully');
      } else {
        toast.error((result as any).error || 'Failed to create new revision');
      }
    } catch (error) {
      console.error('Commit error:', error);
      toast.error('An unexpected error occurred while creating revision');
    } finally {
      setCommitting(false);
    }
  }, [hasUnsavedChanges, projectId, templateId]);

  useEffect(() => {
    const onSave = async () => {
      await handleSave();
    };
    const onCommit = async () => {
      await handleCommit();
    };
    document.addEventListener('itp:save', onSave as EventListener);
    document.addEventListener('itp:commit', onCommit as EventListener);
    return () => {
      document.removeEventListener('itp:save', onSave as EventListener);
      document.removeEventListener('itp:commit', onCommit as EventListener);
    };
  }, [handleSave, handleCommit]);

  const columnHelper = createColumnHelper<any>();

  const EditableCell = ({ value, onChange, placeholder }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cellValue, setCellValue] = useState(value || '');

    useEffect(() => {
      setCellValue(value || '');
    }, [value]);

    const handleBlur = () => {
      setIsEditing(false);
      onChange(cellValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
      if (e.key === 'Escape') {
        setCellValue(value || '');
        setIsEditing(false);
      }
    };

    if (disabled) {
      return (
        <div className="w-full min-h-[24px] whitespace-pre-wrap py-1 text-gray-500">
          {cellValue || <span className="text-gray-400 italic">No data</span>}
        </div>
      );
    }

    if (isEditing) {
      return (
        <AutoResizingTextarea
          className="w-full h-auto bg-transparent border-0 focus:ring-0 resize-none overflow-hidden"
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    }

    return (
      <div
        className="w-full min-h-[24px] cursor-text whitespace-pre-wrap py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 transition-colors"
        onClick={() => !disabled && setIsEditing(true)}
      >
        {cellValue || <span className="text-gray-400 italic">{placeholder || 'Click to edit'}</span>}
      </div>
    );
  };

  const columns = React.useMemo(() => [
    columnHelper.accessor('id', {
      id: 'itemNo',
      header: 'Item No.',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return row.item.item_no;
      },
      size: 80,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'inspectionPoint',
      header: 'Inspection/Test Point',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item['Inspection/Test Point'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Inspection/Test Point', value)}
            placeholder="Enter inspection/test point"
          />
        );
      },
      size: 250,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'acceptanceCriteria',
      header: 'Acceptance Criteria',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item['Acceptance Criteria'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Acceptance Criteria', value)}
            placeholder="Enter acceptance criteria"
          />
        );
      },
      size: 300,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'specificationClause',
      header: 'Specification/Clause',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item['Specification Clause'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Specification Clause', value)}
            placeholder="Enter specification"
          />
        );
      },
      size: 200,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'inspectionTestMethod',
      header: 'Inspection/Test Method',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item['Inspection/Test Method'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Inspection/Test Method', value)}
            placeholder="Enter method"
          />
        );
      },
      size: 150,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'frequency',
      header: 'Frequency',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item.Frequency || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Frequency', value)}
            placeholder="Enter frequency"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'responsibility',
      header: 'Responsibility',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item.Responsibility || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Responsibility', value)}
            placeholder="Enter responsibility"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'holdWitness',
      header: 'Hold/Witness Point',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <EditableCell
            value={row.item['Hold/Witness Point'] || ''}
            onChange={(value) => handleCellUpdate(row.id, 'Hold/Witness Point', value)}
            placeholder="Enter hold/witness point"
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
    columnHelper.accessor('id', {
      id: 'attachments',
      header: 'Attachments',
      cell: info => {
        const row = info.row.original;
        if (row.isSection) return null;
        return (
          <RowAttachmentUploader
            templateId={templateId}
            rowId={row.id}
            projectId={projectId}
            onAttachmentsChange={(attachments) => handleAttachmentChange(row.id, attachments)}
            disabled={disabled}
          />
        );
      },
      size: 120,
      enableResizing: true,
    }),
  ], [columnHelper, EditableCell, handleCellUpdate, handleAttachmentChange, templateId, projectId, disabled]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnSizing: columnSizingState,
    },
    onColumnSizingChange: (updater) => {
      if (typeof window === 'undefined') return // Prevent hydration issues
      const next = typeof updater === 'function' ? (updater as any)(columnSizingState) : updater
      // normalize widths to integers to avoid SSR hydration diffs
      const normalized: Record<string, number> = {}
      Object.entries(next || {}).forEach(([k, v]) => { normalized[k] = Math.round(Number(v) || 0) })
      setColumnSizingState(normalized)
    },
    defaultColumn: {
      minSize: 80,
      maxSize: 1000,
      size: 150,
    },
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  });

  const isSectionRow = (row: any) => row.original.isSection;

  return (
    <div className="bg-background rounded-lg shadow-sm w-full">
      <table
        className="w-full border-collapse"
        style={{
          width: typeof window !== 'undefined' ? Number(table.getTotalSize() || 0) : 1460,
          minWidth: '100%'
        }}
        data-resizing={typeof window !== 'undefined' ? (Object.keys((table as any).getState().columnSizingInfo || {}).length > 0).toString() : 'false'}
      >
        <thead>
          <tr>
            {table.getFlatHeaders().map(header => (
              <th
                key={header.id}
                className="bg-blue-700 dark:bg-muted text-white dark:text-primary-foreground font-medium border-r border-blue-600/20 dark:border-border text-left"
                style={{
                  width: typeof window !== 'undefined' ? header.getSize() : 120,
                  position: 'relative',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  padding: '0.375rem 1rem',
                  height: '32px'
                }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanResize() && (
                  <div
                    onMouseDown={typeof window !== 'undefined' ? header.getResizeHandler() : undefined}
                    onTouchStart={typeof window !== 'undefined' ? header.getResizeHandler() : undefined}
                    className={`absolute top-0 right-0 h-full w-5 cursor-col-resize select-none touch-none z-10 ${typeof window !== 'undefined' && header.column.getIsResizing() ? 'bg-blue-500 dark:bg-accent resizing' : 'bg-blue-900 dark:bg-secondary opacity-0 hover:opacity-100'}`}
                    data-resizer
                    title="Resize column"
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            if (isSectionRow(row)) {
              return (
                <tr key={row.id} className="section-row">
                  <td colSpan={columns.length} className="bg-muted font-semibold py-3 px-4 border-b dark:border-border dark:bg-[#252526]" style={{ fontSize: '0.875rem', fontFamily: 'inherit' }}>
                    {row.original.item.section_name}
                  </td>
                </tr>
              );
            }
            return (
              <tr
                key={row.id}
                className={cn(
                  'hover:bg-muted/50 dark:hover:bg-[#2a2d2e] transition-colors',
                  typeof window !== 'undefined' && row.original.originalIndex % 2 === 0
                    ? 'bg-background dark:bg-[#1e1e1e]'
                    : 'bg-muted/30 dark:bg-[#202020]'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="align-top border-r dark:border-border px-4 py-3" style={{ verticalAlign: 'top', height: '100%', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <style jsx>{`
        .cursor-col-resize { cursor: col-resize !important; }
        table { border-spacing: 0; table-layout: fixed; }
        .react-table-resizing { cursor: col-resize; }
        table[data-resizing="true"] * { user-select: none; }
        [data-resizer].resizing::after { content: ''; position: absolute; right: 0; top: 0; height: 100vh; width: 2px; background-color: var(--accent, #0e639c); z-index: 1; }
        th:hover [data-resizer] { opacity: 0.5 !important; }
        [data-resizer]:hover { opacity: 1 !important; background-color: var(--primary, #3b82f6) !important; }
        [data-resizer] { position: absolute; right: 0; top: 0; height: 100%; width: 5px; cursor: col-resize; user-select: none; touch-action: none; }
        th, td { box-sizing: border-box; position: relative; overflow: hidden; white-space: normal; }
        tbody tr { min-height: fit-content; height: auto; }
        td { min-height: 100%; height: auto; }
        textarea { font-size: 0.875rem; font-family: inherit; line-height: 1.5; background-color: transparent; color: inherit; }
        :global(.dark) textarea { color: var(--foreground); background-color: transparent; }
        :global(.dark) table { color: var(--foreground); }
        :global(.dark) th, :global(.dark) td { border-color: var(--border); }
        :global(.dark) .section-row td { background-color: #252526; color: white; }
        :global(.dark) tbody tr:nth-child(even) td { background-color: #1e1e1e; }
        :global(.dark) tbody tr:nth-child(odd) td { background-color: #202020; }
        :global(.dark) tbody tr:hover td { background-color: #2a2d2e; }
        :global(.dark) thead th { background-color: #252526; color: white; }
        :global(.dark) textarea:focus { background-color: rgba(14, 99, 156, 0.1); }
      `}</style>
    </div>
  );
}

export default ItpTemplateEditorEnhanced;
