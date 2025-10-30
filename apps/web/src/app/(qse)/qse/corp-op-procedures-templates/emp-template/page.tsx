"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-EMP'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-EMP</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> [Enter Date]</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Project Information</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Project Name:</td><td class="border p-2">[Enter Project Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Location:</td><td class="border p-2">[Enter Project Location]</td></tr>
        <tr><td class="border p-2 font-semibold">Environmental Manager:</td><td class="border p-2">[Enter Environmental Manager]</td></tr>
        <tr><td class="border p-2 font-semibold">Approval Authority:</td><td class="border p-2">[Enter Approval Authority]</td></tr>
        <tr><td class="border p-2 font-semibold">EMP Approval Date:</td><td class="border p-2">[Enter Approval Date]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">2.0 Environmental Policy & Objectives</h3>
  <p><strong>Environmental Policy:</strong> [Reference corporate Environmental Policy QSE-5.2-POL-01]</p>
  <p><strong>Project Environmental Objectives:</strong></p>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Environmental Objective</th>
          <th class="border p-2 text-left">Target</th>
          <th class="border p-2 text-left">Monitoring Method</th>
          <th class="border p-2 text-left">Responsible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter environmental objective]</td>
          <td class="border p-2">[Enter quantified target]</td>
          <td class="border p-2">[Enter monitoring/measurement method]</td>
          <td class="border p-2">[Enter responsible party]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">3.0 Environmental Aspects & Impacts Register</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Activity</th>
          <th class="border p-2 text-left">Environmental Aspect</th>
          <th class="border p-2 text-left">Environmental Impact</th>
          <th class="border p-2 text-left">Significance</th>
          <th class="border p-2 text-left">Control Measures</th>
          <th class="border p-2 text-left">Linked Lot IDs</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter activity/work package]</td>
          <td class="border p-2">[Enter environmental aspect]</td>
          <td class="border p-2">[Enter potential impact]</td>
          <td class="border p-2">[High/Medium/Low]</td>
          <td class="border p-2">[Enter control measures]</td>
          <td class="border p-2">[Link to Lot Register IDs]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">4.0 Legal & Other Requirements</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Permit/Approval</th>
          <th class="border p-2 text-left">Authority</th>
          <th class="border p-2 text-left">Key Conditions</th>
          <th class="border p-2 text-left">Expiry Date</th>
          <th class="border p-2 text-left">Compliance Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter permit name]</td>
          <td class="border p-2">[Enter issuing authority]</td>
          <td class="border p-2">[Enter key conditions]</td>
          <td class="border p-2">[Enter expiry date]</td>
          <td class="border p-2">[Compliant/Non-Compliant]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">5.0 Environmental Controls & Procedures</h3>
  <ul>
    <li><strong>Erosion & Sediment Control:</strong> [Enter specific controls for site]</li>
    <li><strong>Dust Management:</strong> [Enter dust control measures]</li>
    <li><strong>Noise Management:</strong> [Enter noise control measures]</li>
    <li><strong>Waste Management:</strong> [Enter waste minimization and disposal procedures]</li>
    <li><strong>Fuel & Chemical Storage:</strong> [Enter storage and handling requirements]</li>
    <li><strong>Flora & Fauna Protection:</strong> [Enter biodiversity protection measures]</li>
  </ul>
  <h3 class="mt-8 mb-4">6.0 Emergency Response Procedures</h3>
  <ul>
    <li>Chemical/fuel spills</li>
    <li>Uncontrolled sediment discharge</li>
    <li>Accidental harm to protected flora/fauna</li>
    <li>Groundwater contamination</li>
  </ul>
  <h3 class="mt-8 mb-4">7.0 Monitoring & Measurement</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Parameter</th>
          <th class="border p-2 text-left">Monitoring Method</th>
          <th class="border p-2 text-left">Frequency</th>
          <th class="border p-2 text-left">Criteria/Limits</th>
          <th class="border p-2 text-left">Responsible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter parameter - e.g., Water quality]</td>
          <td class="border p-2">[Enter monitoring method]</td>
          <td class="border p-2">[Enter frequency]</td>
          <td class="border p-2">[Enter acceptance criteria]</td>
          <td class="border p-2">[Enter responsible person]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">8.0 Training & Competence</h3>
  <ul>
    <li>Site environmental induction</li>
    <li>Spill response procedures</li>
    <li>Erosion and sediment control practices</li>
    <li>Waste segregation and disposal</li>
    <li>Protected species identification</li>
  </ul>
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

export default function EmpTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Environmental Management Plan (EMP) Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Environmental Management Plan (EMP) Template"
        description="Project-specific environmental management and compliance template."
        defaultExpanded
      />
    </div>
  )
}


