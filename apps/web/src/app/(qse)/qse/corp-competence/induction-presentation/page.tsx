"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-7.2-TEMP-01'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-7.2-TEMP-01</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> B</div>
    <div class="border p-3"><span class="font-semibold">Last Updated:</span> 24/07/2024</div>
    <div class="border p-3"><span class="font-semibold">Developer:</span> [HR Manager]</div>
    <div class="border p-3"><span class="font-semibold">Duration:</span> 4 Hours (Corporate)</div>
    <div class="border p-3"><span class="font-semibold">Next Review:</span> 24/07/2025</div>
  </div>
  <h3 class="text-center text-xl font-bold mt-8 mb-4">Corporate Induction Program Outline</h3>
  <h4 class="mt-6 mb-4 font-bold">Module 1: Welcome to [Company Name] (45 minutes)</h4>
  <ul>
    <li><strong>Welcome Address</strong></li>
    <li><strong>Our History & Values</strong></li>
    <li><strong>Organizational Structure</strong></li>
    <li><strong>Our Operations</strong></li>
  </ul>
  <h4 class="mt-6 mb-4 font-bold">Module 2: Our Integrated Management System (IMS) (60 minutes)</h4>
  <ul>
    <li><strong>What is the IMS?</strong></li>
    <li><strong>Our QSE Policy</strong></li>
    <li><strong>Your Role in the IMS</strong></li>
    <li><strong>The 'Stop Work' Authority</strong></li>
  </ul>
  <h3 class="mt-8 mb-4">Induction Record & Follow-up Template</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Employee Name</th>
          <th class="border p-2 text-left">Position</th>
          <th class="border p-2 text-left">Induction Date</th>
          <th class="border p-2 text-left">Assessment Score</th>
          <th class="border p-2 text-left">30-Day Check Status</th>
          <th class="border p-2 text-left">Mentor Assigned</th>
          <th class="border p-2 text-left">System ID</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter Employee Name]</td>
          <td class="border p-2">[Enter Position]</td>
          <td class="border p-2">[Enter Induction Date]</td>
          <td class="border p-2">[Enter Assessment Score %]</td>
          <td class="border p-2">[Enter Check Status]</td>
          <td class="border p-2">[Enter Mentor Name]</td>
          <td class="border p-2">[Auto-generated System ID]</td>
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

export default function InductionPresentationTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Employee Induction Presentation Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Employee Induction Presentation Template"
        description="Standard induction program covering corporate requirements and culture."
        defaultExpanded
      />
    </div>
  )
}


