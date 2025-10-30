// import PricingTiers from '@/components/features/billing/PricingTiers';

export function PricingSectionComplete() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Pricing
          </h2>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            We are actively seeking pilot partners to test ProjectPro and help shape the product. If you&apos;re interested in joining the pilot program, please contact us at <a href="mailto:tom.lynch@projectpro.pro" className="underline text-emerald-700">tom.lynch@projectpro.pro</a>.
          </p>
        </header>
        {/* Pilot phase: pricing table hidden for now; will be re-enabled after pilot */}
        {false && (
          <div className="max-w-6xl mx-auto">
            {/* <PricingTiers /> */}
          </div>
        )}
      </div>
    </section>
  );
}
