'use client';

import React from 'react';

export default function CorpOperationPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">8.0 Operation</h1>
        <p className="text-base text-gray-600">This section contains the core operational procedures and templates that govern our project execution and service delivery, ensuring QSE requirements are met at the worksite.</p>
      </header>

      <div className="bg-white border border-slate-200 p-8">
        <p className="text-gray-700">
          The operational phase is where our commitment to Quality, Safety, and Environmental management is put into practice. The documents in this section provide the practical, hands-on instructions and tools our teams use every day to control their work and manage risks.
        </p>
        <p className="mt-4 text-gray-700">
          These corporate-level procedures and templates form the basis of our Project Management Plans, ensuring a consistent approach to operational control across all [Company Name] sites. Operational performance metrics are tracked in real-time via the system dashboard (/dashboard) and integrated with project management modules. Please use the sidebar navigation to explore the specific operational documents.
        </p>
      </div>
    </div>
  );
}
