import { MarketingHeader } from '@/components/layout/marketing-header';
import { PublicFooter } from '@/components/layout/PublicFooter';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'ProjectPro - Civil Engineering QA Platform',
  description: 'AI-powered quality assurance for civil engineering projects',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            background-color: white !important;
          }
          html {
            background-color: white !important;
          }
        `
      }} />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <div className="flex min-h-screen flex-col bg-white" style={{ backgroundColor: 'white' }}>
          {/* Stripe.js for <stripe-pricing-table> web component */}
          <Script
            src="https://js.stripe.com/v3/pricing-table.js"
            strategy="lazyOnload"
            async
          />
          <MarketingHeader />
          <main className="flex-1">
            {children}
          </main>
          <PublicFooter />
        </div>
      </ThemeProvider>
    </>
  );
} 