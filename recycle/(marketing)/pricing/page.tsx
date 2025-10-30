import PricingTiers from '@/components/features/billing/PricingTiers';

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          Simple Pricing for Any Team Size
          </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Choose the plan that fits your civil engineering team&apos;s needs. All plans include core quality management features.
        </p>
      </header>
      <PricingTiers />
      {/* You can add an FAQ section or other content here if needed */}
      {/* For example:
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto">
          <p>FAQ content here...</p>
        </div>
      </section>
      */}
    </div>
  );
}
