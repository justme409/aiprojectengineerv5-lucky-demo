"use client";

import * as React from 'react';
import { ChevronDown, ChevronRight, ImageIcon, ExternalLink, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface EmbeddedFigure {
  figureId: string;
  title: string;
  url: string;
  source?: string;
  caption?: string;
}

interface EmbeddedFigureRendererProps {
  figures: EmbeddedFigure[];
  className?: string;
}

/**
 * Renders embedded figures from standards within acceptance criteria.
 * Figures are collapsible and can be opened in a modal for detailed viewing.
 */
export function EmbeddedFigureRenderer({ figures, className }: EmbeddedFigureRendererProps) {
  const [expandedFigures, setExpandedFigures] = React.useState<Set<number>>(new Set([0]));
  const [modalImage, setModalImage] = React.useState<EmbeddedFigure | null>(null);
  const [imageErrors, setImageErrors] = React.useState<Set<number>>(new Set());

  if (!figures || figures.length === 0) return null;

  const toggleFigure = (index: number) => {
    setExpandedFigures(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <>
      <div className={cn("mt-2 space-y-2", className)}>
        {figures.map((figure, index) => {
          const isExpanded = expandedFigures.has(index);
          const hasError = imageErrors.has(index);
          
          return (
            <div 
              key={index} 
              className="border border-amber-200 rounded-md overflow-hidden bg-amber-50"
            >
              {/* Figure Header - Clickable to expand/collapse */}
              <button
                onClick={() => toggleFigure(index)}
                className="w-full flex items-center justify-between px-3 py-2 bg-amber-100 hover:bg-amber-150 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-amber-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-amber-600" />
                  )}
                  <ImageIcon className="h-4 w-4 text-amber-700" />
                  <span className="font-medium text-sm text-gray-800">
                    {figure.figureId}: {figure.title}
                  </span>
                </div>
                {figure.source && (
                  <span className="text-xs text-amber-700">{figure.source}</span>
                )}
              </button>

              {/* Figure Content */}
              {isExpanded && (
                <div className="p-3 bg-white">
                  {hasError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <p className="text-sm">Failed to load figure</p>
                      <a 
                        href={figure.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Open in new tab <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={figure.url}
                        alt={figure.title}
                        className="max-w-full h-auto rounded border border-gray-200 cursor-pointer"
                        onError={() => handleImageError(index)}
                        onClick={() => setModalImage(figure)}
                      />
                      <button
                        onClick={() => setModalImage(figure)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View full size"
                      >
                        <ZoomIn className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  
                  {/* Caption */}
                  {figure.caption && (
                    <p className="mt-2 text-xs text-gray-600 italic text-center">
                      {figure.caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full-size Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setModalImage(null)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
              <div>
                <h3 className="font-medium text-gray-800">
                  {modalImage.figureId}: {modalImage.title}
                </h3>
                {modalImage.source && (
                  <p className="text-xs text-gray-500">{modalImage.source}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={modalImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4 text-gray-600" />
                </a>
                <button
                  onClick={() => setModalImage(null)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 font-bold"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-60px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-w-full h-auto"
              />
            </div>
            {modalImage.caption && (
              <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-600 italic text-center">
                {modalImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EmbeddedFigureRenderer;

