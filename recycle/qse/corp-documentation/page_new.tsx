"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpDocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">7.5 Documented Information</h1>
        <p className="text-base text-gray-600">Framework for creating, updating, and controlling documented information.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="documentation-procedure"
          docId="QSE-7.5-PROC-01"
          title="Procedure for Documented Information Control"
          description="Processes for creating, approving, distributing, and controlling all documented information."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="doc-register"
          docId="QSE-7.5-REG-01"
          title="Document Register"
          description="Master register of all QSE documents with version control and approval status."
          defaultExpanded
        />
      </div>
    </div>
  );
}
