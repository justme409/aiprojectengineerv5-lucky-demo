export default function TermsPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Agreement</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              By using AI Project Engineer, you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Accounts</h2>
            <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Service</h2>
            <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
              <li>The service may evolve over time; features may change or be discontinued.</li>
              <li>We aim for high availability but do not guarantee uninterrupted service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Acceptable Use</h2>
            <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
              <li>Do not misuse the service or attempt to access it using a method other than the interface provided.</li>
              <li>Do not infringe on others&apos; rights or upload unlawful content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Contact</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Questions? Email <a className="text-emerald-700 dark:text-emerald-300" href="mailto:tom.lynch@projectpro.pro">tom.lynch@projectpro.pro</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
