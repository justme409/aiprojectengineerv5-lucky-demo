"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-04'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-04</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <p>This form is to be completed for all personnel prior to commencing work on site.</p>
  <div class="overflow-x-auto">
    <table class="min-w-full border border-collapse">
      <tbody>
        <tr class="bg-gray-100"><td colspan="2" class="border p-2 font-bold text-center">Site Induction Record</td></tr>
        <tr><td class="border p-2 font-bold">Personnel Name:</td><td class="border p-2"></td></tr>
        <tr><td class="border p-2 font-bold">Company:</td><td class="border p-2"></td></tr>
        <tr class="bg-gray-100"><td colspan="2" class="border p-2 font-bold">Verification Checklist</td></tr>
        <tr><td>Corporate Induction Complete?</td><td class="border p-2 text-center">Y / N</td></tr>
        <tr><td>Construction Induction (White Card) Sighted?</td><td class="border p-2 text-center">Y / N</td></tr>
        <tr><td>Relevant Licenses / VOCs Sighted?</td><td class="border p-2 text-center">Y / N</td></tr>
        <tr class="bg-gray-100"><td colspan="2" class="border p-2 font-bold">Site-Specific Topics Covered</td></tr>
        <tr><td colspan="2" class="border p-2 h-24 align-top">1. Todays Activities & Coordination:<br/>2. Key Safety Risks for Today:<br/>3. Environmental Considerations:</td></tr>
        <tr class="bg-gray-100"><td colspan="2" class="border p-2 font-bold">Declaration</td></tr>
        <tr><td colspan="2" class="border p-2">I have received and understood the site induction, and I agree to comply with all site safety and environmental rules.</td></tr>
        <tr><td class="border p-2 font-bold">Signature:</td><td class="border p-2"></td></tr>
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

export default function SiteInductionTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Site Induction & Training Record Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Site Induction & Training Record Template"
        description="Record format for site induction, verification checks, and declarations."
        defaultExpanded
      />
    </div>
  )
}


