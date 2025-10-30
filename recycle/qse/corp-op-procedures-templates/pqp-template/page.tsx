"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-PQP'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-PQP</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> [Enter Date]</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Project Information</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Project Name:</td><td class="border p-2">[Enter Project Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Client:</td><td class="border p-2">[Enter Client Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Contract Value:</td><td class="border p-2">[Enter Value]</td></tr>
        <tr><td class="border p-2 font-semibold">Project Manager:</td><td class="border p-2">[Enter PM Name]</td></tr>
        <tr><td class="border p-2 font-semibold">QA/QC Manager:</td><td class="border p-2">[Enter QA Manager]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">2.0 Quality Policy & Objectives</h3>
  <p><strong>Quality Policy Statement:</strong> [Reference corporate QSE Policy QSE-5.2-POL-01]</p>
  <p><strong>Project-Specific Quality Objectives:</strong></p>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Quality Objective</th>
          <th class="border p-2 text-left">Target</th>
          <th class="border p-2 text-left">Measurement Method</th>
          <th class="border p-2 text-left">Responsible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter objective]</td>
          <td class="border p-2">[Enter target]</td>
          <td class="border p-2">[Enter measurement]</td>
          <td class="border p-2">[Enter responsible party]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">3.0 Lot Management</h3>
  <ul>
    <li><strong>Lot Register:</strong> All work packages tracked with unique identifiers</li>
    <li><strong>ITP Assignment:</strong> Each lot linked to appropriate Inspection & Test Plans</li>
    <li><strong>Progress Tracking:</strong> Real-time status updates and completion records</li>
    <li><strong>NCR Integration:</strong> Non-conformances linked to specific lots for traceability</li>
  </ul>
  <h3 class="mt-8 mb-4">4.0 Inspection & Test Plans (ITPs)</h3>
  <ul>
    <li><strong>ITP Templates:</strong> Based on project specifications and industry standards</li>
    <li><strong>Digital Execution:</strong> ITPs executed using tablets with real-time data entry</li>
    <li><strong>Hold Points:</strong> Automatic notifications to relevant parties for sign-off</li>
    <li><strong>Records Management:</strong> All ITP records stored in /projects/[projectId]/itp-templates</li>
  </ul>
  <h3 class="mt-8 mb-4">5.0 Quality Risks & Mitigation</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Quality Risk</th>
          <th class="border p-2 text-left">Impact</th>
          <th class="border p-2 text-left">Likelihood</th>
          <th class="border p-2 text-left">Mitigation Measures</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter risk description]</td>
          <td class="border p-2">[High/Medium/Low]</td>
          <td class="border p-2">[High/Medium/Low]</td>
          <td class="border p-2">[Enter mitigation measures]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">6.0 Handover Records</h3>
  <ul>
    <li>Completed ITP Register with all test results and certifications</li>
    <li>As-Built Documentation from Document Register</li>
    <li>NCR Register with closure evidence</li>
    <li>Material Certificates and Compliance Documentation</li>
    <li>Final Quality Audit Report</li>
  </ul>
  <h3 class="mt-8 mb-4">7.0 Quality KPIs</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">KPI</th>
          <th class="border p-2 text-left">Target</th>
          <th class="border p-2 text-left">Current Performance</th>
          <th class="border p-2 text-left">Trend</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">ITP First-Pass Rate</td>
          <td class="border p-2">[Enter target %]</td>
          <td class="border p-2">[Auto-populated from system]</td>
          <td class="border p-2">[System trend analysis]</td>
        </tr>
        <tr>
          <td class="border p-2">NCR Closure Rate</td>
          <td class="border p-2">[Enter target days]</td>
          <td class="border p-2">[Auto-populated from system]</td>
          <td class="border p-2">[System trend analysis]</td>
        </tr>
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

export default function PqpTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Project Quality Plan (PQP) Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Project Quality Plan (PQP) Template"
        description="Comprehensive project quality planning template."
        defaultExpanded
      />
    </div>
  )
}


