"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpConsultationPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">5.4 Worker Consultation & Participation</h1>
        <p className="text-base text-gray-600">Framework and evidence of involving workers in QSE matters.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="consult-procedure"
          docId="QSE-5.4-PROC-01"
          title="Procedure for Consultation & Participation"
          description="Mechanisms for effective worker engagement on health, safety, and environmental issues."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="hsc-minutes"
          docId="QSE-5.4-FORM-01"
          title="Health & Safety Committee Meeting Minutes Template"
          description="Template for recording formal consultation processes."
          defaultExpanded
        />
      </div>
    </div>
  );
}