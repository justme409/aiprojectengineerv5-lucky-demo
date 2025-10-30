"use client";
import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpAuditPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">9.2 Internal Audit</h1>
        <p className="text-base text-gray-600">Framework for planning, conducting, and reporting internal audits to evaluate IMS effectiveness and conformity.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="audit-procedure"
          docId="QSE-9.2-PROC-01"
          title="Internal Audit Procedure"
          description="Methodology for planning, conducting, and reporting on internal audits."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="audit-schedule"
          docId="QSE-9.2-SCHED-01"
          title="Annual Internal Audit Schedule"
          description="Annual schedule for internal audits based on risk and process importance."
          defaultExpanded
        />
      </div>
    </div>
  );
}
