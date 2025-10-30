import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Import marketing page sections/components, assuming they are reusable
// These paths should match what was used/planned for src/app/(marketing)/page.tsx
import { MarketingHeader } from '@/components/layout/marketing-header';
import { HeroSection } from '@/components/features/marketing/sections/HeroSection';
import { FeaturesOverview } from '@/components/features/marketing/sections/FeaturesOverview';
import { HowItWorksSection } from '@/components/features/marketing/sections/HowItWorksSection';
import { ScreenshotsSection } from '@/components/features/marketing/sections/ScreenshotsSection';
import { PricingSectionComplete } from '@/components/features/marketing/sections/PricingSectionComplete';
import { CTASection } from '@/components/features/marketing/sections/CTASection';
import { PublicFooter } from '@/components/layout/PublicFooter';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';

// TODO: Update component import paths once components are refactored into src/

export default async function RootPage() {
  const session = await auth()

  if (session) {
    // If user is authenticated, redirect to their main dashboard/projects page
    redirect('/projects'); // Or '/dashboard' as per your (app) group's main page
  }

  // If user is not authenticated, render the public marketing/landing page content.
  // This is now a complete single-page marketing experience like Moontower.ai
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        {/* Stripe.js for <stripe-pricing-table> web component */}
        <Script
          src="https://js.stripe.com/v3/pricing-table.js"
          strategy="lazyOnload"
          async
        />

        <MarketingHeader />

        {/* Development Notice Banner */}
        <div className="bg-yellow-400 text-black text-center py-3 px-4 border-b-2 border-yellow-500">
          <div className="container mx-auto">
            <p className="text-sm md:text-base font-semibold">
              🚧 Marketing pages still in development - these are draft placeholders only - TBC 🚧
            </p>
          </div>
        </div>

        <main className="flex-1">
          <HeroSection />
          <FeaturesOverview />
          <HowItWorksSection />
          <ScreenshotsSection />
          <PricingSectionComplete />
          <CTASection />
        </main>

        <PublicFooter />
      </div>
    </ThemeProvider>
  );
}
