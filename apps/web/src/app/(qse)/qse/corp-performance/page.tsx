'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function CorpPerformancePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">9.0 Performance Evaluation</h1>
        <p className="text-base text-gray-600">
          This section establishes the framework for monitoring, measuring, analyzing, and evaluating the performance and effectiveness of the integrated QSE management system.
        </p>
      </header>

      {/* Parent Node Description */}
      <div className="bg-white border border-slate-300 p-8">
        <div className="flex items-center gap-4 mb-6">
          <BarChart3 className="h-12 w-12 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Excellence Framework</h2>
            <p className="text-gray-600">Systematic approach to measuring and improving QSE performance</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed">
            The Performance Evaluation section defines how [Company Name] monitors, 
            measures, analyzes, and evaluates its QSE performance to ensure the effectiveness of the integrated management system. All performance data is automatically collected and displayed on the real-time monitoring dashboard (/dashboard) with advanced analytics and trend analysis capabilities. 
            This includes determining what needs to be monitored, the methods for monitoring and evaluation, and when results 
            should be analyzed and evaluated.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">Monitoring & Measurement</h3>
              <p className="text-purple-800">
                Systematic collection and analysis of performance data to track progress toward QSE objectives, 
                identify trends, and provide evidence of management system effectiveness.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-indigo-900 mb-3">Evaluation & Review</h3>
              <p className="text-indigo-800">
                Regular assessment of performance data through internal audits and management reviews to identify 
                improvement opportunities and ensure continued suitability and effectiveness.
              </p>
            </div>
          </div>

          <h3 className="mt-8 mb-4">Key Performance Evaluation Elements:</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>Monitoring & Measurement:</strong> 
                <span className="text-gray-700">Systematic tracking of QSE performance indicators and process effectiveness</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Analysis & Evaluation:</strong> 
                <span className="text-gray-700">Data analysis to determine performance trends and improvement opportunities</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Customer Satisfaction:</strong> 
                <span className="text-gray-700">Assessment of customer perceptions and satisfaction with delivered services</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <strong>Internal Audits:</strong> 
                <span className="text-gray-700">Systematic examination of management system conformity and effectiveness</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <strong>Management Review:</strong> 
                <span className="text-gray-700">Top management evaluation of system performance and improvement needs</span>
              </li>
            </ul>
          </div>

          <h3 className="mt-8 mb-4">Sub-sections in this Category:</h3>
          <div className="bg-amber-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>9.1 Monitoring, Measurement, Analysis & Evaluation:</strong> 
                <span className="text-gray-700">Performance monitoring systems and customer satisfaction measurement</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>9.2 Internal Audit:</strong> 
                <span className="text-gray-700">Internal audit programs and systematic management system evaluation</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>9.3 Management Review:</strong> 
                <span className="text-gray-700">Strategic review processes and management system improvement planning</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-purple-50 border-l-4 border-purple-400">
            <p className="text-purple-800">
              <strong>Data-Driven Decisions:</strong> All performance evaluation activities are designed to provide 
              objective evidence for informed decision-making regarding the effectiveness of the QSE management system 
              and the achievement of intended outcomes.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-blue-800">
              <strong>Continuous Monitoring:</strong> Performance evaluation is an ongoing process that provides 
              real-time insights into system performance, enabling proactive management of risks and opportunities 
              while ensuring sustained compliance with requirements.
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400">
            <p className="text-green-800">
              <strong>Improvement Focus:</strong> The outputs of performance evaluation activities directly inform 
              improvement planning and resource allocation, ensuring that the organization continuously enhances 
              its capability to deliver quality outcomes safely and sustainably.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
