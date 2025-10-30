'use client';

import React from 'react';

export default function CorpPlanningPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">6.0 Planning</h1>
        <p className="text-base text-gray-600">This section details our systematic approach to planning within the Integrated Management System, focusing on risk and opportunity management, compliance, and setting objectives.</p>
      </header>

      <div className="bg-white border border-slate-200 p-8">
        <p className="text-gray-700">
          Effective planning is fundamental to achieving our QSE goals. At [Company Name], our planning processes are designed to be proactive and risk-based, ensuring that we identify potential challenges and opportunities early and take decisive action. Planning effectiveness is monitored through the system dashboard (/dashboard) with integrated risk and opportunity tracking.
        </p>
        <p className="mt-4 text-gray-700">
          The documents within this section provide the frameworks for managing risks and opportunities, ensuring we meet our compliance obligations, and setting meaningful objectives that drive continual improvement. Please use the sidebar navigation to explore the specific procedures and registers related to our planning activities.
        </p>
      </div>
    </div>
  );
}
