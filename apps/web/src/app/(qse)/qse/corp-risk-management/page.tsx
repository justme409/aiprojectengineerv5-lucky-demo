"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpRiskManagementPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">6.1 Risk & Opportunity Management</h1>
        <p className="text-base text-gray-600">Framework and registers for identifying, analyzing, and treating QSE risks and opportunities.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="risk-procedure"
          docId="QSE-6.1-PROC-01"
          title="Procedure for Risk & Opportunity Management"
          description="Process for managing risks and opportunities related to the IMS."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="risk-register"
          docId="QSE-6.1-REG-01"
          title="Corporate Risk Register"
          description="Live register of significant strategic and operational QSE risks."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="opportunity-register"
          docId="QSE-6.1-REG-02"
          title="Corporate Opportunity Register"
          description="Register for tracking potential improvements and strategic QSE opportunities."
          defaultExpanded
        />
      </div>
    </div>
  );
}


