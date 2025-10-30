"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-OHSMP'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-OHSMP</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> [Enter Date]</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Project Information</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Project Name:</td><td class="border p-2">[Enter Project Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Project Manager:</td><td class="border p-2">[Enter Project Manager]</td></tr>
        <tr><td class="border p-2 font-semibold">Safety Manager:</td><td class="border p-2">[Enter Safety Manager]</td></tr>
        <tr><td class="border p-2 font-semibold">Principal Contractor:</td><td class="border p-2">[Enter Principal Contractor]</td></tr>
        <tr><td class="border p-2 font-semibold">Commencement Date:</td><td class="border p-2">[Enter Start Date]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">2.0 Health & Safety Policy & Objectives</h3>
  <p><strong>WHS Policy:</strong> [Reference corporate WHS Policy QSE-5.2-POL-01]</p>
  <p><strong>Project Safety Objectives:</strong></p>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Safety Objective</th>
          <th class="border p-2 text-left">Target</th>
          <th class="border p-2 text-left">Measurement</th>
          <th class="border p-2 text-left">Responsible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter safety objective]</td>
          <td class="border p-2">[Enter quantified target]</td>
          <td class="border p-2">[Enter measurement method]</td>
          <td class="border p-2">[Enter responsible party]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">3.0 Hazard Identification & Risk Assessment</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Activity/Task</th>
          <th class="border p-2 text-left">Hazard</th>
          <th class="border p-2 text-left">Risk Rating</th>
          <th class="border p-2 text-left">Control Measures</th>
          <th class="border p-2 text-left">SWMS Required</th>
          <th class="border p-2 text-left">Linked Lot IDs</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter activity]</td>
          <td class="border p-2">[Enter hazard]</td>
          <td class="border p-2">[High/Medium/Low]</td>
          <td class="border p-2">[Enter control measures]</td>
          <td class="border p-2">[Yes/No]</td>
          <td class="border p-2">[Link to Lot Register IDs]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">4.0 Safety Management Systems</h3>
  <ul>
    <li><strong>Pre-Start Meetings:</strong> Daily safety briefings using digital forms (QSE-8.1-TEMP-PRESTART)</li>
    <li><strong>SWMS Management:</strong> Safe Work Method Statements for high-risk activities (QSE-8.1-TEMP-SWMS)</li>
    <li><strong>Incident Reporting:</strong> Digital incident reporting through the system's NCR module</li>
    <li><strong>Safety Inspections:</strong> Regular safety inspections recorded in the inspection register</li>
    <li><strong>Toolbox Talks:</strong> Weekly safety meetings with attendance tracked in the system</li>
  </ul>
  <h3 class="mt-8 mb-4">5.0 Emergency Response</h3>
  <ul>
    <li>Medical emergencies and injuries</li>
    <li>Fire and explosion</li>
    <li>Structural collapse</li>
    <li>Confined space incidents</li>
    <li>Chemical exposure</li>
  </ul>
  <h3 class="mt-8 mb-4">6.0 Training & Competence</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Training Type</th>
          <th class="border p-2 text-left">Target Audience</th>
          <th class="border p-2 text-left">Frequency</th>
          <th class="border p-2 text-left">Record Location</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">Site Safety Induction</td>
          <td class="border p-2">All site personnel</td>
          <td class="border p-2">Before site entry</td>
          <td class="border p-2">Training register in system</td>
        </tr>
        <tr>
          <td class="border p-2">[Enter additional training]</td>
          <td class="border p-2">[Enter target audience]</td>
          <td class="border p-2">[Enter frequency]</td>
          <td class="border p-2">[Enter record location]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">7.0 Consultation & Communication</h3>
  <ul>
    <li>Health & Safety Representative (HSR) involvement</li>
    <li>Safety committee meetings</li>
    <li>Toolbox talk feedback sessions</li>
    <li>Incident investigation participation</li>
  </ul>
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

export default function OhsmpTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Occupational Health & Safety Management Plan (OHSMP) Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="OHS Management Plan (OHSMP) Template"
        description="Project safety management planning template and systems overview."
        defaultExpanded
      />
    </div>
  )
}


