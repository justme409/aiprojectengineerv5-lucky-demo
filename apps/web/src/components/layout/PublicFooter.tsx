"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Security", href: "/security" },
    { name: "About", href: "/about" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ],
  social: [
    { name: "Twitter", href: "https://twitter.com/projectpro" },
    { name: "LinkedIn", href: "https://linkedin.com/company/projectpro" },
    { name: "GitHub", href: "https://github.com/projectpro" },
  ],
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container max-w-screen-2xl py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold">ProjectPro</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Comprehensive project management and quality assurance platform
              for construction and engineering projects.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © 2024 ProjectPro. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {footerLinks.social.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {social.name}
              </Link>
            ))}
            <Link href="/auth/signup">
              <Button size="sm" variant="secondary">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
