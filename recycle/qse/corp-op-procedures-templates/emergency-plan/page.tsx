"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-01'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-01</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <h3 class="mt-8 mb-4">1.0 Purpose</h3>
  <p>This document provides a template for the creation of a site-specific Emergency Preparedness and Response Plan. Each project must adapt this template to address its specific risks and location.</p>
  <h3 class="mt-8 mb-4">2.0 Emergency Contact Details</h3>
  <p>This section must be populated with project-specific contact numbers for all key personnel (Project Manager, Supervisors, First Aiders) and external emergency services.</p>
  <h3 class="mt-8 mb-4">3.0 Specific Emergency Responses</h3>
  <p>The plan must include step-by-step response procedures for foreseeable emergencies, including but not limited to:</p>
  <ul>
    <li>Medical Emergency / Serious Injury</li>
    <li>Fire</li>
    <li>Major Environmental Spill</li>
    <li>Structural Collapse or Failure</li>
    <li>Traffic Incident on or near site</li>
  </ul>
  <h3 class="mt-8 mb-4">4.0 Drills and Exercises</h3>
  <p>Emergency response procedures must be tested through regular drills (at least every 6 months) to ensure they are effective and that all personnel are familiar with their roles.</p>
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

export default function EmergencyPlanTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Project Emergency Preparedness & Response Plan Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Emergency Preparedness & Response Plan Template"
        description="Template for site-specific emergency planning and response procedures."
        defaultExpanded
      />
    </div>
  )
}


