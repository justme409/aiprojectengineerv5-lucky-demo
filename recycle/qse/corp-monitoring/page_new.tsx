"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpMonitoringPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">9.1 Monitoring, Measurement, Analysis & Evaluation</h1>
        <p className="text-base text-gray-600">Framework for monitoring QSE performance and evaluating system effectiveness.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="monitoring-procedure"
          docId="QSE-9.1-PROC-01"
          title="Procedure for Monitoring, Measurement & Analysis"
          description="Systematic approach to monitoring QSE performance indicators and analyzing trends."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="customer-survey"
          docId="QSE-9.1-FORM-01"
          title="Customer Satisfaction Survey Template"
          description="Standard tool for measuring customer perceptions and feedback."
          defaultExpanded
        />
      </div>
    </div>
  );
}
