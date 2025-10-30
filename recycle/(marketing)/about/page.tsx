import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            About ProjectPro
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
            Purpose‑built QA for civil projects. Run lots, NCRs and drawings day‑to‑day — generate ITPs and plans with AI when you need them.
          </p>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Streamline civil project QA by combining robust operational tools with focused AI assistance. Engineers should spend time building — not formatting documents.
            </p>
      </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">What We Do</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Operate lots, NCRs, and drawings with speed and control. When you need to create documentation, use AI assistants to generate ITPs and management plans aligned to ISO 9001 — then review and publish.
            </p>
      </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Our Technology</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Modern cloud stack with advanced language models tailored to construction. Native support for Australian standards and a secure, auditable workflow across your QA processes.
            </p>
          </section>


          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">About Me</h2>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Thomas Lynch (B.Eng (Civil)) — Founder</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  I&apos;m a civil and construction engineer focused on practical, reliable QA systems for delivery teams. I&apos;ve worked across major transport infrastructure and utility programs with a strong emphasis on lot closure, NCR workflows, and drawing control. I started AI Project Engineer to bring modern, AI‑assisted tools to the everyday QA work that engineers actually do on site.
                </p>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">Future Outlook</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  I became fascinated with AI when ChatGPT‑3 was released and have been working obsessively ever since to unlock the economic, productivity, and quality‑of‑life benefits it can bring. I see a future where AI systems are integral to maintaining a competitive edge in the civil construction industry and to delivering better project outcomes — safer delivery, faster and more relevant communication, more efficient construction solutions, larger scale projects, and much more profitable projects.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  LinkedIn: <a className="text-emerald-700 dark:text-emerald-300" href="https://www.linkedin.com/in/thomas-lynch-649497123" target="_blank" rel="noopener noreferrer">thomas-lynch-649497123</a>
                </p>
              </div>
              <Image
                src="/images/1546603551715.jpg"
                alt="Thomas Lynch"
                width={160}
                height={160}
                className="rounded-full border border-slate-200 dark:border-slate-700 shadow object-cover md:ml-2"
                priority={false}
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Contact Us</h2>
            <div className="text-slate-600 dark:text-slate-300 space-y-1">
              <p>Email: <a className="text-emerald-700 dark:text-emerald-300" href="mailto:tom.lynch@projectpro.pro">tom.lynch@projectpro.pro</a></p>
              <p>Phone: <a className="text-emerald-700 dark:text-emerald-300" href="tel:+61468920484">0468 920 484</a></p>
              <p>Location: Toowoomba, QLD</p>
        </div>
      </section>
          </div>
        </div>
    </div>
  );
}
