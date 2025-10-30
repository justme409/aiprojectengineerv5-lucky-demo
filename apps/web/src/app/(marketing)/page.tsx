import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import {
  Shield,
  FileCheck,
  HardHat,
  Map,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const features = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Comprehensive ITP templates, inspection management, and compliance tracking for construction projects."
  },
  {
    icon: HardHat,
    title: "HSE Management",
    description: "Safety work method statements, incident reporting, toolbox talks, and permit-to-work systems."
  },
  {
    icon: FileCheck,
    title: "Document Control",
    description: "Full document lifecycle management with version control, approvals, and distribution tracking."
  },
  {
    icon: Map,
    title: "GIS Integration",
    description: "Location-based tracking for inspections, tests, and field operations with interactive maps."
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Real-time dashboards and comprehensive reports for project performance and compliance."
  },
  {
    icon: Users,
    title: "Client Portal",
    description: "Secure client access to project documents, approvals, and progress tracking."
  }
]

// Testimonials can be fetched from a CMS or database in production
const testimonials = [
  {
    name: "Quality Manager",
    role: "Quality Manager",
    company: "Leading Construction Firm",
    content: "ProjectPro transformed our quality management process. The ITP templates and inspection tracking have saved us countless hours.",
    rating: 5
  },
  {
    name: "Site Manager",
    role: "Site Manager",
    company: "Major Construction Company",
    content: "The HSE module and daily diaries have made safety reporting so much easier. Our compliance rate has improved significantly.",
    rating: 5
  },
  {
    name: "Project Coordinator",
    role: "Project Coordinator",
    company: "Infrastructure Developer",
    content: "The client portal has improved communication with our clients. They can now track progress in real-time.",
    rating: 5
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2">
              🚀 Construction Quality Management Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Complete Project
              <span className="text-primary"> Quality Assurance</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline your construction projects with comprehensive quality management,
              HSE compliance, and client collaboration tools. From ITP templates to final handover.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Construction Quality
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive tools for managing quality, safety, and compliance across your projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Construction Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about ProjectPro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    &quot;{testimonial.content}&quot;
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Construction Quality Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of construction professionals who trust ProjectPro for their quality assurance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="px-8">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
