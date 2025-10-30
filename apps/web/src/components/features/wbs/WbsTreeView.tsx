'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { Card, CardContent } from '@/components/ui/card'
import { WbsItem } from '@/types/graph'

// Simplified node structure for D3
interface D3HierarchyNode {
  name: string
  id: string
  type: 'project' | 'discipline' | 'work_package' | 'activity' | 'unknown'
  data: WbsItem
  children?: D3HierarchyNode[]
  _children?: D3HierarchyNode[]
}

// Define props for the client component
interface WbsTreeViewProps {
  projectId: string
  initialWbsData: WbsItem[] | null
  projectName?: string
}

const buildTreeFromAdjacencyList = (items: WbsItem[]): D3HierarchyNode | null => {
  if (!items || items.length === 0) {
    return null
  }

  const itemMap = new Map<string, D3HierarchyNode>()
  let root: D3HierarchyNode | null = null

  // First pass: create D3HierarchyNode for each item and map them by id
  items.forEach(item => {
    const d3Node: D3HierarchyNode = {
      id: item.id,
      name: item.name,
      type: item.node_type || 'unknown',
      data: item,
      children: [], // Initialize children array
    }
    itemMap.set(item.id, d3Node)
  })

  // Second pass: link children to their parents
  items.forEach(item => {
    if (item.parentId) {
      const parentNode = itemMap.get(item.parentId)
      const childNode = itemMap.get(item.id)
      if (parentNode && childNode) {
        // Ensure children array exists
        if (!parentNode.children) {
          parentNode.children = []
        }
        parentNode.children.push(childNode)
      }
    } else {
      // This is a root node
      root = itemMap.get(item.id) ?? null
    }
  })

  // Clean up empty children arrays to avoid rendering leaf nodes as expandable
  itemMap.forEach(node => {
      if (node.children && node.children.length === 0) {
          node.children = undefined
      }
  })

  return root
}

