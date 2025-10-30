"use client"
import React, { useEffect } from 'react'
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

const DOC_ID = 'QSE-9.1-FORM-01'

const defaultHtml = `
<div class="prose prose-slate max-w-none">
  <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
    <div class="border p-3"><span class="font-semibold">Document ID:</span> QSE-9.1-FORM-01</div>
    <div class="border p-3"><span class="font-semibold">Revision:</span> C</div>
    <div class="border p-3"><span class="font-semibold">Effective Date:</span> 25/07/2024</div>
  </div>
  <div class="text-center mb-8">
    <h2 class="text-xl font-bold">Customer Satisfaction Survey Template</h2>
    <p>Please take a few moments to complete this survey about your experience with our team. Responses feed our monitoring dashboard for analysis.</p>
  </div>
  <h3>Project Information</h3>
  <p><strong>Client Organization:</strong> [Enter Client Organization Name]</p>
  <p><strong>Project Name:</strong> [Enter Project Name/Reference]</p>
  <p><strong>Survey Date:</strong> [Auto-populated Current Date]</p>
  <p><strong>Project Manager:</strong> [Auto-populated from Project Data]</p>
  <h3>Section A: Project Delivery Performance</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full border">
      <thead>
        <tr class="bg-gray-50">
          <th class="border p-2 text-left">Performance Area</th>
          <th class="border p-2 text-center w-12">5</th>
          <th class="border p-2 text-center w-12">4</th>
          <th class="border p-2 text-center w-12">3</th>
          <th class="border p-2 text-center w-12">2</th>
          <th class="border p-2 text-center w-12">1</th>
          <th class="border p-2 text-left">Comments</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="border p-2">Quality of final product</td><td class="border p-2 text-center">☐</td><td class="border p-2 text-center">☐</td><td class="border p-2 text-center">☐</td><td class="border p-2 text-center">☐</td><td class="border p-2 text-center">☐</td><td class="border p-2">[Enter comments]</td></tr>
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

export default function CustomerSurveyTemplatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Customer Satisfaction Survey Template</h1>
      <TemplateInitializer />
      <QseDocumentSection
        docId={DOC_ID}
        title="Customer Satisfaction Survey Template"
        description="Standard tool for measuring customer perceptions and feedback."
        defaultExpanded
      />
    </div>
  )
}


