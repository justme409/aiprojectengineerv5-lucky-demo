'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function CorpImprovementPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">10.0 Improvement</h1>
        <p className="text-base text-gray-600">
          This section establishes the framework for identifying, implementing, and sustaining improvements to enhance the effectiveness, efficiency, and performance of the integrated QSE management system.
        </p>
      </header>

      {/* Parent Node Description */}
      <div className="bg-white border border-slate-300 p-8">
        <div className="flex items-center gap-4 mb-6">
          <TrendingUp className="h-12 w-12 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Continuous Improvement Excellence</h2>
            <p className="text-gray-600">Systematic approach to identifying and implementing improvements for sustained success</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed">
            The Improvement section defines how [Company Name] systematically 
            identifies and implements improvements to enhance the suitability, adequacy, and effectiveness of the QSE management system. Improvement opportunities are automatically identified through system analytics and tracked via the Continual Improvement Register (QSE-10.3-REG-01) with real-time dashboard monitoring (/dashboard). 
            This includes addressing nonconformities, implementing corrective actions, and pursuing continual improvement opportunities 
            to better serve customers and stakeholders.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-red-900 mb-3">Nonconformity & Corrective Action</h3>
              <p className="text-red-800">
                Systematic identification, investigation, and correction of nonconformities to prevent recurrence and 
                improve system effectiveness through root cause analysis and preventive measures.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">Continual Improvement</h3>
              <p className="text-green-800">
                Proactive identification and implementation of improvement opportunities to enhance customer satisfaction, 
                operational efficiency, and organizational capability for sustained competitive advantage.
              </p>
            </div>
          </div>

          <h3 className="mt-8 mb-4">Core Improvement Elements:</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <strong>Nonconformity Management:</strong> 
                <span className="text-gray-700">Systematic handling of deviations from requirements and standards</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <strong>Root Cause Analysis:</strong> 
                <span className="text-gray-700">Deep investigation to identify and address underlying causes of problems</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <strong>Corrective Action:</strong> 
                <span className="text-gray-700">Elimination of causes of nonconformities to prevent recurrence</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Preventive Action:</strong> 
                <span className="text-gray-700">Proactive measures to prevent potential nonconformities and issues</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Improvement Opportunities:</strong> 
                <span className="text-gray-700">Identification and implementation of enhancements to system effectiveness</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>Innovation Integration:</strong> 
                <span className="text-gray-700">Incorporation of new technologies, methods, and best practices</span>
              </li>
            </ul>
          </div>

          <h3 className="mt-8 mb-4">Sub-sections in this Category:</h3>
          <div className="bg-amber-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <strong>10.2 Nonconformity & Corrective Action:</strong> 
                <span className="text-gray-700">Systematic approach to managing nonconformities and implementing corrective actions</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>10.3 Continual Improvement:</strong> 
                <span className="text-gray-700">Proactive improvement processes and opportunity identification systems</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-400">
            <p className="text-green-800">
              <strong>Performance Enhancement:</strong> The improvement section ensures that the organization continuously 
              enhances its ability to meet customer requirements, achieve QSE objectives, and adapt to changing circumstances 
              through systematic learning and development.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-blue-800">
              <strong>Learning Organization:</strong> Improvement activities are designed to capture and share knowledge, 
              promote innovation, and build organizational capability for sustained excellence in construction delivery 
              and stakeholder satisfaction.
            </p>
          </div>

          <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-400">
            <p className="text-purple-800">
              <strong>Cultural Integration:</strong> Improvement is embedded in the organizational culture, encouraging 
              all personnel to identify opportunities, suggest enhancements, and participate in the continuous evolution 
              of the QSE management system for long-term success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