export default function WbsTreeView({
  projectId,
  initialWbsData,
  projectName = 'Project'
}: WbsTreeViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transformedData, setTransformedData] = useState<D3HierarchyNode | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  const transformWbsToD3Hierarchy = (rawApiData: WbsItem[] | null): D3HierarchyNode | null => {
    console.log("Raw WBS Data received (adjacency list):", rawApiData)

    if (!rawApiData || !Array.isArray(rawApiData) || rawApiData.length === 0) {
      console.warn("Initial WBS data is not a valid array or is empty:", rawApiData)
      return null
    }

    const rootNode = buildTreeFromAdjacencyList(rawApiData)
    console.log("Transformed D3 Hierarchy Data:", rootNode)
    return rootNode
  }

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes(prevCollapsed => {
      const newCollapsed = new Set(prevCollapsed)
      if (newCollapsed.has(nodeId)) {
        newCollapsed.delete(nodeId)
      } else {
        newCollapsed.add(nodeId)
      }
      return newCollapsed
    })
  }

  useEffect(() => {
    if (initialWbsData && !transformedData) {
      const transformed = transformWbsToD3Hierarchy(initialWbsData)
      if (transformed) {
        setTransformedData(transformed)
      } else {
        console.error("Failed to transform WBS data. Data structure incompatible.")
      }
    }

    if (!transformedData || !svgRef.current) {
      if (initialWbsData === null && !transformedData) {
        // Will show empty state message below
      }
      return
    }

    // D3 rendering logic
    const width = 1200
    const nodeWidth = 200
    const verticalSpacing = 30
    const horizontalDepthSpacing = 180

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const clonedData = JSON.parse(JSON.stringify(transformedData))

    const processData = (node: D3HierarchyNode): D3HierarchyNode => {
      if (node.children && node.children.length > 0) {
        if (collapsedNodes.has(node.id)) {
          node._children = node.children
          node.children = undefined
        } else {
          node.children.forEach(child => processData(child))
        }
      }
      return node
    }

    const processedRootData = processData(clonedData)
    const root = d3.hierarchy(processedRootData)

    const dx = verticalSpacing
    const dy = horizontalDepthSpacing
    const treeLayout = d3.tree<D3HierarchyNode>().nodeSize([dx, dy])
    treeLayout(root)

    let x0 = Infinity
    let x1 = -Infinity
    root.each(d => {
      if (d.x !== undefined) {
        if (d.x < x0) x0 = d.x
        if (d.x > x1) x1 = d.x
      }
    })

    const effectiveX0 = isFinite(x0) ? x0 : 0
    const effectiveX1 = isFinite(x1) ? x1 : dx

    const svgHeight = (effectiveX1 - effectiveX0 + dx * 2)
    const maxDepth = root.height > 0 ? root.height : 1
    const svgWidth = (maxDepth + 1) * dy + nodeWidth

    svg.attr("width", svgWidth)
       .attr("height", svgHeight)
       .attr("viewBox", [-dy / 2, effectiveX0 - dx, svgWidth, svgHeight])
       .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)

    // Links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("d", d3.linkHorizontal<any, d3.HierarchyPointNode<D3HierarchyNode>>()
            .x(d => d.y!)
            .y(d => d.x!)
        )

    // Nodes
    const nodeGroup = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)

    // Node circles with color coding based on type
    nodeGroup.append("circle")
        .attr("fill", d => {
          const isCollapsed = d.data._children && d.data._children.length > 0
          switch (d.data.type) {
            case 'project': return isCollapsed ? '#f44336' : '#8B5CF6'
            case 'discipline': return isCollapsed ? '#ff9800' : '#4CAF50'
            case 'work_package': return isCollapsed ? '#9c27b0' : '#10B981'
            case 'activity': return '#9E9E9E'
            default: return '#757575'
          }
        })
        .attr("r", 3.5)
        .style("cursor", d => (d.children || d.data._children) ? "pointer" : "default")
        .on("click", (event, dNode: d3.HierarchyNode<D3HierarchyNode>) => {
          if (dNode.children || dNode.data._children) {
            if (typeof dNode.data.id === 'string' && dNode.data.id) {
               toggleNode(dNode.data.id)
            }
            event.stopPropagation()
          }
        })

    // ITP indicator for work packages that require ITP
    nodeGroup.filter(d => d.data.type === 'work_package' && d.data.data?.content?.itp_required === true)
        .append("circle")
        .attr("r", 1.5)
        .attr("fill", "#059669")

    // Node labels
    nodeGroup.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children || d.data._children ? -10 : 10)
        .attr("text-anchor", d => d.children || d.data._children ? "end" : "start")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white")

    // Tooltips
    nodeGroup.append("title")
        .text(dNode => {
          const nodeDisplayInfo = dNode.data
          const originalElementData = nodeDisplayInfo.data

          let tooltip = `${nodeDisplayInfo.type.charAt(0).toUpperCase() + nodeDisplayInfo.type.slice(1)}: ${nodeDisplayInfo.name}`

          if (originalElementData.content?.reasoning) tooltip += `\nReasoning: ${originalElementData.content.reasoning}`

          if (nodeDisplayInfo.type === 'work_package') {
            if (originalElementData.content?.description) tooltip += `\nDescription: ${originalElementData.content.description}`
            if (originalElementData.content?.itp_required !== undefined) {
              tooltip += `\nITP Required: ${originalElementData.content.itp_required ? 'Yes' : 'No'}`
            }
            if (originalElementData.content?.itp_reasoning) tooltip += `\nITP Reasoning: ${originalElementData.content.itp_reasoning}`
          } else {
            const childrenCount = dNode.children?.length || nodeDisplayInfo._children?.length || 0
            tooltip += `\nChildren: ${childrenCount}`
          }

          return tooltip
        })

  }, [initialWbsData, transformedData, collapsedNodes])

  return (
    <div className="container mx-auto py-0">
      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-auto">
          <div className="min-w-full">
             {transformedData ? (
                <svg ref={svgRef}></svg>
             ) : (
                <p className='p-4 text-center text-gray-500'>
                  {initialWbsData === undefined ? 'Loading WBS data...' : initialWbsData === null ? 'No WBS data found for this project.' : 'Processing WBS data...'}
                </p>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
