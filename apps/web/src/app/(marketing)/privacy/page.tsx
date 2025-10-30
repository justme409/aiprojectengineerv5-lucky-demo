export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="prose prose-lg prose-slate mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Overview</h2>
            <p className="text-slate-600 mb-4">
              We respect your privacy. This policy explains what we collect, how we use it, and the choices you have.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Information We Collect</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>Account details you provide (e.g., name, email).</li>
              <li>Project data you upload or create in the product.</li>
              <li>Basic usage information (e.g., device/browser, pages viewed).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">How We Use Information</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>To provide and improve the service.</li>
              <li>To communicate about product updates and support.</li>
              <li>To maintain security and prevent misuse.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Sharing</h2>
            <p className="text-slate-600 mb-4">
              We don’t sell personal data. We may share limited information with service providers strictly to operate the product (e.g., authentication, storage, payments) and when required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Retention</h2>
            <p className="text-slate-600 mb-4">
              We retain information for as long as needed to provide the service and to meet legal obligations. You may request deletion of your account data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Your Choices</h2>
            <ul className="text-slate-600 list-disc pl-6 space-y-2">
              <li>Access/update your account information.</li>
              <li>Request data export or deletion.</li>
              <li>Opt out of non-essential communications.</li>
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