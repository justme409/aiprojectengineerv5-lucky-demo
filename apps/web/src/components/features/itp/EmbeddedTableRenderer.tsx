"use client";

import * as React from 'react';
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
 * Clean document-style tables without collapsible UI.
 */
export function EmbeddedTableRenderer({ tables, className }: EmbeddedTableRendererProps) {
  if (!tables || tables.length === 0) return null;

  return (
    <div className={cn("mt-2 space-y-3", className)}>
      {tables.map((table, index) => (
        <div key={index} className="text-xs">
          {/* Simple title */}
          {table.title && (
            <div className="font-semibold text-gray-700 mb-1">
              {table.title}
              {table.source && (
                <span className="font-normal text-gray-500 ml-1">({table.source})</span>
              )}
            </div>
          )}

          {/* Table */}
          <table className="w-full border-collapse border border-gray-300">
                  <thead>
              <tr>
                      {table.columns.map((col, colIndex) => (
                        <th 
                          key={colIndex}
                    className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700 bg-gray-100"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                      className="border border-gray-300 px-2 py-1 text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
          {/* Footer note */}
                {table.footer && (
            <div className="text-[10px] text-gray-500 italic mt-1">
                    {table.footer}
                  </div>
                )}
              </div>
      ))}
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

