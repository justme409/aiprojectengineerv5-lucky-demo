"use client";

import * as React from 'react';
import { ExternalLink, X, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IMSLink {
  /** Display text for the link (e.g., "NCR Procedure") */
  label: string;
  /** QSE identifier (e.g., "QSE-10.2-PROC-01") */
  imsId: string;
  /** Full title of the IMS document */
  title?: string;
  /** URL path for linking (e.g., "/ims/ncr/ncr-procedure") */
  path: string;
}

interface IMSLinkRendererProps {
  links: IMSLink[];
  className?: string;
}

interface IMSDocumentContent {
  id: string;
  title: string;
  type: string;
  category?: string;
  isoClause?: string;
  html: string;
}

/**
 * Renders clickable links to IMS (Integrated Management System) procedures.
 * When clicked, fetches and displays the procedure content in a modal.
 */
export function IMSLinkRenderer({ links, className }: IMSLinkRendererProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedLink, setSelectedLink] = React.useState<IMSLink | null>(null);
  const [documentContent, setDocumentContent] = React.useState<IMSDocumentContent | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!links || links.length === 0) return null;

  const fetchDocumentContent = async (link: IMSLink) => {
    setLoading(true);
    setError(null);
    setDocumentContent(null);

    try {
      // Call API to fetch IMS document content
      const response = await fetch('/api/ims/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imsId: link.imsId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IMS document content');
      }

      const data = await response.json();
      setDocumentContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (link: IMSLink) => {
    setSelectedLink(link);
    setModalOpen(true);
    fetchDocumentContent(link);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLink(null);
    setDocumentContent(null);
    setError(null);
  };

  return (
    <>
      <div className={cn("mt-4 pt-3 border-t border-border/50", className)}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Referenced IMS Procedures</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-md border border-primary/20 hover:border-primary/40 cursor-pointer transition-colors"
              title={`View ${link.title || link.label}`}
            >
              <span>{link.label}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* IMS Document Content Modal */}
      {modalOpen && selectedLink && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div 
            className="relative bg-background rounded-lg shadow-xl max-w-4xl max-h-[85vh] w-full overflow-hidden border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground truncate">
                    {selectedLink.title || selectedLink.label}
                  </h3>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedLink.imsId}
                  </span>
                  {documentContent?.category && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                      {documentContent.category}
                    </span>
                  )}
                  {documentContent?.isoClause && (
                    <span className="text-xs text-muted-foreground">
                      ISO Clause: {documentContent.isoClause}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-full transition-colors shrink-0 ml-4"
                title="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading document content...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-16">
                  <p className="text-destructive mb-3">{error}</p>
                  <button
                    onClick={() => fetchDocumentContent(selectedLink)}
                    className="text-sm text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {documentContent && (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {documentContent.html && documentContent.html.trim() ? (
                    <div 
                      className="text-foreground"
                      dangerouslySetInnerHTML={{ __html: documentContent.html }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">
                      This document has no content available. Please contact your QSE administrator.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {documentContent && (
              <div className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Document Type: {documentContent.type || 'Procedure'}
                </span>
                <a
                  href={`https://projectpro.pro${selectedLink.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Open in IMS
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Parses the imsLinksJson string into IMSLink array.
 */
export function parseIMSLinks(json: string | null | undefined): IMSLink[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is IMSLink =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.label === 'string' &&
          typeof item.imsId === 'string' &&
          typeof item.path === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

export default IMSLinkRenderer;

