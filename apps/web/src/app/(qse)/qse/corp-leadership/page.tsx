'use client';

import React from 'react';

export default function CorpLeadershipPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">5.0 Leadership</h1>
        <p className="text-base text-gray-600">This section outlines the leadership commitment, policy, roles, and consultation mechanisms that drive the Integrated Management System at [Company Name]. Real-time leadership metrics and performance indicators are displayed on the monitoring dashboard (/dashboard).</p>
      </header>

      <div className="bg-white border border-slate-200 p-8">
        <p className="text-gray-700">
          Effective leadership is the cornerstone of our Integrated Management System. Top management is committed to establishing a culture of excellence in Quality, Safety, and Environmental performance.
        </p>
        <p className="mt-4 text-gray-700">
          The documents and procedures within this section detail our formal QSE Policy, define the organizational structure with clear roles and responsibilities, and establish the framework for worker consultation and participation. Please use the sidebar navigation to explore the specific topics within this section.
        </p>
      </div>
    </div>
  );
}


