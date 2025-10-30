"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpNCRPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">10.2 Nonconformity & Corrective Action</h1>
        <p className="text-base text-gray-600">Approaches for identifying, investigating, and correcting nonconformities and implementing corrective actions.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="ncr-procedure"
          docId="QSE-10.2-PROC-01"
          title="Procedure for Nonconformity, Incident & Corrective Action"
          description="Integrated procedure for reporting, investigating, and correcting nonconformities, incidents, and complaints."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="ncr-register"
          docId="QSE-10.2-REG-01"
          title="NCR and Corrective Action Register"
          description="Register to track all nonconformities, incidents, and corrective actions with status monitoring and trend analysis."
          defaultExpanded
        />
      </div>
    </div>
  );
}
