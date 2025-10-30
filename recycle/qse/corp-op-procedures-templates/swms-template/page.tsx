"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-SWMS'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-SWMS</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> [Enter Date]</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Work Activity Information</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Project Name:</td><td class="border p-2">[Enter Project Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Work Activity:</td><td class="border p-2">[Enter Specific Activity]</td></tr>
        <tr><td class="border p-2 font-semibold">Location/Lot ID:</td><td class="border p-2">[Enter Location/Lot ID from Lot Register]</td></tr>
        <tr><td class="border p-2 font-semibold">Supervisor:</td><td class="border p-2">[Enter Supervisor Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Planned Start Date:</td><td class="border p-2">[Enter Start Date]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">2.0 High Risk Construction Work Classification</h3>
  <div class="grid grid-cols-2 gap-2 mb-8">
    <div class="flex items-center"><span class="mr-2">☐</span>Work at height (>2m)</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Confined space entry</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Excavation >1.5m deep</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Structural alteration/demolition</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Work near live electrical</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Traffic management</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Crane/lifting operations</div>
    <div class="flex items-center"><span class="mr-2">☐</span>Work near water</div>
  </div>
  <h3 class="mt-8 mb-4">3.0 Hazard Identification & Risk Assessment</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Work Step</th>
          <th class="border p-2 text-left">Hazard</th>
          <th class="border p-2 text-left">Risk Rating</th>
          <th class="border p-2 text-left">Control Measures</th>
          <th class="border p-2 text-left">Residual Risk</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter work step]</td>
          <td class="border p-2">[Enter identified hazard]</td>
          <td class="border p-2">[High/Medium/Low]</td>
          <td class="border p-2">[Enter control measures]</td>
          <td class="border p-2">[High/Medium/Low]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">4.0 Legislative Requirements</h3>
  <ul>
    <li>Work Health and Safety Act 2011</li>
    <li>Work Health and Safety Regulation 2017</li>
    <li>AS/NZS 1891 - Industrial fall-arrest systems</li>
    <li>AS 2550 - Cranes, hoists and winches</li>
    <li>[Enter additional relevant standards]</li>
  </ul>
  <h3 class="mt-8 mb-4">5.0 Competency & Training Requirements</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Role/Position</th>
          <th class="border p-2 text-left">Required Competency</th>
          <th class="border p-2 text-left">Evidence Required</th>
          <th class="border p-2 text-left">Verification Method</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter role]</td>
          <td class="border p-2">[Enter required competency]</td>
          <td class="border p-2">[Enter evidence - license, certificate]</td>
          <td class="border p-2">[System competence register check]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">6.0 Plant, Equipment & Materials</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Item</th>
          <th class="border p-2 text-left">Safety Requirements</th>
          <th class="border p-2 text-left">Inspection/Test Required</th>
          <th class="border p-2 text-left">Documentation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter plant/equipment]</td>
          <td class="border p-2">[Enter safety requirements]</td>
          <td class="border p-2">[Enter inspection requirements]</td>
          <td class="border p-2">[Enter required documentation]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">7.0 Emergency Procedures</h3>
  <ul>
    <li><strong>Emergency Contacts:</strong> [Enter emergency contact numbers]</li>
    <li><strong>Evacuation Procedures:</strong> [Enter evacuation routes and assembly points]</li>
    <li><strong>First Aid:</strong> [Enter first aid arrangements and qualified personnel]</li>
    <li><strong>Incident Reporting:</strong> All incidents reported immediately via system NCR module</li>
  </ul>
  <h3 class="mt-8 mb-4">8.0 Sign-off & Communication</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Role</th>
          <th class="border p-2 text-left">Name</th>
          <th class="border p-2 text-left">Signature</th>
          <th class="border p-2 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">SWMS Preparer</td>
          <td class="border p-2">[Enter name]</td>
          <td class="border p-2">[Signature field]</td>
          <td class="border p-2">[Enter date]</td>
        </tr>
        <tr>
          <td class="border p-2">Supervisor Review</td>
          <td class="border p-2">[Enter name]</td>
          <td class="border p-2">[Signature field]</td>
          <td class="border p-2">[Enter date]</td>
        </tr>
        <tr>
          <td class="border p-2">Project Manager Approval</td>
          <td class="border p-2">[Enter name]</td>
          <td class="border p-2">[Signature field]</td>
          <td class="border p-2">[Enter date]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p><strong>Note:</strong> All personnel involved in this work must be briefed on this SWMS prior to commencement. Briefing records maintained in the system's training register.</p>
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

export default function SwmsTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Safe Work Method Statement (SWMS) Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Safe Work Method Statement (SWMS) Template"
        description="Mandatory format for SWMS for high risk construction work."
        defaultExpanded
      />
    </div>
  )
}


