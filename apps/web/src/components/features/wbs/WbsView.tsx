'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WbsNode {
  id: string
  name: string
  path_key: string
  type: string
  description?: string
  children?: WbsNode[]
}

interface WbsViewProps {
  projectId: string
}

export default function WbsView({ projectId }: WbsViewProps) {
  const [wbsData, setWbsData] = useState<WbsNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const fetchWbsData = useCallback(async () => {
    try {
      // First try to get the WBS plan asset directly
      const assetResponse = await fetch(`/api/v1/assets?projectId=${projectId}&type=plan`)
      if (assetResponse.ok) {
        const assetData = await assetResponse.json()
        const wbsAsset = assetData.assets?.find((asset: any) => asset.subtype === 'wbs')

        if (wbsAsset && wbsAsset.content?.nodes) {
          setWbsData(wbsAsset.content.nodes)
          setLoading(false)
          return
        }
      }

      // Fallback to the original API call
      const response = await fetch(`/api/v1/projects/${projectId}/plans?type=wbs`)
      if (response.ok) {
        const data = await response.json()
        setWbsData(data.wbs || [])
      }
    } catch (error) {
      console.error('Error fetching WBS data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchWbsData()
  }, [fetchWbsData])

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: WbsNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <div key={node.id} className="w-full">
        <div
          className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
            level === 0 ? 'border-primary' : 'border-gray-300'
          }`}
          style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <svg
              className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {!hasChildren && <div className="w-4 h-4 mr-2" />}

          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{node.name}</span>
              <span className="ml-2 text-sm text-gray-500">({node.path_key})</span>
            </div>
            {node.description && (
              <p className="text-sm text-gray-600 mt-1">{node.description}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button variant="outline" size="sm">
              Add Child
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Work Breakdown Structure</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Add Root Node
        </Button>
      </div>

      {wbsData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS structure yet</h3>
          <p className="text-gray-500 mb-6">Create your work breakdown structure to organize project deliverables.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create WBS
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project WBS Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {wbsData.map(node => renderNode(node))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}