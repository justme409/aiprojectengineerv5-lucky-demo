"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-05'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-05</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <div class="overflow-x-auto">
    <table class="min-w-full border border-collapse">
      <tbody>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Inspection & Test Record</td></tr>
        <tr>
          <td class="border p-2 font-bold">Project:</td><td class="border p-2" colspan="3"></td>
        </tr>
        <tr>
          <td class="border p-2 font-bold">ITP Reference:</td><td class="border p-2"></td>
          <td class="border p-2 font-bold">Lot / Location:</td><td class="border p-2"></td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border p-2 font-bold">Inspection/Test Item</td>
          <td class="border p-2 font-bold">Specification/Criteria</td>
          <td class="border p-2 font-bold">Result (Pass/Fail)</td>
          <td class="border p-2 font-bold">Comments/Reference</td>
        </tr>
        <tr><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2"></td></tr>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Sign-off</td></tr>
        <tr>
          <td class="border p-2 font-bold">Inspected By:</td><td class="border p-2"></td>
          <td class="border p-2 font-bold">Date:</td><td class="border p-2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`

function TemplateInitializer() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(DOC_ID)}/fetch`)
      if (!mounted) return
      if (!res.ok) return
      const json = await res.json()
      const existing = (json?.content?.html || json?.content?.body || '').trim()
      if (!existing) {
        await fetch(`/api/v1/qse/docs/${encodeURIComponent(DOC_ID)}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: defaultHtml }),
        })
      }
    })()
    return () => { mounted = false }
  }, [])
  return null
}

export default function QualityInspectionTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Quality Inspection / ITP Record Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Quality Inspection / ITP Record Template"
        description="Standard record for inspections and tests with sign-off."
        defaultExpanded
      />
    </div>
  )
}


