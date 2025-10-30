import Link from 'next/link'
import { Crown, CheckCircle, ArrowRight } from 'lucide-react'

export default function SubscriptionRequiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Upgrade Required</h1>
          <p className="text-lg opacity-90">Unlock the full power of ProjectPro</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-gray-600">
              Start your free trial or upgrade to access all features and unlimited projects.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free Trial */}
            <div className="border-2 border-border rounded-lg p-6 bg-muted">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Free Trial</h3>
                <div className="text-3xl font-bold text-primary mt-2">$0</div>
                <div className="text-sm text-gray-600">14 days</div>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Up to 3 projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Basic quality management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Document management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>

              <Link
                href="/pricing"
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Premium */}
            <div className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Professional</h3>
                <div className="text-3xl font-bold text-indigo-600 mt-2">$49</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Advanced quality management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Full HSE compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>

              <Link
                href="/pricing"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Choose Professional
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
              Everything you need for construction project management
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Quality Management</h4>
                <p className="text-sm text-gray-600">Complete ITP, NCR, and compliance tracking</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">HSE Compliance</h4>
                <p className="text-sm text-gray-600">SWMS, permits, inductions, and incident management</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Field Operations</h4>
                <p className="text-sm text-gray-600">Daily diaries, timesheets, and equipment tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
