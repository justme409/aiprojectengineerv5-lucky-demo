"use client";

import React from 'react';
import QseDocumentSection from '@/components/features/qse/QseDocumentSection'

export default function CorporateTier1Page() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Corporate QSE Management System</h1>
        <p className="text-base text-gray-600">High-level corporate governance and oversight for the Integrated Management System.</p>
      </header>

      <div className="space-y-12">
        <QseDocumentSection
          sectionId="ims-policy"
          docId="QSE-IMS-POL-01"
          title="Integrated Management System (IMS) Policy"
          description="Corporate policy statement integrating Quality, Safety, and Environmental management."
          defaultExpanded
        />

        <QseDocumentSection
          sectionId="ims-manual"
          docId="QSE-IMS-MAN-01"
          title="IMS Manual"
          description="Comprehensive manual outlining the scope, structure, and implementation of the IMS."
          defaultExpanded
        />
      </div>
    </div>
  );
}
