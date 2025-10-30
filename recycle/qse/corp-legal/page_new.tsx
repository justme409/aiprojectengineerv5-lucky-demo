"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpLegalPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">6.1.3 Compliance Obligations</h1>
        <p className="text-base text-gray-600">Framework for identifying, maintaining, and ensuring compliance with legal and other requirements.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="legal-procedure"
          docId="QSE-6.1-PROC-02"
          title="Procedure for Compliance Obligations"
          description="Systematic approach to identifying, monitoring, and maintaining legal and regulatory compliance."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="legal-register"
          docId="QSE-6.1-REG-02"
          title="Compliance Obligations Register"
          description="Register of all applicable legal requirements and compliance status."
          defaultExpanded
        />
      </div>
    </div>
  );
}
