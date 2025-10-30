'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  data?: any
}

interface TreeProps {
  data: TreeNode[]
  renderNode: (node: TreeNode) => React.ReactNode
  className?: string
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  renderNode: (node: TreeNode) => React.ReactNode
}

function TreeNodeComponent({ node, level, renderNode }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Expand first 2 levels by default
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-50"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )
        ) : (
          <div className="w-4 h-4 mr-1" />
        )}
        {renderNode(node)}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              renderNode={renderNode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Tree({ data, renderNode, className = '' }: TreeProps) {
  return (
    <div className={`tree ${className}`}>
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          renderNode={renderNode}
        />
      ))}
    </div>
  )
}
