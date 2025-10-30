"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-8.1-TEMP-02'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-8.1-TEMP-02</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> A</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <p>This template provides the mandatory format for all Safe Work Method Statements (SWMS) for High Risk Construction Work.</p>
  <div class="overflow-x-auto">
    <table class="min-w-full border">
      <thead class="bg-gray-50">
        <tr>
          <th rowspan="2" class="border p-1"></th>
          <th colspan="5" class="border p-1 text-center">Consequence</th>
        </tr>
        <tr>
          <th class="border p-1">Insignificant</th>
          <th class="border p-1">Minor</th>
          <th class="border p-1">Moderate</th>
          <th class="border p-1">Major</th>
          <th class="border p-1">Catastrophic</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="border p-1 font-bold">Almost Certain</td><td class="border p-1">H</td><td class="border p-1">E</td><td class="border p-1">E</td><td class="border p-1">E</td><td class="border p-1">E</td></tr>
        <tr><td class="border p-1 font-bold">Likely</td><td class="border p-1">M</td><td class="border p-1">H</td><td class="border p-1">E</td><td class="border p-1">E</td><td class="border p-1">E</td></tr>
        <tr><td class="border p-1 font-bold">Possible</td><td class="border p-1">L</td><td class="border p-1">M</td><td class="border p-1">H</td><td class="border p-1">E</td><td class="border p-1">E</td></tr>
        <tr><td class="border p-1 font-bold">Unlikely</td><td class="border p-1">L</td><td class="border p-1">L</td><td class="border p-1">M</td><td class="border p-1">H</td><td class="border p-1">E</td></tr>
        <tr><td class="border p-1 font-bold">Rare</td><td class="border p-1">L</td><td class="border p-1">L</td><td class="border p-1">M</td><td class="border p-1">H</td><td class="border p-1">H</td></tr>
      </tbody>
    </table>
  </div>
  <h3 class="mt-8 mb-4">Job Steps</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full border">
      <tbody>
        <tr>
          <td class="border p-2 font-bold">Sequence of Job Steps</td>
          <td class="border p-2 font-bold">Potential Hazards</td>
          <td class="border p-2 font-bold">Risk Rating (Initial)</td>
          <td class="border p-2 font-bold">Control Measures</td>
          <td class="border p-2 font-bold">Risk Rating (Residual)</td>
          <td class="border p-2 font-bold">Person Responsible</td>
        </tr>
        <tr>
          <td class="border p-2">1. </td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
        </tr>
        <tr>
          <td class="border p-2">2. </td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
          <td class="border p-2"></td>
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

export default function RiskAssessmentTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Risk Assessment / SWMS Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Risk Assessment / SWMS Template"
        description="Template for high-risk construction work SWMS and risk assessments."
        defaultExpanded
      />
    </div>
  )
}


