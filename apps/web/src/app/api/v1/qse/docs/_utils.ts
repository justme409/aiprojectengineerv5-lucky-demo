import { pool } from '@/lib/db'

type QseAssetRow = {
  id: string
  asset_uid: string
  name: string | null
  document_number: string | null
  content: any
  metadata: any
  type: string
  subtype: string | null
}

type QseAssetClassification = {
  type: string
  subtype: string | null
  category: string
}

const FIND_QSE_ASSET_SQL = `
  SELECT
    id,
    asset_uid,
    name,
    document_number,
    content,
    metadata,
    type,
    subtype
  FROM public.asset_heads
  WHERE
    organization_id = $1
    AND (
      document_number = $2
      OR metadata->>'document_number' = $2
      OR name = $2
    )
  ORDER BY
    (document_number = $2) DESC,
    (metadata->>'document_number' = $2) DESC,
    (name = $2) DESC,
    updated_at DESC
  LIMIT 1
`

const DOC_CODE_CLASSIFICATION: Record<string, QseAssetClassification> = {
  MAN: { type: 'document', subtype: 'manual', category: 'manual' },
  POL: { type: 'policy', subtype: null, category: 'policy' },
  PROC: { type: 'procedure', subtype: null, category: 'procedure' },
  REG: { type: 'record', subtype: 'register', category: 'register' },
  FORM: { type: 'form', subtype: null, category: 'form' },
  TEMP: { type: 'document', subtype: 'template', category: 'template' },
  PLAN: { type: 'plan', subtype: null, category: 'plan' },
  STMT: { type: 'document', subtype: 'statement', category: 'statement' },
  STAT: { type: 'document', subtype: 'statement', category: 'statement' },
  SCHED: { type: 'plan', subtype: 'schedule', category: 'schedule' },
}

function normalizeDocId(docId: string): string {
  return docId.trim().toUpperCase()
}

export async function findQseAssetByDocId(organizationId: string, docId: string) {
  const normalizedId = normalizeDocId(docId)
  const result = await pool.query<QseAssetRow>(FIND_QSE_ASSET_SQL, [organizationId, normalizedId])
  return result.rows[0] ?? null
}

export function classifyQseAsset(docId: string): QseAssetClassification {
  const normalizedId = normalizeDocId(docId)
  const parts = normalizedId.split('-')
  const baseCode = parts[2] ?? ''
  const extendedCode = [baseCode, parts[3]].filter(Boolean).join('-')

  if (DOC_CODE_CLASSIFICATION[extendedCode]) {
    return DOC_CODE_CLASSIFICATION[extendedCode]
  }

  if (DOC_CODE_CLASSIFICATION[baseCode]) {
    return DOC_CODE_CLASSIFICATION[baseCode]
  }

  return { type: 'document', subtype: null, category: 'document' }
}

export function buildMetadataPatch(docId: string, classification: QseAssetClassification) {
  return {
    document_number: normalizeDocId(docId),
    qse_doc: {
      code: normalizeDocId(docId),
      category: classification.category,
    },
  }
}

export function resolveAssetName(docId: string, currentName?: string | null) {
  if (currentName && currentName.trim().length > 0) {
    return currentName
  }
  return normalizeDocId(docId)
}
