import Link from 'next/link'
import { Anchor } from 'lucide-react'

const COURSES = [
  { href: '/courses/bsc-nautical-science', label: 'B.Sc. Nautical Science' },
  { href: '/courses/dns-diploma-nautical-science', label: 'DNS' },
  { href: '/courses/be-btech-marine-engineering', label: 'BE Marine Engineering' },
  { href: '/courses/graduate-marine-engineering', label: 'GME' },
  { href: '/courses/gp-rating', label: 'GP Rating' },
  { href: '/courses/electro-technical-officer', label: 'ETO' },
]

const RESOURCES = [
  { href: '/cet', label: 'CET Guide' },
  { href: '/colleges', label: 'College Finder' },
  { href: '/salary', label: 'Salary Data' },
  { href: '/sponsorships', label: 'Sponsorships' },
  { href: '/roadmap', label: 'Career Roadmap' },
]

const COMPANY = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Anchor className="w-5 h-5 text-accent" />
              <span className="font-display font-semibold">Maritime AI Guide</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              India&apos;s first AI-powered maritime career platform helping students find their perfect merchant navy path.
            </p>
            <span className="inline-flex items-center gap-1 text-xs bg-primary-light text-accent border border-accent/30 rounded-full px-3 py-1">
              🛡️ Based on DGS Guidelines
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Courses</h4>
            <ul className="space-y-2">
              {COURSES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {COMPANY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-light pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Maritime AI Guide. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Data sourced from DGS Training Circular No. 12 of 2020
          </p>
        </div>
      </div>
    </footer>
  )
}
