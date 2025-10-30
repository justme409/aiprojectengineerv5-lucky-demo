"use client";
import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpDocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">7.5 Documented Information</h1>
        <p className="text-base text-gray-600">Framework for creating, updating, controlling, and maintaining documented information within the IMS.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="documentation-procedure"
          docId="QSE-7.5-PROC-01"
          title="Procedure for Control of Documented Information"
          description="Systematic approach for creating, reviewing, approving, distributing, and controlling documented information."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="master-register"
          docId="QSE-7.5-REG-01"
          title="Master Document & Records Register"
          description="Comprehensive register tracking controlled documents and records, ownership, and review requirements."
          defaultExpanded
        />
      </div>
    </div>
  );
}
