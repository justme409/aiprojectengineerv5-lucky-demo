"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpContinualImprovementPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">10.3 Continual Improvement</h1>
        <p className="text-base text-gray-600">Approach for identifying, evaluating, and implementing continual improvement opportunities.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="improvement-procedure"
          docId="QSE-10.3-PROC-01"
          title="Procedure for Continual Improvement"
          description="Overall approach to improving IMS suitability, adequacy, and effectiveness."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="improvement-register"
          docId="QSE-10.3-REG-01"
          title="Continual Improvement Opportunities Register"
          description="Live register capturing opportunities from audits, reviews, and suggestions."
          defaultExpanded
        />
      </div>
    </div>
  );
}
