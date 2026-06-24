import type { Metadata } from 'next'
import './globals.css'
import NavAIWidget from '@/components/ui/NavAIWidget'
import EligibilityCacheInit from '@/components/ui/EligibilityCacheInit'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://maritime-ai-guide.vercel.app').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Maritime AI Guide — India\'s #1 Merchant Navy Career Platform',
  description: 'AI-powered maritime career guidance. Check eligibility, explore 8 DGS-approved courses, find verified colleges, and plan your merchant navy career.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Maritime AI Guide — India\'s #1 Merchant Navy Career Platform',
    description: 'AI-powered maritime career guidance. Check eligibility, explore 8 DGS-approved courses, find verified colleges, and plan your merchant navy career.',
    url: BASE_URL,
    siteName: 'Maritime AI Guide',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maritime AI Guide — India\'s #1 Merchant Navy Career Platform',
    description: 'AI-powered maritime career guidance for aspiring Indian merchant navy officers.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maritime AI Guide',
  url: BASE_URL,
  description: 'AI-powered maritime career guidance platform for aspiring Indian merchant navy officers.',
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Maritime AI Guide',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/colleges?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-surface text-text-primary">
        {children}
        <NavAIWidget />
        <EligibilityCacheInit />
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', padding: '8px 0 12px', margin: 0 }}>
          Made by Aarush Narula
        </p>
      </body>
    </html>
  )
}
