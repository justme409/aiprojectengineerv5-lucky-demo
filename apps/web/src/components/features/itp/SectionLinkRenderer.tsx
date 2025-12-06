"use client";

import * as React from 'react';
import { ExternalLink, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionLink {
  /** Display text for the link (e.g., "RD-EW-C1 Clause 9.1") */
  label: string;
  /** Document number in Standards DB */
  documentNumber: string;
  /** Section semantic_id for lookup */
  sectionId: string;
  /** Section heading number (e.g., "9.1") */
  headingNumber?: string;
}

interface SectionLinkRendererProps {
  links: SectionLink[];
  className?: string;
}

interface Subsection {
  heading: string;
  headingNumber: string;
  text: string;
  semanticId: string;
}

interface SectionContent {
  heading: string;
  headingNumber: string;
  text: string;
  documentName: string;
  subsections: Subsection[];
}

/**
 * Renders clickable links to source specification sections.
 * When clicked, fetches and displays the section content (including subsections) in a modal.
 */
export function SectionLinkRenderer({ links, className }: SectionLinkRendererProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedLink, setSelectedLink] = React.useState<SectionLink | null>(null);
  const [sectionContent, setSectionContent] = React.useState<SectionContent | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSubsections, setExpandedSubsections] = React.useState<Set<string>>(new Set());

  if (!links || links.length === 0) return null;

  const toggleSubsection = (semanticId: string) => {
    setExpandedSubsections(prev => {
      const next = new Set(prev);
      if (next.has(semanticId)) {
        next.delete(semanticId);
      } else {
        next.add(semanticId);
      }
      return next;
    });
  };

  const expandAllSubsections = () => {
    if (sectionContent?.subsections) {
      setExpandedSubsections(new Set(sectionContent.subsections.map(s => s.semanticId)));
    }
  };

  const collapseAllSubsections = () => {
    setExpandedSubsections(new Set());
  };

  const fetchSectionContent = async (link: SectionLink) => {
    setLoading(true);
    setError(null);
    setSectionContent(null);
    setExpandedSubsections(new Set());

    try {
      // Call API to fetch section content from Neo4j Standards DB
      const response = await fetch('/api/standards/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber: link.documentNumber,
          sectionId: link.sectionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch section content');
      }

      const data = await response.json();
      setSectionContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (link: SectionLink) => {
    setSelectedLink(link);
    setModalOpen(true);
    fetchSectionContent(link);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLink(null);
    setSectionContent(null);
    setError(null);
    setExpandedSubsections(new Set());
  };

  return (
    <>
      <div className={cn("flex flex-wrap gap-1", className)}>
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => handleLinkClick(link)}
            className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
            title={`View ${link.label} section content`}
          >
            <span>{link.label}</span>
            <ExternalLink className="h-2 w-2 opacity-40" />
          </button>
        ))}
      </div>

      {/* Section Content Modal */}
      {modalOpen && selectedLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[85vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedLink.label}</h3>
                {sectionContent && (
                  <p className="text-xs text-gray-500">{sectionContent.documentName}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-60px)]">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-500">Loading section content...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-2">{error}</p>
                  <button
                    onClick={() => fetchSectionContent(selectedLink)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {sectionContent && (
                <div className="prose prose-sm max-w-none">
                  {/* Main Section */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {sectionContent.headingNumber && `${sectionContent.headingNumber} `}
                    {sectionContent.heading}
                  </h4>
                  {sectionContent.text && sectionContent.text.trim() ? (
                    <div
                      className="text-gray-700 whitespace-pre-wrap mb-4"
                      dangerouslySetInnerHTML={{ __html: sectionContent.text }}
                    />
                  ) : (
                    <p className="text-gray-400 italic mb-4">
                      This section contains no additional text content. See subsections below for details.
                    </p>
                  )}

                  {/* Subsections */}
                  {sectionContent.subsections && sectionContent.subsections.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-gray-700">
                          Subsections ({sectionContent.subsections.length})
                        </h5>
                        <div className="flex gap-2">
                          <button
                            onClick={expandAllSubsections}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Expand all
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={collapseAllSubsections}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Collapse all
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {sectionContent.subsections.map((sub) => (
                          <div
                            key={sub.semanticId}
                            className="border rounded-md overflow-hidden"
                          >
                            <button
                              onClick={() => toggleSubsection(sub.semanticId)}
                              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                              {expandedSubsections.has(sub.semanticId) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium text-gray-800">
                                {sub.headingNumber && `${sub.headingNumber} `}
                                {sub.heading}
                              </span>
                            </button>

                            {expandedSubsections.has(sub.semanticId) && (
                              <div className="px-3 py-2 border-t bg-white">
                                {sub.text && sub.text.trim() ? (
                                  <div
                                    className="text-sm text-gray-700 whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: sub.text }}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    No text content in this subsection.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Parses the sectionLinksJson string into SectionLink array.
 */
export function parseSectionLinks(json: string | null | undefined): SectionLink[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is SectionLink =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.label === 'string' &&
          typeof item.documentNumber === 'string' &&
          typeof item.sectionId === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

export default SectionLinkRenderer;


