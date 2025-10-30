"use client";
import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpCommunicationPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">7.4 Communication</h1>
        <p className="text-base text-gray-600">Framework for effective internal and external communication processes.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="communication-procedure"
          docId="QSE-7.4-PROC-01"
          title="Procedure for Internal & External Communication"
          description="Processes and protocols for effective communication within the organization and with external stakeholders."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="communication-matrix"
          docId="QSE-7.4-REG-01"
          title="Communication Matrix"
          description="Matrix defining communication requirements, channels, and responsibilities."
          defaultExpanded
        />
      </div>
    </div>
  );
}
