"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-9.3-MIN-TEMPLATE'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-9.3-MIN-TEMPLATE</div>
    <div class="border p-3"><span class="font-semibold">Meeting Date:</span> [Enter Meeting Date]</div>
    <div class="border p-3"><span class="font-semibold">Location:</span> [Enter Meeting Location/Platform]</div>
  </div>
  <h3 class="text-center mt-8 mb-4">Management Review Meeting Minutes</h3>
  <p><strong>Attendees:</strong> [Enter Attendee Names and Roles]</p>
  <h4 class="mt-6 mb-2">1.0 Review of Previous Actions</h4>
  <p>[Enter status of previous management review actions]</p>
  <h4 class="mt-6 mb-2">2.0 QSE Performance Dashboard Review</h4>
  <ul>
    <li><strong>Safety:</strong> [LTIFR, incident trends]</li>
    <li><strong>Environment:</strong> [Incidents, waste metrics]</li>
    <li><strong>Quality:</strong> [Customer satisfaction, NCRs]</li>
    <li><strong>System Integration:</strong> [User adoption, automation effectiveness]</li>
  </ul>
  <h4 class="mt-6 mb-2">3.0 New Actions</h4>
  <div class="overflow-x-auto">
    <table class="min-w-full border">
      <thead><tr class="bg-gray-50"><th class="border p-2">Action ID</th><th class="border p-2">Action</th><th class="border p-2">Responsible</th><th class="border p-2">Due Date</th><th class="border p-2">Priority</th></tr></thead>
      <tbody>
        <tr>
          <td class="border p-2">[Auto]</td>
          <td class="border p-2">[Enter Action Description]</td>
          <td class="border p-2">[Enter Responsible]</td>
          <td class="border p-2">[Enter Due Date]</td>
          <td class="border p-2">[Priority]</td>
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

export default function ReviewMinutesTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Management Review Meeting Minutes Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Management Review Meeting Minutes Template"
        description="Template for recording management review meetings, decisions, and actions."
        defaultExpanded
      />
    </div>
  )
}


