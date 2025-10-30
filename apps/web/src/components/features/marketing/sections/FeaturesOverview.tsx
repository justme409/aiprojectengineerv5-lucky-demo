import Link from 'next/link';

const features = [
  {
    name: "Automatic ITP Generation (AI)",
    description: "Create Inspection & Test Plans from your contract, specs, and drawings. State authority alignment (MRTS, VicRoads, TfNSW, TMR QLD) and location-aware hold/witness points.",
  },
  {
    name: "Automatic Project Management Plans (AI)",
    description: "Generate PQP/EMP/OHSMP/TMP in minutes with structured, editable outputs ready for client submission and revision control.",
  },
  {
    name: "Lots Management",
    description: "Plan, activate, and track lots with attachments, status workflow, and linkage to ITPs. Hierarchical views and high‑density tables for large projects.",
  },
  {
    name: "NCR Register",
    description: "End‑to‑end NCR capture and resolution with approvals, comments, attachments, and a full audit trail for compliance.",
  },
  {
    name: "Drawings & Document Control",
    description: "Centralized drawing and document management with versioning, comparison, and client‑visible publishing controls.",
  },
  {
    name: "Client Portal & Approvals",
    description: "A dedicated portal for clients to review, approve, or request changes on ITPs, plans, lots, and NCRs with clear status and history.",
  },
];

export function FeaturesOverview() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 sm:text-4xl">
            Civil Project QA: Built‑in Lots, NCRs, and Drawings — with AI Assistants
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Operate day‑to‑day with robust lot, NCR, and drawing management. Use AI assistants to generate ITPs and Management Plans when you need them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <div className="h-6 w-6 bg-emerald-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">{feature.name}</h3>
              <p className="text-slate-600 flex-grow">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
