"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpLegalPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">6.1.3 Compliance Obligations</h1>
        <p className="text-base text-gray-600">The framework and register for identifying, accessing, and managing our legal and other requirements related to the IMS.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="legal-procedure"
          docId="QSE-6.1-PROC-02"
          title="Procedure for Identifying Compliance Obligations"
          description="The process for ensuring we are aware of and have access to our legal and other requirements."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="legal-register"
          docId="QSE-6.1-REG-03"
          title="Compliance Obligations Register"
          description="A live register of the key legal and other requirements applicable to our operations."
          defaultExpanded
        />
      </div>
    </div>
  );
}
