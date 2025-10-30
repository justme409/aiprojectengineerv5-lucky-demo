'use client';

import React from 'react';
import { Wrench } from 'lucide-react';

export default function CorpSupportPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">7.0 Support</h1>
        <p className="text-base text-gray-600">
          This section encompasses the organizational support systems required for effective implementation and maintenance of the integrated QSE management system, covering resources, competence, awareness, communication, and documented information.
        </p>
      </header>

      {/* Parent Node Description */}
      <div className="bg-white border border-slate-300 p-8">
        <div className="flex items-center gap-4 mb-6">
          <Wrench className="h-12 w-12 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Support Systems Overview</h2>
            <p className="text-gray-600">Foundation elements that enable effective QSE management</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed">
            The Support section establishes the foundation for effective implementation of the integrated management system. 
            It defines how [Company Name] provides the necessary 
            resources, develops personnel competence, maintains awareness, facilitates communication, and controls documented information. Support system effectiveness is continuously monitored through integrated dashboard analytics (/dashboard) and linked to the Continual Improvement Register.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Resources & Competence</h3>
              <p className="text-blue-800">
                Ensuring adequate human resources, infrastructure, and work environment to support QSE objectives. 
                Developing and maintaining personnel competence through systematic training and awareness programs.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">Communication & Documentation</h3>
              <p className="text-green-800">
                Establishing effective internal and external communication channels, and implementing robust 
                systems for the creation, update, control, and retention of documented information.
              </p>
            </div>
          </div>

          <h3 className="mt-8 mb-4">Sub-sections in this Category:</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>7.1-7.3 Resources, Competence & Awareness:</strong> 
                <span className="text-gray-700">Personnel development and organizational capability building</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>7.4 Communication:</strong> 
                <span className="text-gray-700">Internal and external communication processes and protocols</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>7.5 Documented Information:</strong> 
                <span className="text-gray-700">Document control and information management systems</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400">
            <p className="text-amber-800">
              <strong>Note:</strong> Each sub-section contains specific procedures, templates, and registers that 
              collectively ensure the organization has the necessary support infrastructure to achieve its QSE objectives 
              and maintain compliance with ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
