"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorporateTier1Page() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Corporate QSE Management System (Tier 1)</h1>
        <p className="text-base text-gray-600">Foundational IMS documents aligned with ISO 9001, ISO 14001, and ISO 45001.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="ims-manual"
          docId="QSE-1-MAN-01"
          title="Integrated Management System (IMS) Manual"
          description="Scope, context, policies, and process interactions of the integrated QSE management system."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="ims-scope"
          docId="QSE-4.3-STMT-01"
          title="IMS Scope Statement"
          description="Formal statement defining the boundaries and applicability of the IMS."
          defaultExpanded
        />
      </div>
    </div>
  );
}