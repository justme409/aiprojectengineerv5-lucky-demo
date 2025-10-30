'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-emerald-600">
      <div className="container px-4 mx-auto md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Generate ITPs and Plans in Minutes. Run Lots and NCRs with Confidence.
          </h2>
          <p className="mt-6 text-lg leading-8 text-emerald-100">
            Keep your QA moving with robust lot, NCR, and drawing management — and use AI assistants to create the paperwork fast when you need it.
          </p>
          {/* Pilot phase: hide signup and pricing CTAs (kept for later) */}
          {false && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login?view=signup">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-slate-100"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <Button
                variant="link"
                size="lg"
                onClick={scrollToPricing}
                className="text-white hover:text-emerald-50"
              >
                View Pricing <span aria-hidden="true">→</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
