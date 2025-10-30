"use client"

import { useState } from "react";
import { ChevronRight, Brain } from "lucide-react";
import clsx from "clsx";
import { GraphRAGChatPanel } from "./GraphRAGChatPanel";

export function KnowledgeAssistantSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={clsx(
        "fixed top-14 right-0 bottom-0 bg-background border-l transition-all duration-300 ease-in-out z-40 flex flex-col shadow-lg",
        isExpanded ? "w-96" : "w-12"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center h-12 border-b hover:bg-accent transition-colors"
        title={isExpanded ? "Collapse assistant" : "Expand assistant"}
      >
        {isExpanded ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </button>

      {/* Chat panel container */}
      <div className={clsx(
        "flex-1 overflow-hidden",
        !isExpanded && "hidden"
      )}>
        <GraphRAGChatPanel />
      </div>
    </aside>
  );
}

