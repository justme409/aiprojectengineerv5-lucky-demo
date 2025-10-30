"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-03'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-03</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <div class="overflow-x-auto">
    <table class="min-w-full border border-collapse">
      <tbody>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Pre-start / Toolbox Talk Record</td></tr>
        <tr>
          <td class="border p-2 font-bold">Project:</td><td class="border p-2"></td>
          <td class="border p-2 font-bold">Date:</td><td class="border p-2"></td>
        </tr>
        <tr>
          <td class="border p-2 font-bold">Location:</td><td class="border p-2"></td>
          <td class="border p-2 font-bold">Conducted By:</td><td class="border p-2"></td>
        </tr>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Topics Discussed</td></tr>
        <tr><td colspan="4" class="border p-2 h-24 align-top">1. Todays Activities & Coordination:<br/>2. Key Safety Risks for Today:<br/>3. Environmental Considerations:</td></tr>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Issues Raised & Actions</td></tr>
        <tr><td colspan="4" class="border p-2 h-24 align-top"></td></tr>
        <tr class="bg-gray-100"><td colspan="4" class="border p-2 font-bold text-center">Attendees</td></tr>
        <tr>
          <td class="border p-2 font-bold">#</td>
          <td class="border p-2 font-bold">Name (print)</td>
          <td class="border p-2 font-bold">Company</td>
          <td class="border p-2 font-bold">Signature</td>
        </tr>
        <tr><td class="border p-2">1</td><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2"></td></tr>
        <tr><td class="border p-2">2</td><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2"></td></tr>
      </tbody>
    </table>
  </div>
</div>`

function TemplateInitializer() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const res = await fetch(`/api/qse/${encodeURIComponent(DOC_ID)}/fetch`)
      if (!mounted) return
      if (!res.ok) return
      const json = await res.json()
      const existing = (json?.content?.html || json?.content?.body || '').trim()
      if (!existing) {
        await fetch(`/api/qse/${encodeURIComponent(DOC_ID)}/save`, {
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

export default function PreStartTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Pre-start Meeting / Toolbox Talk Record Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Pre-start Meeting / Toolbox Talk Record Template"
        description="Daily briefing record capturing topics, issues, and attendees."
        defaultExpanded
      />
    </div>
  )
}


