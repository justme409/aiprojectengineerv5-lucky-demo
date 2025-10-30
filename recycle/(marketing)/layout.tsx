import { PublicHeaderV2 } from '@/components/layout/PublicHeaderV2';
import { PublicFooter } from '@/components/layout/PublicFooter';
import Script from 'next/script';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Stripe.js for <stripe-pricing-table> web component */}
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="lazyOnload" // or "beforeInteractive" if needed sooner
        async
      />
      <PublicHeaderV2 />
      <main className="flex-1"> {/* Use flex-1 to make main content take available space */}
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
