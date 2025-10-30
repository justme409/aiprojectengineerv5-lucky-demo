import { UploadCloud, Brain, ListChecks, FileText, Users, GitBranch } from 'lucide-react';

const steps = [
  {
    title: "Upload Drawings & Specs",
    description: "Bring your contract documents, specifications, and drawings. We prepare them for AI processing and controlled distribution.",
    icon: UploadCloud,
    stepNumber: 1,
  },
  {
    title: "AI Generates ITPs & Plans",
    description: "Use assistants to produce Inspection & Test Plans and Management Plans aligned to ISO 9001. Edit before publishing.",
    icon: Brain,
    stepNumber: 2,
  },
  {
    title: "Operate: Lots, NCRs, Drawings",
    description: "Activate and track lots, manage NCRs end‑to‑end, and control drawing versions with attachments and audit history.",
    icon: GitBranch,
    stepNumber: 3,
  },
  {
    title: "Client Review & Approvals",
    description: "Share via the client portal to approve ITPs and plans, review NCRs, and confirm lot status with full visibility.",
    icon: Users,
    stepNumber: 4,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50">
      <div className="container px-4 mx-auto md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 sm:text-4xl">
            Run QA Day‑to‑Day, Use AI When It Saves Time
          </h2>
          <p className="text-xl text-slate-600">
            Core operations for lots, NCRs, and drawings — plus targeted AI to create ITPs and management plans fast.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.stepNumber} className="relative flex flex-col items-center p-6 text-center bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 flex items-center justify-center w-8 h-8 bg-emerald-600 text-white text-sm font-bold rounded-full">
                  {step.stepNumber}
                </div>

                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 text-emerald-600">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.description}</p>

                {/* Arrow connector (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-emerald-200">
                    <div className="absolute -right-1 -top-1 w-0 h-0 border-l-4 border-l-emerald-200 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
