"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpCompetencePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">7.1-7.3 Resources, Competence & Awareness</h1>
        <p className="text-base text-gray-600">Framework for ensuring adequate resources, personnel competence, and QSE awareness across the organization.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="competence-procedure"
          docId="QSE-7.2-PROC-01"
          title="Procedure for Training, Competence & Awareness"
          description="Systematic approach for identifying training needs, ensuring competence, and promoting QSE awareness."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="training-matrix"
          docId="QSE-7.2-REG-01"
          title="Training Needs Analysis & Competency Matrix"
          description="Matrix mapping required competencies to organizational roles and tracking training status."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="induction-presentation"
          docId="QSE-7.2-TEMP-01"
          title="Employee Induction Presentation Template"
          description="Standard induction program covering corporate QSE requirements and organizational culture."
          defaultExpanded
        />
      </div>
    </div>
  );
}
