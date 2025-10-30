export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using ProjectPro (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              ProjectPro is a comprehensive construction project management platform that provides tools for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Project planning and scheduling</li>
              <li>Quality management and compliance</li>
              <li>Health, safety, and environment (HSE) management</li>
              <li>Document management and collaboration</li>
              <li>Reporting and analytics</li>
              <li>Resource and equipment tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To use ProjectPro, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Account Responsibilities</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful, threatening, or offensive content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Use the Service for any unlawful or fraudulent purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Ownership and Privacy</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Your Data</h3>
            <p className="text-gray-700 mb-4">
              You retain all rights to the data you upload to ProjectPro. We will not use your data for any purpose other than providing the Service, unless you explicitly consent otherwise.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Service Data</h3>
            <p className="text-gray-700 mb-4">
              ProjectPro retains ownership of aggregated, anonymized data derived from your use of the Service for analytical and improvement purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">ProjectPro IP</h3>
            <p className="text-gray-700 mb-4">
              The Service, including all software, designs, text, graphics, and underlying technology, is owned by ProjectPro and protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Your IP</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of all intellectual property rights in the data and content you upload to the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Subscription Fees</h3>
            <p className="text-gray-700 mb-4">
              Subscription fees are billed in advance on a monthly or annual basis, depending on your selected plan. All fees are non-refundable except as required by law.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Methods</h3>
            <p className="text-gray-700 mb-4">
              We accept major credit cards and other payment methods as indicated in the Service. You authorize us to charge your selected payment method for all applicable fees.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Late Payments</h3>
            <p className="text-gray-700 mb-4">
              If payment is not received by the due date, we may suspend or terminate your access to the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We strive to provide continuous availability of the Service but do not guarantee uninterrupted access. We may perform maintenance or experience outages that temporarily affect availability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, ProjectPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold ProjectPro harmless from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">By You</h3>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time through the Service settings or by contacting our support team.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">By Us</h3>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account if you violate these Terms or for any other reason we deem necessary to protect our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@projectpro.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Construction Way, Sydney, NSW 2000, Australia</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
