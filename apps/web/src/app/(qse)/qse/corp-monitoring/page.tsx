"use client";
import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpMonitoringPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">9.1 Monitoring, Measurement, Analysis & Evaluation</h1>
        <p className="text-base text-gray-600">Approaches for monitoring QSE performance, measuring key indicators, and evaluating customer satisfaction.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="monitoring-procedure"
          docId="QSE-9.1-PROC-01"
          title="Procedure for Monitoring, Measurement, and Analysis"
          description="Methods and systems for monitoring, measuring, and analyzing QSE performance."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="customer-survey"
          docId="QSE-9.1-FORM-01"
          title="Customer Satisfaction Survey Template"
          description="Standard tool for systematically measuring customer perceptions, satisfaction levels, and feedback."
          defaultExpanded
        />
      </div>
    </div>
  );
}
