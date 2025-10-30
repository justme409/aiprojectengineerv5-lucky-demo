// QSE assets-first integration: swap in server actions/editor component where needed
'use client';
import React, { useState } from 'react';
import QseDocEditor from '@/components/features/qse/QseDocEditor'
import { FileText, ChevronDown, ChevronUp, Hammer, ShoppingCart, TestTube, Truck, Wind, Shield, ClipboardCheck, AlertTriangle, CloudSun, Recycle } from 'lucide-react';

export default function CorpOpProceduresTemplatesPage() {
  const [expandedDocs, setExpandedDocs] = useState<{ [key: string]: boolean }>({
    'proj-mgmt': true,
    'procurement': true,
    'design-control': true,
    'construction-control': true,
    'environmental-mgmt': true,
    'whs-mgmt': true,
    'emergency-plan': true,
    'incident-report': true,
    'risk-assessment': true,
    'pre-start-template': true,
    'site-induction': true,
    'quality-inspection': true,
    'pqp-template': true,
    'emp-template': true,
    'ohsmp-template': true,
    'tmp-template': true,
    'swms-template': true,
    'itp-template': true,
  });

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">8.1 Corporate Operational Procedures & Templates</h1>
        <p className="text-lg text-gray-600">The suite of core procedures and templates that govern our project delivery and operational activities, ensuring consistency and control across all sites.</p>
      </header>

      <div className="space-y-12">
        {/* Document 1: Project Management Procedure */}
        <section id="proj-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('proj-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Management Procedure</h2>
                  <p className="text-gray-700">The overarching framework for managing projects from tender to final completion, ensuring consistency with Austroads guidelines.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['proj-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['proj-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure defines the mandatory project delivery framework for all projects undertaken by [Company Name]. It establishes the planning, control, and governance mechanisms required to ensure consistent project delivery that meets client, regulatory, and internal QSE standards, aligning with the principles outlined in the Austroads Guide to Project Delivery.</p>
              
              <h3 className="mt-8 mb-4">2.0 Project Lifecycle Phases</h3>
              <p>All projects shall be managed through four distinct lifecycle phases, each with specific gate reviews and required deliverables.</p>
              
              <h4>2.1 Phase 1: Tender / Initiation</h4>
              <ul>
                <li><strong>Key Activities:</strong> Opportunity assessment, bid/no-bid decision, client requirements analysis, preliminary risk assessment, and development of the tender submission including a preliminary Project Delivery Plan.</li>
                <li><strong>Key Deliverables:</strong> Tender Submission, Preliminary Risk Register, high-level program.</li>
              </ul>

              <h4>2.2 Phase 2: Project Start-up & Planning</h4>
              <ul>
                <li><strong>Key Activities:</strong> Contract award, project team mobilisation, generation and refinement of the Project Management Plan (PMP) using the system&apos;s AI assistant followed by formal review and approval, establishment of project controls (cost, schedule, quality), detailed risk and opportunity workshops, procurement planning, and community engagement planning.</li>
                <li><strong>Key Deliverables:</strong> Approved PMP, Detailed Project Schedule (Baseline), Cost Plan, Project Risk & Opportunity Register, Safety in Design Report, Community Engagement Plan.</li>
              </ul>

              <h4>2.3 Phase 3: Project Execution & Monitoring</h4>
              <ul>
                <li><strong>Key Activities:</strong> Implementation of the PMP, management of construction activities, subcontractor management, performance monitoring via the real-time project dashboard tracking progress of Lots, NCRs, and ITPs, ongoing risk management, change control, stakeholder communication, and regular project reporting.</li>
                <li><strong>Key Deliverables:</strong> Monthly Progress Reports, Variation Register, updated Risk Register, NCRs, audit reports.</li>
              </ul>

              <h4>2.4 Phase 4: Project Close-out & Handover</h4>
              <ul>
                <li><strong>Key Activities:</strong> Achieving practical completion, managing the defects liability period, finalising all commercial arrangements, compiling the final handover package by exporting the required records directly from the project&apos;s Document, Lot, and ITP registers, conducting a post-project review and lessons learned workshop.</li>
                <li><strong>Key Deliverables:</strong> Handover Report, As-Built Drawings, Quality Records Dossier, Final Financial Report, Lessons Learned Report.</li>
              </ul>

              <div className="mt-8 p-4 border rounded bg-white">
                <h3 className="font-semibold mb-2">Open Editable Template Pages</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/pqp-template">PQP Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/emp-template">EMP Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/ohsmp-template">OHSMP Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/tmp-template">TMP Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/swms-template">SWMS Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/itp-template">ITP Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/quality-inspection">Quality Inspection Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/site-induction">Site Induction Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/pre-start-template">Pre-start Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/risk-assessment">Risk Assessment Template</a></li>
                  <li><a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/emergency-plan">Emergency Plan Template</a></li>
                </ul>
              </div>

              <h3 className="mt-8 mb-4">3.0 Key Management Processes</h3>
              
              <h4>3.1 Governance & Reporting</h4>
              <p>A clear governance structure will be established for each project, defining roles, responsibilities, and authorities. Monthly project review meetings will be held to assess performance against KPIs for schedule, cost, safety, quality, and environment. A formal Monthly Project Report shall be submitted to senior management.</p>
              
              <h4>3.2 Risk & Opportunity Management</h4>
              <p>Project risks and opportunities shall be managed in accordance with &apos;Procedure for Risk & Opportunity Management&apos; (C-QSE-PROC-002). This includes maintaining a live project risk register, conducting regular risk reviews, and implementing mitigation strategies.</p>

              <h4>3.3 Change Control</h4>
              <p>Any deviation from the approved project scope, schedule, or budget must be managed through a formal Change Control process. All variations must be documented, assessed for their impact, and approved by the appropriate authority level before implementation.</p>

              <h4>3.4 Community Engagement</h4>
              <p>Community and stakeholder engagement will be managed proactively in line with the project-specific Community Engagement Plan, ensuring minimal disruption and maintaining the company&apos;s social license to operate.</p>

            </div>
            )}
          </div>
        </section>
        {/* Documents will be added here sequentially */}
        
        {/* Document 13: Project Quality Plan (PQP) Template */}
        <section id="pqp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('pqp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Quality Plan (PQP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for project-specific quality planning and management, used in AI-driven PMP generation workflow.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/pqp-template">Open editable PQP template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['pqp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['pqp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-PQP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Project Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Client:</td><td className="border p-2">[Enter Client Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Contract Value:</td><td className="border p-2">[Enter Value]</td></tr>
                    <tr><td className="border p-2 font-semibold">Project Manager:</td><td className="border p-2">[Enter PM Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">QA/QC Manager:</td><td className="border p-2">[Enter QA Manager]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Quality Policy & Objectives</h3>
              <p><strong>Quality Policy Statement:</strong> [Reference corporate QSE Policy QSE-5.2-POL-01]</p>
              <p><strong>Project-Specific Quality Objectives:</strong></p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Quality Objective</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Measurement Method</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter objective]</td>
                      <td className="border p-2">[Enter target]</td>
                      <td className="border p-2">[Enter measurement]</td>
                      <td className="border p-2">[Enter responsible party]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">3.0 Lot Management</h3>
              <p>This project utilizes the integrated Lot Management System for quality control. Lots are managed within the <code>/projects/[projectId]/lots</code> module with the following structure:</p>
              <ul>
                <li><strong>Lot Register:</strong> All work packages tracked with unique identifiers</li>
                <li><strong>ITP Assignment:</strong> Each lot linked to appropriate Inspection & Test Plans</li>
                <li><strong>Progress Tracking:</strong> Real-time status updates and completion records</li>
                <li><strong>NCR Integration:</strong> Non-conformances linked to specific lots for traceability</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Inspection & Test Plans (ITPs)</h3>
              <p>ITPs are generated through the AI-driven ITP Generation Agent and managed within the system:</p>
              <ul>
                <li><strong>ITP Templates:</strong> Based on project specifications and industry standards</li>
                <li><strong>Digital Execution:</strong> ITPs executed using tablets with real-time data entry</li>
                <li><strong>Hold Points:</strong> Automatic notifications to relevant parties for sign-off</li>
                <li><strong>Records Management:</strong> All ITP templates are managed in <code>/projects/[projectId]/quality/itp-templates-register</code>; per‑lot ITP instances live in the Lot Register.</li>
              </ul>

              <h3 className="mt-8 mb-4">5.0 Quality Risks & Mitigation</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Quality Risk</th>
                      <th className="border p-2 text-left">Impact</th>
                      <th className="border p-2 text-left">Likelihood</th>
                      <th className="border p-2 text-left">Mitigation Measures</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter risk description]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[Enter mitigation measures]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">6.0 Handover Records</h3>
              <p>The following records will be compiled for project handover using the system&apos;s export functionality:</p>
              <ul>
                <li>Completed ITP Register with all test results and certifications</li>
                <li>As-Built Documentation from Document Register</li>
                <li>NCR Register with closure evidence</li>
                <li>Material Certificates and Compliance Documentation</li>
                <li>Final Quality Audit Report</li>
              </ul>

              <h3 className="mt-8 mb-4">7.0 Quality KPIs</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">KPI</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Current Performance</th>
                      <th className="border p-2 text-left">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">ITP First-Pass Rate</td>
                      <td className="border p-2">[Enter target %]</td>
                      <td className="border p-2">[Auto-populated from system]</td>
                      <td className="border p-2">[System trend analysis]</td>
                    </tr>
                    <tr>
                      <td className="border p-2">NCR Closure Rate</td>
                      <td className="border p-2">[Enter target days]</td>
                      <td className="border p-2">[Auto-populated from system]</td>
                      <td className="border p-2">[System trend analysis]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 14: Environmental Management Plan (EMP) Template */}
        <section id="emp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('emp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Environmental Management Plan (EMP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for project-specific environmental management and compliance monitoring.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/emp-template">Open editable EMP template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CloudSun className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['emp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['emp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-EMP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Project Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Location:</td><td className="border p-2">[Enter Project Location]</td></tr>
                    <tr><td className="border p-2 font-semibold">Environmental Manager:</td><td className="border p-2">[Enter Environmental Manager]</td></tr>
                    <tr><td className="border p-2 font-semibold">Approval Authority:</td><td className="border p-2">[Enter Approval Authority]</td></tr>
                    <tr><td className="border p-2 font-semibold">EMP Approval Date:</td><td className="border p-2">[Enter Approval Date]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Environmental Policy & Objectives</h3>
              <p><strong>Environmental Policy:</strong> [Reference corporate Environmental Policy QSE-5.2-POL-01]</p>
              <p><strong>Project Environmental Objectives:</strong></p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Environmental Objective</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Monitoring Method</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter environmental objective]</td>
                      <td className="border p-2">[Enter quantified target]</td>
                      <td className="border p-2">[Enter monitoring/measurement method]</td>
                      <td className="border p-2">[Enter responsible party]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">3.0 Environmental Aspects & Impacts Register</h3>
              <p>Environmental aspects are managed and tracked through the system&apos;s environmental register module. The following table identifies project-specific aspects:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Activity</th>
                      <th className="border p-2 text-left">Environmental Aspect</th>
                      <th className="border p-2 text-left">Environmental Impact</th>
                      <th className="border p-2 text-left">Significance</th>
                      <th className="border p-2 text-left">Control Measures</th>
                      <th className="border p-2 text-left">Linked Lot IDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter activity/work package]</td>
                      <td className="border p-2">[Enter environmental aspect]</td>
                      <td className="border p-2">[Enter potential impact]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[Enter control measures]</td>
                      <td className="border p-2">[Link to Lot Register IDs]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">4.0 Legal & Other Requirements</h3>
              <p>All environmental legal requirements are tracked through the <code>/qse/corp-legal</code> module. Project-specific permits and approvals include:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Permit/Approval</th>
                      <th className="border p-2 text-left">Authority</th>
                      <th className="border p-2 text-left">Key Conditions</th>
                      <th className="border p-2 text-left">Expiry Date</th>
                      <th className="border p-2 text-left">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter permit name]</td>
                      <td className="border p-2">[Enter issuing authority]</td>
                      <td className="border p-2">[Enter key conditions]</td>
                      <td className="border p-2">[Enter expiry date]</td>
                      <td className="border p-2">[Compliant/Non-Compliant]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">5.0 Environmental Controls & Procedures</h3>
              <p>Environmental controls are implemented through the following mechanisms:</p>
              <ul>
                <li><strong>Erosion & Sediment Control:</strong> [Enter specific controls for site]</li>
                <li><strong>Dust Management:</strong> [Enter dust control measures]</li>
                <li><strong>Noise Management:</strong> [Enter noise control measures]</li>
                <li><strong>Waste Management:</strong> [Enter waste minimization and disposal procedures]</li>
                <li><strong>Fuel & Chemical Storage:</strong> [Enter storage and handling requirements]</li>
                <li><strong>Flora & Fauna Protection:</strong> [Enter biodiversity protection measures]</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Emergency Response Procedures</h3>
              <p>Environmental emergency procedures are detailed in the Emergency Response Plan (QSE-8.1-TEMP-ERP). Specific environmental emergencies include:</p>
              <ul>
                <li>Chemical/fuel spills</li>
                <li>Uncontrolled sediment discharge</li>
                <li>Accidental harm to protected flora/fauna</li>
                <li>Groundwater contamination</li>
              </ul>

              <h3 className="mt-8 mb-4">7.0 Monitoring & Measurement</h3>
              <p>Environmental monitoring results are recorded in the system&apos;s monitoring register. Key monitoring activities include:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Parameter</th>
                      <th className="border p-2 text-left">Monitoring Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Criteria/Limits</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter parameter - e.g., Water quality]</td>
                      <td className="border p-2">[Enter monitoring method]</td>
                      <td className="border p-2">[Enter frequency]</td>
                      <td className="border p-2">[Enter acceptance criteria]</td>
                      <td className="border p-2">[Enter responsible person]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">8.0 Training & Competence</h3>
              <p>Environmental training requirements are managed through the competence module (<code>/qse/corp-competence</code>). Project-specific training includes:</p>
              <ul>
                <li>Site environmental induction</li>
                <li>Spill response procedures</li>
                <li>Erosion and sediment control practices</li>
                <li>Waste segregation and disposal</li>
                <li>Protected species identification</li>
              </ul>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 15: OHSMP Template */}
        <section id="ohsmp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('ohsmp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Occupational Health & Safety Management Plan (OHSMP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for project-specific health and safety management and risk control.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/ohsmp-template">Open editable OHSMP template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['ohsmp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['ohsmp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-OHSMP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Project Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Project Manager:</td><td className="border p-2">[Enter Project Manager]</td></tr>
                    <tr><td className="border p-2 font-semibold">Safety Manager:</td><td className="border p-2">[Enter Safety Manager]</td></tr>
                    <tr><td className="border p-2 font-semibold">Principal Contractor:</td><td className="border p-2">[Enter Principal Contractor]</td></tr>
                    <tr><td className="border p-2 font-semibold">Commencement Date:</td><td className="border p-2">[Enter Start Date]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Health & Safety Policy & Objectives</h3>
              <p><strong>WHS Policy:</strong> [Reference corporate WHS Policy QSE-5.2-POL-01]</p>
              <p><strong>Project Safety Objectives:</strong></p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Safety Objective</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Measurement</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter safety objective]</td>
                      <td className="border p-2">[Enter quantified target]</td>
                      <td className="border p-2">[Enter measurement method]</td>
                      <td className="border p-2">[Enter responsible party]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">3.0 Hazard Identification & Risk Assessment</h3>
              <p>Project hazards are identified and assessed using the corporate risk assessment process. High-risk activities include:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Activity/Task</th>
                      <th className="border p-2 text-left">Hazard</th>
                      <th className="border p-2 text-left">Risk Rating</th>
                      <th className="border p-2 text-left">Control Measures</th>
                      <th className="border p-2 text-left">SWMS Required</th>
                      <th className="border p-2 text-left">Linked Lot IDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter activity]</td>
                      <td className="border p-2">[Enter hazard]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[Enter control measures]</td>
                      <td className="border p-2">[Yes/No]</td>
                      <td className="border p-2">[Link to Lot Register IDs]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">4.0 Safety Management Systems</h3>
              <p>Safety management is integrated with the project management system through the following processes:</p>
              <ul>
                <li><strong>Pre-Start Meetings:</strong> Daily safety briefings using digital forms (QSE-8.1-TEMP-PRESTART)</li>
                <li><strong>SWMS Management:</strong> Safe Work Method Statements for high-risk activities (QSE-8.1-TEMP-SWMS)</li>
                <li><strong>Incident Reporting:</strong> Digital incident reporting through the system&apos;s NCR module</li>
                <li><strong>Safety Inspections:</strong> Regular safety inspections recorded in the inspection register</li>
                <li><strong>Toolbox Talks:</strong> Weekly safety meetings with attendance tracked in the system</li>
              </ul>

              <h3 className="mt-8 mb-4">5.0 Emergency Response</h3>
              <p>Emergency response procedures are detailed in the Emergency Response Plan (QSE-8.1-TEMP-ERP). Key emergency scenarios include:</p>
              <ul>
                <li>Medical emergencies and injuries</li>
                <li>Fire and explosion</li>
                <li>Structural collapse</li>
                <li>Confined space incidents</li>
                <li>Chemical exposure</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Training & Competence</h3>
              <p>Safety training requirements are managed through the competence module. All personnel must complete:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Training Type</th>
                      <th className="border p-2 text-left">Target Audience</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Record Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Site Safety Induction</td>
                      <td className="border p-2">All site personnel</td>
                      <td className="border p-2">Before site entry</td>
                      <td className="border p-2">Training register in system</td>
                    </tr>
                    <tr>
                      <td className="border p-2">[Enter additional training]</td>
                      <td className="border p-2">[Enter target audience]</td>
                      <td className="border p-2">[Enter frequency]</td>
                      <td className="border p-2">[Enter record location]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">7.0 Consultation & Communication</h3>
              <p>Worker consultation is conducted in accordance with the Consultation & Participation Procedure (QSE-5.4-PROC-01). Project-specific consultation includes:</p>
              <ul>
                <li>Health & Safety Representative (HSR) involvement</li>
                <li>Safety committee meetings</li>
                <li>Toolbox talk feedback sessions</li>
                <li>Incident investigation participation</li>
              </ul>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 16: Traffic Management Plan Template */}
        <section id="tmp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-yellow-100 text-gray-900 p-6 cursor-pointer hover:bg-yellow-200 transition-colors"
              onClick={() => toggleDoc('tmp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Traffic Management Plan (TMP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for managing traffic safety and mobility during construction activities.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/tmp-template">Open editable TMP template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['tmp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['tmp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-TMP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Project Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Road Authority:</td><td className="border p-2">[Enter Road Authority]</td></tr>
                    <tr><td className="border p-2 font-semibold">Traffic Manager:</td><td className="border p-2">[Enter Traffic Manager]</td></tr>
                    <tr><td className="border p-2 font-semibold">Permit Number:</td><td className="border p-2">[Enter Permit Number]</td></tr>
                    <tr><td className="border p-2 font-semibold">Construction Period:</td><td className="border p-2">[Enter Start - End Dates]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Traffic Management Objectives</h3>
              <ul>
                <li>Maintain safe passage for all road users during construction</li>
                <li>Minimize traffic delays and disruptions</li>
                <li>Protect construction workers from traffic-related hazards</li>
                <li>Comply with Austroads Guide to Traffic Management and local authority requirements</li>
                <li>Maintain emergency vehicle access at all times</li>
              </ul>

              <h3 className="mt-8 mb-4">3.0 Site Analysis</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Road Classification:</td><td className="border p-2">[Enter road classification]</td></tr>
                    <tr><td className="border p-2 font-semibold">Speed Limit:</td><td className="border p-2">[Enter speed limit]</td></tr>
                    <tr><td className="border p-2 font-semibold">AADT (Average Annual Daily Traffic):</td><td className="border p-2">[Enter AADT]</td></tr>
                    <tr><td className="border p-2 font-semibold">Peak Traffic Times:</td><td className="border p-2">[Enter peak periods]</td></tr>
                    <tr><td className="border p-2 font-semibold">Heavy Vehicle Percentage:</td><td className="border p-2">[Enter percentage]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">4.0 Traffic Control Measures</h3>
              <p>Traffic control measures are implemented according to work zone phases linked to the Lot Register:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Work Phase/Lot ID</th>
                      <th className="border p-2 text-left">Traffic Control Type</th>
                      <th className="border p-2 text-left">Lane Configuration</th>
                      <th className="border p-2 text-left">Duration</th>
                      <th className="border p-2 text-left">Signage Requirements</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter lot ID/work phase]</td>
                      <td className="border p-2">[Enter control type]</td>
                      <td className="border p-2">[Enter lane configuration]</td>
                      <td className="border p-2">[Enter duration]</td>
                      <td className="border p-2">[Enter signage requirements]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">5.0 Traffic Control Personnel</h3>
              <p>All traffic control personnel must be appropriately trained and certified. Requirements tracked in the competence module:</p>
              <ul>
                <li>Traffic Controller certification (minimum requirements)</li>
                <li>Site-specific traffic management training</li>
                <li>Emergency response procedures</li>
                <li>Communication protocols</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Communication Plan</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Stakeholder</th>
                      <th className="border p-2 text-left">Information Required</th>
                      <th className="border p-2 text-left">Method</th>
                      <th className="border p-2 text-left">Timing</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Local community</td>
                      <td className="border p-2">Construction impacts, delays</td>
                      <td className="border p-2">Letterbox drop, website</td>
                      <td className="border p-2">5 days prior</td>
                      <td className="border p-2">[Enter responsible person]</td>
                    </tr>
                    <tr>
                      <td className="border p-2">[Enter stakeholder]</td>
                      <td className="border p-2">[Enter information]</td>
                      <td className="border p-2">[Enter method]</td>
                      <td className="border p-2">[Enter timing]</td>
                      <td className="border p-2">[Enter responsible person]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">7.0 Emergency Procedures</h3>
              <p>Emergency procedures for traffic incidents are integrated with the overall Emergency Response Plan (QSE-8.1-TEMP-ERP):</p>
              <ul>
                <li>Vehicle breakdown in work zone</li>
                <li>Traffic control equipment failure</li>
                <li>Vehicle-worker collision</li>
                <li>Emergency vehicle access requirements</li>
                <li>Severe weather event procedures</li>
              </ul>

              <h3 className="mt-8 mb-4">8.0 Monitoring & Review</h3>
              <p>Traffic management effectiveness is monitored through:</p>
              <ul>
                <li>Daily traffic control inspections recorded in system</li>
                <li>Traffic flow monitoring and delay measurement</li>
                <li>Incident/near-miss reporting via NCR system</li>
                <li>Regular consultation with road authority</li>
                <li>Post-implementation review and lessons learned</li>
              </ul>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 17: SWMS Template */}
        <section id="swms-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('swms-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Safe Work Method Statement (SWMS) Template</h2>
                  <p className="text-gray-700">A template for documenting safe work procedures for high-risk construction activities.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/swms-template">Open editable SWMS template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['swms-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['swms-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-SWMS</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Work Activity Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Work Activity:</td><td className="border p-2">[Enter Specific Activity]</td></tr>
                    <tr><td className="border p-2 font-semibold">Location/Lot ID:</td><td className="border p-2">[Enter Location/Lot ID from Lot Register]</td></tr>
                    <tr><td className="border p-2 font-semibold">Supervisor:</td><td className="border p-2">[Enter Supervisor Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Planned Start Date:</td><td className="border p-2">[Enter Start Date]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 High Risk Construction Work Classification</h3>
              <p>This SWMS covers the following high-risk construction work (tick applicable):</p>
              <div className="grid grid-cols-2 gap-2 mb-8">
                <div className="flex items-center"><span className="mr-2">☐</span>Work at height ({'>'}2m)</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Confined space entry</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Excavation {'>'}1.5m deep</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Structural alteration/demolition</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Work near live electrical</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Traffic management</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Crane/lifting operations</div>
                <div className="flex items-center"><span className="mr-2">☐</span>Work near water</div>
              </div>

              <h3 className="mt-8 mb-4">3.0 Hazard Identification & Risk Assessment</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Work Step</th>
                      <th className="border p-2 text-left">Hazard</th>
                      <th className="border p-2 text-left">Risk Rating</th>
                      <th className="border p-2 text-left">Control Measures</th>
                      <th className="border p-2 text-left">Residual Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter work step]</td>
                      <td className="border p-2">[Enter identified hazard]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[Enter control measures]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">4.0 Legislative Requirements</h3>
              <p>This work must comply with the following legislation and standards:</p>
              <ul>
                <li>Work Health and Safety Act 2011</li>
                <li>Work Health and Safety Regulation 2017</li>
                <li>AS/NZS 1891 - Industrial fall-arrest systems</li>
                <li>AS 2550 - Cranes, hoists and winches</li>
                <li>[Enter additional relevant standards]</li>
              </ul>

              <h3 className="mt-8 mb-4">5.0 Competency & Training Requirements</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Role/Position</th>
                      <th className="border p-2 text-left">Required Competency</th>
                      <th className="border p-2 text-left">Evidence Required</th>
                      <th className="border p-2 text-left">Verification Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter role]</td>
                      <td className="border p-2">[Enter required competency]</td>
                      <td className="border p-2">[Enter evidence - license, certificate]</td>
                      <td className="border p-2">[System competence register check]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">6.0 Plant, Equipment & Materials</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Item</th>
                      <th className="border p-2 text-left">Safety Requirements</th>
                      <th className="border p-2 text-left">Inspection/Test Required</th>
                      <th className="border p-2 text-left">Documentation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter plant/equipment]</td>
                      <td className="border p-2">[Enter safety requirements]</td>
                      <td className="border p-2">[Enter inspection requirements]</td>
                      <td className="border p-2">[Enter required documentation]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">7.0 Emergency Procedures</h3>
              <p>Emergency procedures specific to this work activity:</p>
              <ul>
                <li><strong>Emergency Contacts:</strong> [Enter emergency contact numbers]</li>
                <li><strong>Evacuation Procedures:</strong> [Enter evacuation routes and assembly points]</li>
                <li><strong>First Aid:</strong> [Enter first aid arrangements and qualified personnel]</li>
                <li><strong>Incident Reporting:</strong> All incidents reported immediately via system NCR module</li>
              </ul>

              <h3 className="mt-8 mb-4">8.0 Sign-off & Communication</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Role</th>
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Signature</th>
                      <th className="border p-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">SWMS Preparer</td>
                      <td className="border p-2">[Enter name]</td>
                      <td className="border p-2">[Signature field]</td>
                      <td className="border p-2">[Enter date]</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Supervisor Review</td>
                      <td className="border p-2">[Enter name]</td>
                      <td className="border p-2">[Signature field]</td>
                      <td className="border p-2">[Enter date]</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Project Manager Approval</td>
                      <td className="border p-2">[Enter name]</td>
                      <td className="border p-2">[Signature field]</td>
                      <td className="border p-2">[Enter date]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p><strong>Note:</strong> All personnel involved in this work must be briefed on this SWMS prior to commencement. Briefing records maintained in the system&apos;s training register.</p>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 18: ITP Template */}
        <section id="itp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-indigo-100 text-gray-900 p-6 cursor-pointer hover:bg-indigo-200 transition-colors"
              onClick={() => toggleDoc('itp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Inspection & Test Plan (ITP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for inspection and testing procedures, linked to the ITP Generation Agent.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/itp-template">Open editable ITP template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TestTube className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['itp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['itp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-ITP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 ITP Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">ITP Number:</td><td className="border p-2">[Auto-generated by ITP Agent]</td></tr>
                    <tr><td className="border p-2 font-semibold">Work Package/Lot ID:</td><td className="border p-2">[Linked to Lot Register]</td></tr>
                    <tr><td className="border p-2 font-semibold">Specification Reference:</td><td className="border p-2">[Enter specification section]</td></tr>
                    <tr><td className="border p-2 font-semibold">QA Engineer:</td><td className="border p-2">[Enter QA Engineer]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Scope of Work</h3>
              <p>This ITP covers the following activities and deliverables:</p>
              <ul>
                <li>[Enter specific work activities covered by this ITP]</li>
                <li>[Enter specific deliverables and quality criteria]</li>
                <li>[Enter applicable standards and specifications]</li>
              </ul>

              <h3 className="mt-8 mb-4">3.0 Inspection & Test Schedule</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Activity</th>
                      <th className="border p-2 text-left">Inspection Point</th>
                      <th className="border p-2 text-left">Test/Criteria</th>
                      <th className="border p-2 text-left">Hold Point</th>
                      <th className="border p-2 text-left">Responsible Party</th>
                      <th className="border p-2 text-left">Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter construction activity]</td>
                      <td className="border p-2">[Enter when inspection occurs]</td>
                      <td className="border p-2">[Enter test method/acceptance criteria]</td>
                      <td className="border p-2">[Yes/No - requires approval to proceed]</td>
                      <td className="border p-2">[Enter responsible party - Contractor/Client/Independent]</td>
                      <td className="border p-2">[Enter required documentation]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">4.0 Material Testing Requirements</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Material</th>
                      <th className="border p-2 text-left">Test Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Acceptance Criteria</th>
                      <th className="border p-2 text-left">Testing Laboratory</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter material type]</td>
                      <td className="border p-2">[Enter test standard - e.g., AS 1289.3.6.1]</td>
                      <td className="border p-2">[Enter test frequency]</td>
                      <td className="border p-2">[Enter acceptance criteria]</td>
                      <td className="border p-2">[Enter NATA accredited laboratory]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">5.0 Documentation Requirements</h3>
              <p>The following documentation must be submitted and stored in the project Document Register:</p>
              <ul>
                <li>Material certificates and compliance statements</li>
                <li>Test certificates from accredited laboratories</li>
                <li>Inspection checklists and photographs</li>
                <li>Non-conformance reports (if applicable)</li>
                <li>As-built drawings (where applicable)</li>
                <li>Manufacturer warranties and installation certificates</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Non-Conformance Management</h3>
              <p>Non-conformances identified during inspections and testing are managed through the integrated NCR system:</p>
              <ul>
                <li>Immediate notification via the system&apos;s NCR module</li>
                <li>Root cause analysis and corrective action planning</li>
                <li>Re-inspection and testing following corrective actions</li>
                <li>Close-out verification and documentation</li>
                <li>Lessons learned integration into future ITPs</li>
              </ul>

              <h3 className="mt-8 mb-4">7.0 Hold Point Management</h3>
              <p>Hold points require formal approval before work can proceed:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Hold Point</th>
                      <th className="border p-2 text-left">Approval Authority</th>
                      <th className="border p-2 text-left">Notification Method</th>
                      <th className="border p-2 text-left">Required Lead Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter hold point description]</td>
                      <td className="border p-2">[Enter approval authority]</td>
                      <td className="border p-2">[Automatic system notification]</td>
                      <td className="border p-2">[Enter required notice period]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">8.0 Digital Execution</h3>
              <p>This ITP is executed using the integrated digital system:</p>
              <ul>
                <li><strong>Tablet-Based Inspection:</strong> Real-time data entry and photo capture</li>
                <li><strong>GPS Location Tracking:</strong> Automatic location stamping for inspections</li>
                <li><strong>Digital Signatures:</strong> Electronic sign-off by authorized personnel</li>
                <li><strong>Automatic Notifications:</strong> Alerts for hold points and non-conformances</li>
                <li><strong>Real-Time Reporting:</strong> Live dashboard updates and progress tracking</li>
              </ul>
            </div>
            )}
          </div>
        </section>
        
        {/* Document 12: Quality Inspection Template */}
        <section id="quality-inspection" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('quality-inspection')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Quality Inspection / ITP Record Template</h2>
                  <p className="text-gray-700">A standard form for documenting the results of quality inspections and tests.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/quality-inspection">Open editable Quality Inspection template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['quality-inspection'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['quality-inspection'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-05</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-collapse">
                        <tbody>
                             <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Inspection & Test Record</td></tr>
                            <tr>
                                <td className="border p-2 font-bold">Project:</td><td className="border p-2" colSpan={3}></td>
                            </tr>
                            <tr>
                                <td className="border p-2 font-bold">ITP Reference:</td><td className="border p-2"></td>
                                <td className="border p-2 font-bold">Lot / Location:</td><td className="border p-2"></td>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="border p-2 font-bold">Inspection/Test Item</td>
                                <td className="border p-2 font-bold">Specification/Criteria</td>
                                <td className="border p-2 font-bold">Result (Pass/Fail)</td>
                                <td className="border p-2 font-bold">Comments/Reference</td>
                            </tr>
                            <tr><td className="border p-2"></td><td className="border p-2"></td><td className="border p-2"></td><td className="border p-2"></td></tr>
                            <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Sign-off</td></tr>
                            <tr>
                                <td className="border p-2 font-bold">Inspected By:</td><td className="border p-2"></td>
                                <td className="border p-2 font-bold">Date:</td><td className="border p-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            )}
          </div>
        </section>
        {/* Document 11: Site Induction Template */}
        <section id="site-induction" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('site-induction')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Site Induction & Training Record Template</h2>
                  <p className="text-gray-700">A checklist and record for inducting new personnel onto a project site.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/site-induction">Open editable Site Induction template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['site-induction'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['site-induction'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-04</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
                </div>
                <p>This form is to be completed for all personnel prior to commencing work on site.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-collapse">
                        <tbody>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold text-center">Site Induction Record</td></tr>
                            <tr><td className="border p-2 font-bold">Personnel Name:</td><td className="border p-2"></td></tr>
                            <tr><td className="border p-2 font-bold">Company:</td><td className="border p-2"></td></tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold">Verification Checklist</td></tr>
                            <tr><td>Corporate Induction Complete?</td><td className="border p-2 text-center">Y / N</td></tr>
                            <tr><td>Construction Induction (White Card) Sighted?</td><td className="border p-2 text-center">Y / N</td></tr>
                            <tr><td>Relevant Licenses / VOCs Sighted?</td><td className="border p-2 text-center">Y / N</td></tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold">Site-Specific Topics Covered</td></tr>
                            <tr><td>Project Overview & Scope</td><td className="border p-2 text-center">口</td></tr>
                            <tr><td>Site Emergency Procedures & Alarms</td><td className="border p-2 text-center">口</td></tr>
                            <tr><td>First Aid Facilities & Personnel</td><td className="border p-2 text-center">口</td></tr>
                            <tr><td>Site-Specific Hazards (e.g., overhead powerlines)</td><td className="border p-2 text-center">口</td></tr>
                            <tr><td>Environmental Controls (e.g., sediment basins, waste skips)</td><td className="border p-2 text-center">口</td></tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold">Declaration</td></tr>
                            <tr><td colSpan={2} className="border p-2">I have received and understood the site induction, and I agree to comply with all site safety and environmental rules.</td></tr>
                            <tr><td className="border p-2 font-bold">Signature:</td><td className="border p-2"></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            )}
          </div>
        </section>
        {/* Document 10: Pre-start Template */}
        <section id="pre-start-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('pre-start-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pre-start Meeting / Toolbox Talk Record Template</h2>
                  <p className="text-gray-700">The standard form for documenting daily site safety and coordination meetings.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/pre-start-template">Open editable Pre-start template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['pre-start-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['pre-start-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-03</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-collapse">
                        <tbody>
                            <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Pre-start / Toolbox Talk Record</td></tr>
                            <tr>
                                <td className="border p-2 font-bold">Project:</td><td className="border p-2"></td>
                                <td className="border p-2 font-bold">Date:</td><td className="border p-2"></td>
                            </tr>
                            <tr>
                                <td className="border p-2 font-bold">Location:</td><td className="border p-2"></td>
                                <td className="border p-2 font-bold">Conducted By:</td><td className="border p-2"></td>
                            </tr>
                            <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Topics Discussed</td></tr>
                            <tr><td colSpan={4} className="border p-2 h-24 align-top">1. Todays Activities & Coordination:<br/>2. Key Safety Risks for Today:<br/>3. Environmental Considerations:</td></tr>
                            <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Issues Raised & Actions</td></tr>
                            <tr><td colSpan={4} className="border p-2 h-24 align-top"></td></tr>
                            <tr className="bg-gray-100"><td colSpan={4} className="border p-2 font-bold text-center">Attendees</td></tr>
                            <tr>
                                <td className="border p-2 font-bold">#</td>
                                <td className="border p-2 font-bold">Name (print)</td>
                                <td className="border p-2 font-bold">Company</td>
                                <td className="border p-2 font-bold">Signature</td>
                            </tr>
                            <tr>
                                <td className="border p-2">1</td><td className="border p-2"></td><td className="border p-2"></td><td className="border p-2"></td>
                            </tr>
                             <tr>
                                <td className="border p-2">2</td><td className="border p-2"></td><td className="border p-2"></td><td className="border p-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            )}
          </div>
        </section>
        {/* Document 9: Risk Assessment Template */}
        <section id="risk-assessment" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('risk-assessment')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Risk Assessment / SWMS Template</h2>
                  <p className="text-gray-700">The standard template for conducting risk assessments and documenting Safe Work Method Statements.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/risk-assessment">Open editable Risk Assessment template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['risk-assessment'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['risk-assessment'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-02</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
                </div>
                <p>This template provides the mandatory format for all Safe Work Method Statements (SWMS) for High Risk Construction Work.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-collapse">
                        <tbody>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold text-center">Safe Work Method Statement</td></tr>
                            <tr><td className="border p-2 font-bold">Project:</td><td className="border p-2"></td></tr>
                            <tr><td className="border p-2 font-bold">Principal Contractor:</td><td className="border p-2"><span style={{backgroundColor: 'yellow'}}>AustBuild Civil Pty Ltd</span></td></tr>
                            <tr><td className="border p-2 font-bold">Work Activity:</td><td className="border p-2"></td></tr>
                            <tr><td className="border p-2 font-bold">Date:</td><td className="border p-2"></td></tr>
                            <tr><td className="border p-2 font-bold">SWMS ID:</td><td className="border p-2"></td></tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold text-center">Required PPE</td></tr>
                            <tr><td colSpan={2} className="border p-2">Hard Hat, Steel Cap Boots, Hi-Vis Clothing, Safety Glasses, Gloves (as a minimum)</td></tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold text-center">Risk Assessment</td></tr>
                            {/* Risk Matrix Placeholder */}
                            <tr>
                                <td colSpan={2} className="border p-2">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th rowSpan={2} className="border p-1"></th>
                                                    <th colSpan={5} className="border p-1 text-center">Consequence</th>
                                                </tr>
                                                <tr>
                                                    <th className="border p-1">Insignificant</th>
                                                    <th className="border p-1">Minor</th>
                                                    <th className="border p-1">Moderate</th>
                                                    <th className="border p-1">Major</th>
                                                    <th className="border p-1">Catastrophic</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="border p-1 font-bold">Almost Certain</td><td className="border p-1 bg-yellow-300 text-center">H</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td></tr>
                                                <tr><td className="border p-1 font-bold">Likely</td><td className="border p-1 bg-yellow-300 text-center">M</td><td className="border p-1 bg-yellow-300 text-center">H</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td></tr>
                                                <tr><td className="border p-1 font-bold">Possible</td><td className="border p-1 bg-green-300 text-center">L</td><td className="border p-1 bg-yellow-300 text-center">M</td><td className="border p-1 bg-yellow-300 text-center">H</td><td className="border p-1 bg-red-500 text-center">E</td><td className="border p-1 bg-red-500 text-center">E</td></tr>
                                                <tr><td className="border p-1 font-bold">Unlikely</td><td className="border p-1 bg-green-300 text-center">L</td><td className="border p-1 bg-green-300 text-center">L</td><td className="border p-1 bg-yellow-300 text-center">M</td><td className="border p-1 bg-yellow-300 text-center">H</td><td className="border p-1 bg-red-500 text-center">E</td></tr>
                                                <tr><td className="border p-1 font-bold">Rare</td><td className="border p-1 bg-green-300 text-center">L</td><td className="border p-1 bg-green-300 text-center">L</td><td className="border p-1 bg-green-300 text-center">M</td><td className="border p-1 bg-yellow-300 text-center">H</td><td className="border p-1 bg-yellow-300 text-center">H</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-gray-100"><td colSpan={2} className="border p-2 font-bold text-center">Job Steps</td></tr>
                            <tr>
                                <td className="border p-2 font-bold">Sequence of Job Steps</td>
                                <td className="border p-2 font-bold">Potential Hazards</td>
                                <td className="border p-2 font-bold">Risk Rating (Initial)</td>
                                <td className="border p-2 font-bold">Control Measures</td>
                                <td className="border p-2 font-bold">Risk Rating (Residual)</td>
                                <td className="border p-2 font-bold">Person Responsible</td>
                            </tr>
                            <tr>
                                <td className="border p-2">1. </td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                            </tr>
                             <tr>
                                <td className="border p-2">2. </td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                                <td className="border p-2"></td>
                            </tr>
                        </tbody>
                    </table>
              </div>
            </div>
            )}
          </div>
        </section>
        {/* Document 8: Incident Reporting Procedure */}
        <section id="incident-report" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('incident-report')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Incident Reporting & Investigation Procedure</h2>
                  <p className="text-gray-700">A systematic process for reporting, classifying, and investigating incidents to prevent recurrence.</p>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['incident-report'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['incident-report'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-02</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To ensure all QSE incidents are reported, investigated, and analysed in a timely and systematic manner to identify root causes, implement effective corrective actions, and share lessons learned across the organisation.</p>
                
                <h3 className="mt-8 mb-4">2.0 Reporting Requirements</h3>
                <ul>
                    <li>All incidents, including injuries, illnesses, property damage, environmental spills, and near misses, must be reported to the immediate supervisor as soon as practicable.</li>
                    <li>The supervisor must enter the initial report into the company&apos;s safety management system (&apos;SafetyConnect&apos;) within 24 hours.</li>
                    <li>Notifiable incidents must be immediately reported to the regulator by the Project Manager or QSE Manager.</li>
              </ul>

                <h3 className="mt-8 mb-4">3.0 Investigation</h3>
                <p>The level of investigation shall be proportionate to the severity or potential severity of the incident. Significant incidents (with a high or extreme risk rating) must be investigated using the Incident Cause Analysis Method (ICAM) led by a trained investigator.</p>
            </div>
            )}
          </div>
        </section>
        {/* Document 7: Emergency Plan Template */}
        <section id="emergency-plan" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('emergency-plan')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Emergency Preparedness & Response Plan Template</h2>
                  <p className="text-gray-700">A template for developing project-specific plans to respond to foreseeable emergencies.</p>
                  <div className="mt-2 text-sm">
                    <a className="text-blue-600 underline" href="/qse/corp-op-procedures-templates/emergency-plan">Open editable Emergency Plan template</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['emergency-plan'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['emergency-plan'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-01</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>This document provides a template for the creation of a site-specific Emergency Preparedness and Response Plan. Each project must adapt this template to address its specific risks and location.</p>
                
                <h3 className="mt-8 mb-4">2.0 Emergency Contact Details</h3>
                <p>This section must be populated with project-specific contact numbers for all key personnel (Project Manager, Supervisors, First Aiders) and external emergency services.</p>

                <h3 className="mt-8 mb-4">3.0 Specific Emergency Responses</h3>
                <p>The plan must include step-by-step response procedures for foreseeable emergencies, including but not limited to:</p>
                <ul>
                    <li>Medical Emergency / Serious Injury</li>
                    <li>Fire</li>
                    <li>Major Environmental Spill</li>
                    <li>Structural Collapse or Failure</li>
                    <li>Traffic Incident on or near site</li>
              </ul>

                <h3 className="mt-8 mb-4">4.0 Drills and Exercises</h3>
                <p>Emergency response procedures must be tested through regular drills (at least every 6 months) to ensure they are effective and that all personnel are familiar with their roles.</p>
            </div>
            )}
          </div>
        </section>
        {/* Document 6: WHS Management Procedure */}
        <section id="whs-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('whs-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">WHS Management Procedure</h2>
                  <p className="text-gray-700">The framework for managing Work Health & Safety risks and ensuring a safe workplace for everyone.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['whs-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['whs-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-03</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To outline the mandatory processes for managing Work Health and Safety (WHS) risks, ensuring compliance with legislation, and systematically working towards the elimination of work-related injury and illness.</p>
                
                <h3 className="mt-8 mb-4">2.0 WHS Risk Management</h3>
                <p>WHS risks shall be managed by following the hierarchy of controls. Project-specific WHS risks are to be identified and assessed in the Project Risk Register, with detailed controls documented in SWMS for high-risk activities.</p>

                <h3 className="mt-8 mb-4">3.0 Consultation & Participation</h3>
                <p>We are committed to consulting with our workers on WHS matters. This is achieved through Health and Safety Committees, daily pre-start meetings, and the development of SWMS in consultation with the work crews.</p>

                <h3 className="mt-8 mb-4">4.0 Incident Management</h3>
                <p>All WHS incidents, including near misses, must be reported immediately. Serious incidents will be investigated using the ICAM methodology to identify root causes and implement effective corrective actions.</p>
            </div>
            )}
          </div>
        </section>
        {/* Document 5: Environmental Management Procedure */}
        <section id="environmental-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-teal-100 text-gray-900 p-6 cursor-pointer hover:bg-teal-200 transition-colors"
              onClick={() => toggleDoc('environmental-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Environmental Management Procedure</h2>
                  <p className="text-gray-700">Identifying and controlling environmental aspects and impacts on our projects.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Recycle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['environmental-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['environmental-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-04</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To establish a framework for identifying, assessing, and managing environmental aspects and impacts associated with our construction activities, ensuring compliance with legal requirements and promoting environmental protection.</p>
                
                <h3 className="mt-8 mb-4">2.0 Key Management Areas</h3>
                
                <h4>2.1 Erosion & Sediment Control</h4>
                <p>All projects must implement an Erosion and Sediment Control Plan (ESCP) to minimise the impact of soil disturbance on waterways. Controls (e.g., sediment fences, catch drains) must be in place before bulk earthworks commence and be maintained regularly, especially after rainfall.</p>

                <h4>2.2 Waste Management</h4>
                <p>Waste shall be managed according to the waste hierarchy (Avoid, Reduce, Reuse, Recycle, Dispose). All waste streams must be segregated on site, and licensed contractors used for disposal. Waste tracking records must be maintained.</p>

                <h4>2.3 Spill Prevention & Response</h4>
                <p>All hazardous substances must be stored in appropriately bunded areas. Spill kits must be readily available where liquids are stored or transferred. In the event of a spill, it must be contained immediately, and reported in accordance with the Incident Reporting Procedure.</p>

            </div>
            )}
          </div>
        </section>
        {/* Document 4: Construction Control Procedure */}
        <section id="construction-control" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('construction-control')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Construction & Operational Control Procedure</h2>
                  <p className="text-gray-700">Defining the core processes for planning and executing work on site to control QSE risks.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Hammer className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['construction-control'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['construction-control'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-05</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To ensure that all construction and operational activities are planned and executed in a controlled manner that prevents harm to people, protects the environment, and meets quality specifications.</p>
                
                <h3 className="mt-8 mb-4">2.0 Risk-Based Work Planning</h3>
                <p>All on-site work must be planned and executed using a hierarchy of risk control documentation.</p>
                <h4>2.1 Safe Work Method Statements (SWMS)</h4>
                <ul>
                    <li>A SWMS is required for all High Risk Construction Work (HRCW) as defined by WHS Regulations.</li>
                    <li>The SWMS must be developed in consultation with the workers undertaking the task.</li>
                    <li>It must identify the steps of the task, the potential hazards, and the control measures to be implemented.</li>
                    <li>No HRCW shall commence until the SWMS has been reviewed and approved by the site supervisor and all workers involved have signed on to it.</li>
              </ul>

                <h4>2.2 Inspection and Test Plans (ITPs)</h4>
                <p>ITPs shall be developed for all key construction processes to ensure quality requirements are met. The ITP will detail the sequence of inspections, tests, hold points, and records required to verify conformity.</p>
            </div>
            )}
          </div>
        </section>
        {/* Document 3: Design Control Procedure */}
        <section id="design-control" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('design-control')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Design & Development Control Procedure</h2>
                  <p className="text-gray-700">Managing client-supplied and minor temporary works designs to ensure QSE compliance and constructability.</p>
                </div>
                <div className="flex items-center gap-3">
                  <TestTube className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['design-control'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['design-control'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-06</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To establish a systematic process for the review, verification, and management of designs used for construction. While <span style={{backgroundColor: 'yellow'}}>AustBuild Civil Pty Ltd</span> typically does not perform principal design, this procedure ensures that client-supplied designs are fit for purpose and that any minor or temporary works designs we produce are safe, compliant, and controlled.</p>
                
                <h3 className="mt-8 mb-4">2.0 Management of Client-Supplied Design</h3>
                <h4>2.1 Design Input Review</h4>
                <p>Upon receipt, all client-supplied design packages shall undergo a formal multi-disciplinary review before being issued &apos;For Construction&apos;. This review shall assess:</p>
                <ul>
                    <li><strong>Constructability:</strong> Feasibility of construction methods, site access, and sequencing.</li>
                    <li><strong>Safety in Design:</strong> Identification of hazards that may be introduced during construction, maintenance, or demolition, and verification that risks are eliminated or minimised So Far As Is Reasonably Practicable (SFAIRP).</li>
                    <li><strong>Environmental Considerations:</strong> Impact on sensitive receivers, heritage items, flora, and fauna.</li>
                    <li><strong>Quality:</strong> Clarity, completeness, and absence of conflicts within the design documentation.</li>
              </ul>
                <p>Findings from this review will be documented in a Design Review Report and communicated to the client.</p>

                <h4>2.2 Design Verification</h4>
                <p>Where specified by the contract or deemed necessary by the Project Manager, key design elements shall be subject to independent verification by a competent third-party engineer.</p>

                <h3 className="mt-8 mb-4">3.0 Control of AustBuild Civil Generated Design</h3>
                <p>For minor temporary works (e.g., traffic management plans, formwork, excavation support) designed internally or by our consultants:</p>
                <ul>
                    <li>Designs shall be developed by competent persons with relevant experience.</li>
                    <li>All designs must be independently checked and verified before use.</li>
                    <li>A risk assessment must be completed and documented as part of the design package.</li>
              </ul>

                <h3 className="mt-8 mb-4">4.0 Design Change Control</h3>
                <p>No changes shall be made to an approved design without following a formal change management process. This includes:</p>
                <ol>
                    <li>Documenting the proposed change on a Design Change Request form.</li>
                    <li>Assessing the impact of the change on safety, cost, schedule, and quality.</li>
                    <li>Obtaining approval for the change from the client and the Project Manager before implementation.</li>
                </ol>
            </div>
            )}
          </div>
        </section>
        {/* Document 2: Procurement Procedure */}
        <section id="procurement" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('procurement')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procurement & Supplier Management Procedure</h2>
                  <p className="text-gray-700">Ensuring procured goods and services meet QSE standards through robust supplier selection and management.</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['procurement'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['procurement'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-07</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>To establish a systematic process for the procurement of all goods, services, and subcontracts, ensuring they conform to project and QSE requirements. This procedure governs the evaluation, selection, and ongoing management of suppliers and subcontractors to minimise risk and ensure value for money.</p>
              
              <h3 className="mt-8 mb-4">2.0 Supplier & Subcontractor Pre-qualification</h3>
              <ol>
                <li>No supplier or subcontractor shall be engaged without first being pre-qualified and added to the <span style={{backgroundColor: 'yellow'}}>AustBuild Civil</span> Approved Supplier Register.</li>
                <li>The pre-qualification assessment shall be proportionate to the risk and value of the supply, and will as a minimum evaluate the supplier&apos;s:
                  <ul>
                    <li>WHS management system, performance history (LTIFR), and certifications (e.g., ISO 45001).</li>
                    <li>Environmental management system, incident history, and certifications (e.g., ISO 14001).</li>
                    <li>Quality management system and certifications (e.g., ISO 9001).</li>
                    <li>Financial capacity and relevant insurances.</li>
                    <li>Technical capability and past performance.</li>
              </ul>
                </li>
                <li>High-risk subcontractors (e.g., demolition, asbestos removal, cranes) are subject to a more intensive assessment.</li>
              </ol>

              <h3 className="mt-8 mb-4">3.0 Tendering & Contract Award</h3>
              <p>The procurement process for major subcontracts will align with the principles of fairness and transparency outlined in Section 12 of the Austroads Guide to Project Delivery.</p>
              <ol>
                <li>Purchase Orders and Subcontracts shall clearly define the scope of work, QSE requirements, specifications, and hold points for inspection.</li>
                <li>Tenders are to be assessed against both price and non-price criteria, with QSE performance being a significant factor.</li>
                <li>The Project Manager is responsible for ensuring contracts are awarded in line with delegations of authority.</li>
              </ol>

              <h3 className="mt-8 mb-4">4.0 Performance Monitoring</h3>
              <p>The performance of key subcontractors and suppliers shall be monitored throughout the project lifecycle.</p>
              <ul>
                <li>Regular performance reviews will be held to discuss progress, QSE compliance, and any issues.</li>
                <li>Site inspections and audits will be conducted to verify compliance with agreed QSE standards.</li>
                <li>A Supplier Performance Report will be completed upon conclusion of the contract, which will inform future tender considerations.</li>
              </ul>

            </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
