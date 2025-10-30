'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  X, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Paperclip,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface RowAttachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url?: string;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadProgress?: number;
}

interface RowAttachmentUploaderProps {
  rowId: string; // UUID for the specific ITP row
  templateId: string;
  projectId: string;
  existingAttachments?: RowAttachment[];
  onAttachmentsChange?: (attachments: RowAttachment[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  compact?: boolean; // For table cell display
}

export default function RowAttachmentUploader({
  rowId,
  templateId,
  projectId,
  existingAttachments = [],
  onAttachmentsChange,
  disabled = false,
  maxFiles = 3,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  compact = true
}: RowAttachmentUploaderProps) {
  const [attachments, setAttachments] = React.useState<RowAttachment[]>(existingAttachments);
  const [uploading, setUploading] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const apiBase = `/api/v1`;

  // Load attachments from graph edges for this row
  const loadAttachments = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/assets/${templateId}/attachments?rowId=${encodeURIComponent(rowId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load attachments (${res.status})`);
      const data = await res.json();
      const mapped: RowAttachment[] = (data.attachments || []).map((a: any) => ({
        id: a.id,
        filename: a.file_name || a.name,
        size: a.size ?? 0,
        type: a.content_type || a.type || 'application/octet-stream',
        uploadStatus: 'completed',
        uploadProgress: 100,
      }));
      setAttachments(mapped);
    } catch (e) {
      // Silent fail
    }
  }, [apiBase, templateId, rowId]);

  React.useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  // Update attachments when external changes occur (only if actually different)
  React.useEffect(() => {
    const currentIds = attachments.map(a => a.id).sort();
    const externalIds = existingAttachments.map(a => a.id).sort();
    if (JSON.stringify(currentIds) !== JSON.stringify(externalIds)) {
      setAttachments(existingAttachments);
    }
  }, [existingAttachments, attachments]);

  // Notify parent of attachment changes
  const previousAttachmentsRef = React.useRef<RowAttachment[]>(existingAttachments);
  React.useEffect(() => {
    const isExternalChange = JSON.stringify(attachments) === JSON.stringify(existingAttachments);
    const isDifferentFromPrevious = JSON.stringify(attachments) !== JSON.stringify(previousAttachmentsRef.current);
    if (!isExternalChange && isDifferentFromPrevious && onAttachmentsChange) {
      onAttachmentsChange(attachments);
      previousAttachmentsRef.current = attachments;
    }
  }, [attachments, onAttachmentsChange, existingAttachments]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: RowAttachment[] = [];

    for (const file of fileArray) {
      if (attachments.length + validFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed per row`);
        break;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`File ${file.name} is too large. Maximum size is ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`);
        continue;
      }
      validFiles.push({
        id: crypto.randomUUID(),
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadStatus: 'pending'
      });
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      startUpload(validFiles, fileArray.filter((_, index) => index < validFiles.length));
    }
  };

  const startUpload = async (filesToUpload: RowAttachment[], actualFiles: File[]) => {
    if (filesToUpload.length === 0) return;

    setUploading(true);
    try {
      // Request SAS URLs
      const sasRes = await fetch(`${apiBase}/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(templateId)}/attachments/sas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames: filesToUpload.map(f => f.filename), rowId })
      });
      const sasJson = await sasRes.json();
      if (!sasRes.ok || !sasJson.uploads) {
        toast.error(sasJson.error || 'Failed to generate upload URLs');
        setAttachments(prev => prev.map(att =>
          filesToUpload.find(f => f.id === att.id) ? { ...att, uploadStatus: 'failed' } : att
        ));
        return;
      }

      const uploadPromises = filesToUpload.map(async (fileInfo, index) => {
        const actualFile = actualFiles[index];
        const uploadInfo = sasJson.uploads.find((u: any) => u.filename === fileInfo.filename);
        if (!uploadInfo) throw new Error(`No upload URL found for ${fileInfo.filename}`);

        setAttachments(prev => prev.map(att => att.id === fileInfo.id ? { ...att, uploadStatus: 'uploading' } : att));
        return uploadFileToAzure(fileInfo, actualFile, uploadInfo.uploadUrl);
      });

      const uploadResults = await Promise.allSettled(uploadPromises);

      const completedFiles: { filename: string; size: number; type: string }[] = [];
      uploadResults.forEach((result, index) => {
        const fileInfo = filesToUpload[index];
        if (result.status === 'fulfilled') {
          setAttachments(prev => prev.map(att => att.id === fileInfo.id ? { ...att, uploadStatus: 'completed', uploadProgress: 100 } : att));
          completedFiles.push({ filename: fileInfo.filename, size: fileInfo.size, type: fileInfo.type });
        } else {
          console.error(`Failed to upload ${fileInfo.filename}:`, (result as any).reason);
          setAttachments(prev => prev.map(att => att.id === fileInfo.id ? { ...att, uploadStatus: 'failed' } : att));
        }
      });

      if (completedFiles.length > 0) {
        const notifyRes = await fetch(`${apiBase}/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(templateId)}/attachments/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: completedFiles, rowId })
        });
        const notifyJson = await notifyRes.json();
        if (notifyRes.ok) {
          toast.success(`Successfully uploaded ${completedFiles.length} file(s)`);
          await loadAttachments();
        } else {
          toast.warning(notifyJson.error || 'Files uploaded but failed to update records');
        }
      }

      if (completedFiles.length < filesToUpload.length) {
        toast.error(`${filesToUpload.length - completedFiles.length} file(s) failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      setAttachments(prev => prev.map(att => filesToUpload.find(f => f.id === att.id) ? { ...att, uploadStatus: 'failed' } : att));
    } finally {
      setUploading(false);
    }
  };

  const uploadFileToAzure = async (fileInfo: RowAttachment, file: File, uploadUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setAttachments(prev => prev.map(att => att.id === fileInfo.id ? { ...att, uploadProgress: percentComplete } : att));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.send(file);
    });
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      const res = await fetch(`${apiBase}/assets/${encodeURIComponent(templateId)}/attachments/${encodeURIComponent(attachmentId)}?rowId=${encodeURIComponent(rowId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An unexpected error occurred while deleting');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx':
      case 'doc': return '📝';
      case 'xlsx':
      case 'xls': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  };

  if (compact) {
    return (
      <div className="w-full">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {attachments.slice(0, 2).map((attachment) => (
              <Badge 
                key={attachment.id} 
                variant="secondary" 
                className="text-xs cursor-pointer flex items-center"
                onClick={() => setUploadDialogOpen(true)}
              >
                <span className="mr-1">{getFileIcon(attachment.filename)}</span>
                {attachment.filename.length > 10 ? attachment.filename.substring(0, 10) + '...' : attachment.filename}
              </Badge>
            ))}
            {attachments.length > 2 && (
              <Badge variant="outline" className="text-xs">+{attachments.length - 2} more</Badge>
            )}
          </div>
        )}

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={disabled || uploading}
              className="w-full h-8 text-xs"
            >
              <Paperclip className="w-3 h-3 mr-1" />
              {attachments.length > 0 ? `${attachments.length}/${maxFiles}` : 'Add Files'}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Row Attachments</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Attached Files</h4>
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(attachment.filename)}</span>
                        <div>
                          <p className="text-sm font-medium">{attachment.filename}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="px-2"><Eye className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" className="px-2"><Download className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)} className="px-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {attachments.length < maxFiles && (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">Add files to this row</p>
                  <p className="text-xs text-gray-500 mb-2">Max {maxFiles} files, {(maxSizeBytes / 1024 / 1024).toFixed(1)}MB each</p>
                  <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>Browse Files</Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(attachment.filename)}</span>
                <div>
                  <p className="text-sm font-medium">{attachment.filename}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading || attachments.length >= maxFiles} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Files ({attachments.length}/{maxFiles})
      </Button>
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
    </div>
  );
}

