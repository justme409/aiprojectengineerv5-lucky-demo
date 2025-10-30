"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpObjectivesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">6.2 QSE Objectives</h1>
        <p className="text-base text-gray-600">Framework and plan for setting and achieving Quality, Safety, and Environmental objectives.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="objectives-procedure"
          docId="QSE-6.2-PROC-01"
          title="Procedure for Setting QSE Objectives"
          description="Process for establishing, communicating, and monitoring QSE objectives and targets."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="objectives-plan"
          docId="QSE-6.2-PLN-01"
          title="Annual QSE Objectives & Targets Plan"
          description="Documented plan outlining specific QSE goals for the current year."
          defaultExpanded
        />
      </div>
    </div>
  );
}
