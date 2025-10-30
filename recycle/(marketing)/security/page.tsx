export default function SecurityPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Security & Data Protection
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Overview</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We take security seriously and are improving it continuously as the product evolves. The notes below describe our current approach at a high level.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Data Handling</h2>
            <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
              <li>Transport encryption (HTTPS/TLS) for data in transit.</li>
              <li>Scoped access to project data; only authorized users can view their projects.</li>
              <li>Backups and disaster‑recovery processes are part of our roadmap and will be documented as they are formalized.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Reporting</h2>
            <p className="text-slate-600 dark:text-slate-300">
              If you believe you&apos;ve found a security issue, please email <a className="text-emerald-700 dark:text-emerald-300" href="mailto:tom.lynch@projectpro.pro">tom.lynch@projectpro.pro</a> with details.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
