"use client";

import * as React from 'react';
import { ChevronDown, ChevronRight, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmbeddedTable {
  title: string;
  source?: string;
  columns: string[];
  rows: string[][];
  footer?: string;
}

interface EmbeddedTableRendererProps {
  tables: EmbeddedTable[];
  className?: string;
}

/**
 * Renders embedded specification tables within acceptance criteria.
 * Tables are collapsible to save space in the ITP view.
 */
export function EmbeddedTableRenderer({ tables, className }: EmbeddedTableRendererProps) {
  const [expandedTables, setExpandedTables] = React.useState<Set<number>>(new Set([0])); // First table expanded by default

  if (!tables || tables.length === 0) return null;

  const toggleTable = (index: number) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      {tables.map((table, index) => {
        const isExpanded = expandedTables.has(index);
        
        return (
          <div 
            key={index} 
            className="border border-gray-200 rounded-md overflow-hidden bg-gray-50"
          >
            {/* Table Header - Clickable to expand/collapse */}
            <button
              onClick={() => toggleTable(index)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-150 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <Table2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-gray-800">{table.title}</span>
              </div>
              {table.source && (
                <span className="text-xs text-gray-500">{table.source}</span>
              )}
            </button>

            {/* Table Content */}
            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-blue-50 border-b border-gray-200">
                      {table.columns.map((col, colIndex) => (
                        <th 
                          key={colIndex}
                          className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex}
                        className={cn(
                          "border-b border-gray-100",
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        )}
                      >
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-3 py-1.5 text-gray-700 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Table Footer */}
                {table.footer && (
                  <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-600 italic">
                    {table.footer}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Parses acceptance criteria text and extracts any inline table notation.
 * Supports the pipe-delimited format: "Header1 | Header2\nValue1 | Value2"
 */
export function parseInlineTable(text: string): { text: string; tables: EmbeddedTable[] } | null {
  // Look for table patterns in the text
  const lines = text.split('\n');
  const tables: EmbeddedTable[] = [];
  const textParts: string[] = [];
  
  let inTable = false;
  let currentTable: { title: string; rows: string[][] } | null = null;
  
  for (const line of lines) {
    // Check if line looks like a table row (contains | separators)
    if (line.includes(' | ') || line.match(/^\s*\|.*\|\s*$/)) {
      if (!inTable) {
        inTable = true;
        currentTable = { title: '', rows: [] };
      }
      
      // Parse the row
      const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
      if (cells.length > 0) {
        currentTable!.rows.push(cells);
      }
    } else {
      // Not a table row
      if (inTable && currentTable && currentTable.rows.length > 1) {
        // End of table - convert to EmbeddedTable
        const [headerRow, ...dataRows] = currentTable.rows;
        tables.push({
          title: currentTable.title || 'Specification Table',
          columns: headerRow,
          rows: dataRows,
        });
        currentTable = null;
      }
      inTable = false;
      
      // Check if this line is a table title (ends with :)
      if (line.trim().endsWith(':') && !line.includes('•')) {
        if (currentTable) {
          currentTable.title = line.trim().replace(/:$/, '');
        }
      } else {
        textParts.push(line);
      }
    }
  }
  
  // Handle table at end of text
  if (inTable && currentTable && currentTable.rows.length > 1) {
    const [headerRow, ...dataRows] = currentTable.rows;
    tables.push({
      title: currentTable.title || 'Specification Table',
      columns: headerRow,
      rows: dataRows,
    });
  }
  
  if (tables.length === 0) {
    return null;
  }
  
  return {
    text: textParts.join('\n').trim(),
    tables,
  };
}

export default EmbeddedTableRenderer;

