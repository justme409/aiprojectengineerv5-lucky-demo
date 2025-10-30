'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CorpContextPage() {
  const [expandedDocs, setExpandedDocs] = useState<{ [key: string]: boolean }>({
    'context-procedure': true,
    'issues-register': true,
    'stakeholders-register': true,
  });

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">4.0 Context of the Organization</h1>
        <p className="text-lg text-gray-600">Documentation defining our organizational context and the management of interested parties, a foundational requirement of ISO 9001, 14001, and 45001.</p>
      </header>

      <div className="space-y-12">
        {/* Document 1: Procedure */}
        <section id="context-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('context-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Determining Context and Interested Parties</h2>
                  <p className="text-gray-700">The process framework for identifying, monitoring, and reviewing internal/external issues and stakeholder expectations.</p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['context-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['context-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.1-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager]</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO]</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mb-4">1.0 Purpose</h3>
              <p className="mb-4">This procedure establishes the systematic and ongoing process for identifying, analyzing, monitoring, and reviewing the external and internal issues that constitute the context of [Company Name]. It also defines the method for identifying interested parties and their relevant needs and expectations. This process is fundamental to our strategic planning, risk management, and the overall effectiveness of our Integrated Management System (IMS), ensuring compliance with clauses 4.1 and 4.2 of ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018.</p>

              <h3 className="mb-4">2.0 Scope</h3>
              <p className="mb-4">This procedure applies to all corporate, functional, and project levels of [Company Name]. The outputs of this procedure are mandatory inputs for the management review process, the setting of QSE objectives, and the risk and opportunity management process.</p>

              <h3 className="mb-4">3.0 Responsibilities</h3>
              <ul>
                <li><strong>Chief Executive Officer (CEO):</strong> Holds ultimate responsibility for understanding and approving the organization&apos;s context and ensuring it aligns with the strategic direction. The CEO ratifies the key issues identified.</li>
                <li><strong>Executive Leadership Team (ELT):</strong> Actively participates in the context analysis, identifies strategic-level issues, and allocates resources to manage associated risks and opportunities.</li>
                <li><strong>QSE Manager:</strong> Is the custodian of this procedure, responsible for facilitating the context analysis process, maintaining the associated registers, and ensuring the outputs are communicated and integrated into the IMS.</li>
                <li><strong>Department and Project Managers:</strong> Are responsible for identifying project-specific issues and interested parties during the project start-up phase. These are to be recorded in the project&apos;s workspace and escalated to the QSE Manager if they have corporate-level significance.</li>
              </ul>

              <h3 className="mb-4">4.0 Procedure</h3>
              
              <h4 className="mb-4">4.1 Determining Organizational Context</h4>
              <p>The context of the organization is formally determined through a structured workshop held annually as part of the strategic planning cycle, led by the CEO and facilitated by the QSE Manager. The context is also reviewed during quarterly management review meetings.</p>
              
              <ol>
                <li><strong>Step 1: Data Gathering.</strong> The QSE Manager collates data from various sources, including PESTLE (Political, Economic, Social, Technological, Legal, Environmental) analysis, SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis, market reports, client feedback, audit results, and performance data.</li>
                <li><strong>Step 2: Analysis Workshop.</strong> The ELT analyzes the collated data to identify significant internal and external issues that could positively or negatively impact the IMS and business objectives.</li>
                <li><strong>Step 3: Issue Documentation.</strong> Each identified issue is documented in the &apos;Register of Internal & External Issues&apos; (QSE-4.1-REG-01), detailing its description, potential impact, and assigning an owner.</li>
                <li><strong>Step 4: Integration with Risk Management.</strong> The identified issues are used as a primary input into the corporate risk and opportunity assessment process (ref: QSE-6.1-PROC-01).</li>
              </ol>

              <h4 className="mb-4">4.2 Identifying Interested Parties</h4>
              <p>The identification of interested parties and their requirements is conducted in parallel with the context analysis.</p>
              <ol>
                <li><strong>Step 1: Stakeholder Mapping.</strong> During the annual workshop, the ELT conducts a stakeholder mapping exercise, identifying all relevant parties in predefined categories (e.g., Customers, Employees, Regulators, Suppliers, Community).</li>
                <li><strong>Step 2: Determining Needs and Expectations.</strong> For each identified party, their relevant needs, expectations, and legal or other requirements are determined. This is gathered through formal (e.g., contracts, legislation) and informal (e.g., meetings, surveys) channels.</li>
                <li><strong>Step 3: Requirement Documentation.</strong> All interested parties and their associated requirements are documented in the &apos;Register of Interested Parties & Their Requirements&apos; (QSE-4.2-REG-01). The register includes the method and frequency of engagement for each party.</li>
                <li><strong>Step 4: Compliance Obligation Link.</strong> Requirements that constitute a legal or compliance obligation are transferred to the &apos;Compliance Obligations Register&apos; (ref: QSE-6.1-REG-01).</li>
              </ol>

              <h3 className="mb-4">5.0 Monitoring, Review, and Update</h3>
              <p>The context of the organization is dynamic and requires continuous monitoring. The registers associated with this procedure are considered live documents.</p>
              <ul>
                <li><strong>Formal Review:</strong> The CEO and ELT formally review the complete context analysis and associated registers during the annual strategic planning meeting and quarterly management reviews.</li>
                <li><strong>Ongoing Monitoring:</strong> Department and Project Managers are responsible for monitoring their areas for any changes that could affect the context (e.g., new legislation, new client, major incident) and immediately reporting them to the QSE Manager.</li>
                <li><strong>Triggered Updates:</strong> The registers must be updated immediately upon the identification of a new significant issue or interested party.</li>
              </ul>

              <h3 className="mb-4">6.0 Records</h3>
              <p className="mb-4">The following live records are maintained within the <code>/qse/corp-context</code> module:</p>
              <ul className="mb-4">
                <li><strong>QSE-4.1-REG-01:</strong> Register of Internal and External Issues</li>
                <li><strong>QSE-4.2-REG-01:</strong> Register of Interested Parties and Their Requirements</li>
                <li>Minutes of Management Meetings where context and interested parties are discussed.</li>
                <li>Records from SWOT/PESTLE analysis workshops.</li>
              </ul>
            </div>
            )}
          </div>
        </section>

        {/* Document 2: Issues Register */}
        <section id="issues-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('issues-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register of Internal & External Issues</h2>
                  <p className="text-gray-700">A live register documenting strategic issues relevant to QSE performance.</p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['issues-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['issues-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.1-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> D</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [QSE Manager]</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Quarterly</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 30/09/2024</div>
              </div>

              <h3 className="mt-8 mb-4">Internal Issues Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Issue ID</th>
                      <th className="border p-2 text-left">Category</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Impact on QSE</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Link to Risk Register (ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">External Issues Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Issue ID</th>
                      <th className="border p-2 text-left">Category</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Impact on QSE</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Monitor</th>
                      <th className="border p-2 text-left">Link to Risk Register (ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Review and Update Process</h3>
              <ul>
                <li><strong>Quarterly Reviews:</strong> Formal assessment of all issues by the ELT during the quarterly management review, with updates to status and actions recorded.</li>
                <li><strong>Event-driven Updates:</strong> The register is updated immediately by the assigned owner when a significant new issue is identified or the nature of an existing issue changes.</li>
                <li><strong>Impact Assessment:</strong> A full review of all issues and their potential impact is conducted as part of the annual strategic planning and risk management cycle.</li>
              </ul>
            </div>
            )}
          </div>
        </section>

        {/* Document 3: Stakeholders Register */}
        <section id="stakeholders-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-teal-100 text-gray-900 p-6 cursor-pointer hover:bg-teal-200 transition-colors"
              onClick={() => toggleDoc('stakeholders-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register of Interested Parties & Requirements</h2>
                  <p className="text-gray-700">A register of all stakeholders, their needs, and expectations.</p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['stakeholders-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['stakeholders-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.2-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [QSE Manager]</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Semi-Annual</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 31/12/2024</div>
              </div>

              <h3 className="mt-8 mb-4">Interested Parties and Their Requirements</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Stakeholder Group</th>
                      <th className="border p-2 text-left">Specific Party</th>
                      <th className="border p-2 text-left">Key Requirements & Expectations (Needs)</th>
                      <th className="border p-2 text-left">QSE Relevance</th>
                      <th className="border p-2 text-left">Engagement Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Link to Communication Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                      <td className="border p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Stakeholder Engagement Strategy</h3>
              <ul>
                <li><strong>Proactive Communication:</strong> Engagement is planned and proactive, aiming to build strong, trust-based relationships and prevent issues before they arise.</li>
                <li><strong>Responsiveness:</strong> All stakeholder inquiries and complaints are logged, acknowledged, and responded to within defined timeframes.</li>
                <li><strong>Transparency:</strong> We are committed to open communication regarding our QSE performance, challenges, and improvement initiatives, where appropriate.</li>
                <li><strong>Feedback Integration:</strong> Feedback from interested parties is a key input into our risk management and continual improvement processes. It is formally reviewed during management reviews.</li>
              </ul>

              <h3 className="mt-8 mb-4">Review and Updates</h3>
              <p>This register is formally reviewed at least semi-annually during management review meetings. It is a live document and must be updated by the QSE Manager or relevant Project Manager whenever:</p>
              <ul>
                <li>A new project is commenced, requiring identification of project-specific stakeholders.</li>
                <li>There is a significant change in organizational structure or scope.</li>
                <li>New legal or other requirements are identified.</li>
                <li>Feedback indicates that the needs of an interested party have changed.</li>
              </ul>
            </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}