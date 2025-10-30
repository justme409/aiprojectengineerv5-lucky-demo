"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-TMP'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-TMP</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> [Enter Date]</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Project Information</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Project Name:</td><td class="border p-2">[Enter Project Name]</td></tr>
        <tr><td class="border p-2 font-semibold">Road Authority:</td><td class="border p-2">[Enter Road Authority]</td></tr>
        <tr><td class="border p-2 font-semibold">Traffic Manager:</td><td class="border p-2">[Enter Traffic Manager]</td></tr>
        <tr><td class="border p-2 font-semibold">Permit Number:</td><td class="border p-2">[Enter Permit Number]</td></tr>
        <tr><td class="border p-2 font-semibold">Construction Period:</td><td class="border p-2">[Enter Start - End Dates]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">2.0 Traffic Management Objectives</h3>
  <ul>
    <li>Maintain safe passage for all road users during construction</li>
    <li>Minimize traffic delays and disruptions</li>
    <li>Protect construction workers from traffic-related hazards</li>
    <li>Comply with Austroads Guide to Traffic Management and local authority requirements</li>
    <li>Maintain emergency vehicle access at all times</li>
  </ul>
  <h3 class="mt-8 mb-4">3.0 Site Analysis</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <tbody>
        <tr><td class="border p-2 font-semibold w-1/4">Road Classification:</td><td class="border p-2">[Enter road classification]</td></tr>
        <tr><td class="border p-2 font-semibold">Speed Limit:</td><td class="border p-2">[Enter speed limit]</td></tr>
        <tr><td class="border p-2 font-semibold">AADT (Average Annual Daily Traffic):</td><td class="border p-2">[Enter AADT]</td></tr>
        <tr><td class="border p-2 font-semibold">Peak Traffic Times:</td><td class="border p-2">[Enter peak periods]</td></tr>
        <tr><td class="border p-2 font-semibold">Heavy Vehicle Percentage:</td><td class="border p-2">[Enter percentage]</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">4.0 Traffic Control Measures</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Work Phase/Lot ID</th>
          <th class="border p-2 text-left">Traffic Control Type</th>
          <th class="border p-2 text-left">Lane Configuration</th>
          <th class="border p-2 text-left">Duration</th>
          <th class="border p-2 text-left">Signage Requirements</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">[Enter lot ID/work phase]</td>
          <td class="border p-2">[Enter control type]</td>
          <td class="border p-2">[Enter lane configuration]</td>
          <td class="border p-2">[Enter duration]</td>
          <td class="border p-2">[Enter signage requirements]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">5.0 Traffic Control Personnel</h3>
  <ul>
    <li>Traffic Controller certification (minimum requirements)</li>
    <li>Site-specific traffic management training</li>
    <li>Emergency response procedures</li>
    <li>Communication protocols</li>
  </ul>
  <h3 class="mt-8 mb-4">6.0 Communication Plan</h3>
  <div class="overflow-x-auto mb-8">
    <table class="min-w-full border border-gray-300 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="border p-2 text-left">Stakeholder</th>
          <th class="border p-2 text-left">Information Required</th>
          <th class="border p-2 text-left">Method</th>
          <th class="border p-2 text-left">Timing</th>
          <th class="border p-2 text-left">Responsible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">Local community</td>
          <td class="border p-2">Construction impacts, delays</td>
          <td class="border p-2">Letterbox drop, website</td>
          <td class="border p-2">5 days prior</td>
          <td class="border p-2">[Enter responsible person]</td>
        </tr>
        <tr>
          <td class="border p-2">[Enter stakeholder]</td>
          <td class="border p-2">[Enter information]</td>
          <td class="border p-2">[Enter method]</td>
          <td class="border p-2">[Enter timing]</td>
          <td class="border p-2">[Enter responsible person]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">7.0 Emergency Procedures</h3>
  <ul>
    <li>Vehicle breakdown in work zone</li>
    <li>Traffic control equipment failure</li>
    <li>Vehicle-worker collision</li>
    <li>Emergency vehicle access requirements</li>
    <li>Severe weather event procedures</li>
  </ul>
  <h3 class="mt-8 mb-4">8.0 Monitoring & Review</h3>
  <ul>
    <li>Daily traffic control inspections recorded in system</li>
    <li>Traffic flow monitoring and delay measurement</li>
    <li>Incident/near-miss reporting via NCR system</li>
    <li>Regular consultation with road authority</li>
    <li>Post-implementation review and lessons learned</li>
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

export default function TmpTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Traffic Management Plan (TMP) Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Traffic Management Plan (TMP) Template"
        description="Traffic control planning and communication template."
        defaultExpanded
      />
    </div>
  )
}


