export type RelationshipEdgeType =
	| 'PARENT_OF' | 'PART_OF' | 'INSTANCE_OF' | 'TEMPLATE_FOR' | 'VERSION_OF' | 'SUPERSEDES' | 'ALIAS_OF'
	| 'BELONGS_TO_PROJECT' | 'LOCATED_IN_LBS' | 'COVERS_WBS' | 'APPLIES_TO' | 'MAPPED_TO' | 'RELATED_TO'
	| 'GOVERNED_BY' | 'IMPLEMENTS' | 'EVIDENCES' | 'VIOLATES' | 'SATISFIES' | 'CONSTRAINED_BY'
	| 'APPROVED_BY' | 'REVIEWED_BY' | 'OWNED_BY' | 'ASSIGNED_TO' | 'REPORTED_BY' | 'RESOLVED_BY' | 'CLOSES'
	| 'REFERENCES' | 'CITES' | 'QUOTES' | 'SUMMARIZES' | 'EXTRACTS' | 'ANNOTATES' | 'TAGS'
	| 'DEPENDS_ON' | 'BLOCKED_BY' | 'REPLACES' | 'DUPLICATES'
	| 'CONTEXT_FOR' | 'INPUT_TO' | 'OUTPUT_OF' | 'GENERATED_FROM'

export interface EdgeSpec {
	from_asset_id: string
	to_asset_id: string
	edge_type: RelationshipEdgeType
	properties?: Record<string, any>
	idempotency_key?: string
}

export interface IdempotentAssetWriteSpec {
	asset: any
	edges?: EdgeSpec[]
	idempotency_key: string
	audit_context?: Record<string, any>
}

export type WbsNodeType = 'discipline' | 'work_package' | 'activity'

export interface WbsItem {
	id: string
	name: string
	parentId?: string
	node_type: WbsNodeType
	path_key?: string
	content?: {
		inferred_scope?: string
		deliverables?: string[]
		resources?: string[]
		risks?: string[]
		acceptance_criteria?: string[]
		related_requirements?: string[]
		itp_required?: boolean
		itp_reasoning?: string
		reasoning?: string
		description?: string
	}
}
