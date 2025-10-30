"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpReviewPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">9.3 Management Review</h1>
        <p className="text-base text-gray-600">Framework for conducting periodic management reviews to evaluate IMS suitability, adequacy, and effectiveness.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="review-procedure"
          docId="QSE-9.3-PROC-01"
          title="Procedure for Management Review"
          description="Process for conducting management reviews, including inputs, outputs, and decision-making requirements."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="review-minutes"
          docId="QSE-9.3-MIN-TEMPLATE"
          title="Management Review Meeting Minutes Template"
          description="Template to record management review meetings, decisions, and assigned actions."
          defaultExpanded
        />
      </div>
    </div>
  );
}