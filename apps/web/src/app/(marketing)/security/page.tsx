export default function SecurityPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Security & Data Protection
          </h1>
          <p className="mt-4 text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="prose prose-lg prose-slate mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Overview</h2>
            <p className="text-slate-600 mb-4">
              We take security seriously and are improving it continuously as the product evolves. The notes below describe our current approach at a high level.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Data Handling</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>Transport encryption (HTTPS/TLS) for data in transit.</li>
              <li>Scoped access to project data; only authorized users can view their projects.</li>
              <li>Backups and disaster‑recovery processes are part of our roadmap and will be documented as they are formalized.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Reporting</h2>
            <p className="text-slate-600">
              If you believe you’ve found a security issue, please email <a className="text-emerald-700" href="mailto:tom.lynch@projectpro.pro">tom.lynch@projectpro.pro</a> with details.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 