import React from 'react'
import WbsTreeView from '@/components/features/wbs/WbsTreeView'
import { WbsItem } from '@/types/graph'

type ProjectWbsPageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectWbsPage({
  params,
}: ProjectWbsPageProps) {
  // Fetch WBS data from assets API
  const { projectId } = await params
  let wbsTreeData: WbsItem[] | null = null

  try {
    // First try to get WBS assets directly
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const assetsResponse = await fetch(`${baseUrl}/api/v1/assets?projectId=${projectId}&type=wbs_node`, {
      cache: 'no-store' // Ensure fresh data
    })

    if (assetsResponse.ok) {
      const assetsData = await assetsResponse.json()
      const wbsAssets = assetsData.assets || []

      if (wbsAssets.length > 0) {
        // Transform assets to WbsItem format
        wbsTreeData = wbsAssets.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          parentId: asset.parent_asset_id,
          node_type: asset.subtype || 'activity',
          path_key: asset.path_key,
          content: asset.content || {}
        }))
      }
    }

    // If no WBS node assets found, try WBS plan assets
    if (!wbsTreeData) {
      const planResponse = await fetch(`${baseUrl}/api/v1/assets?projectId=${projectId}&type=plan&subtype=wbs`, {
        cache: 'no-store'
      })

      if (planResponse.ok) {
        const planData = await planResponse.json()
        const wbsPlans = planData.assets || []

        if (wbsPlans.length > 0) {
          // Extract WBS nodes from plan content
          const plan = wbsPlans[0]
          const wbsNodes = plan.content?.nodes || []

          if (wbsNodes.length > 0) {
            // Transform plan WBS nodes to WbsItem format
            wbsTreeData = wbsNodes.map((node: any) => ({
              id: node.id,
              name: node.name,
              parentId: node.parentId,
              node_type: node.node_type || 'activity',
              path_key: node.path_key,
              content: {
                reasoning: node.reasoning,
                description: node.description,
                itp_required: node.itp_required,
                itp_reasoning: node.itp_reasoning,
                source_reference_uuids: node.source_reference_uuids,
                source_reference_hints: node.source_reference_hints
              }
            }))
          }
        }
      }
    }

    // If still no data, try the legacy API endpoint
    if (!wbsTreeData) {
      const legacyResponse = await fetch(`${baseUrl}/api/v1/projects/${projectId}/plans?type=wbs`, {
        cache: 'no-store'
      })

      if (legacyResponse.ok) {
        const legacyData = await legacyResponse.json()
        wbsTreeData = legacyData.wbs || null
      }
    }
  } catch (error) {
    console.error('Error fetching WBS data:', error)
    wbsTreeData = null
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Schedule & Work Breakdown Structure</h1>
        <WbsTreeView
          projectId={projectId}
          initialWbsData={wbsTreeData}
          projectName="Project"
        />
      </div>

      {/* LBS UI removed per design: Lot Register provides WBS/LBS views in one table */}
    </div>
  )
}

export const revalidate = 0
