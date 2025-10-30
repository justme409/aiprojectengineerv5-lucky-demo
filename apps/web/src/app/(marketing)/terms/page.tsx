export default function TermsPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-4 text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="prose prose-lg prose-slate mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Agreement</h2>
            <p className="text-slate-600 mb-4">
              By using ProjectPro, you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Accounts</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Service</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>The service may evolve over time; features may change or be discontinued.</li>
              <li>We aim for high availability but do not guarantee uninterrupted service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Acceptable Use</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>Do not misuse the service or attempt to access it using a method other than the interface provided.</li>
              <li>Do not infringe on others&apos; rights or upload unlawful content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Contact</h2>
            <p className="text-slate-600">
              Questions? Email <a className="text-emerald-700" href="mailto:tom.lynch@projectpro.pro">tom.lynch@projectpro.pro</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 