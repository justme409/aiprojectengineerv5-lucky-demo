"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorpPolicyRolesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">5.2-5.3 Policy, Roles & Responsibilities</h1>
        <p className="text-base text-gray-600">Foundational documents defining our commitment and organizational structure for QSE management.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="qse-policy"
          docId="QSE-5.2-POL-01"
          title="QSE Policy Statement"
          description="Top management's commitment to Quality, Safety, and the Environment."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="roles-matrix"
          docId="QSE-5.3-REG-01"
          title="Roles, Responsibilities & Authorities Matrix"
          description="Matrix defining QSE responsibilities for key organizational roles."
          defaultExpanded
        />
      </div>
    </div>
  );
}
