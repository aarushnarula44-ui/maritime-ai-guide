import type { Metadata } from 'next'
import './globals.css'
import NavAIWidget from '@/components/ui/NavAIWidget'
import EligibilityCacheInit from '@/components/ui/EligibilityCacheInit'

export const metadata: Metadata = {
  title: 'Maritime AI Guide — India\'s #1 Merchant Navy Career Platform',
  description: 'AI-powered maritime career guidance. Check eligibility, explore 8 DGS-approved courses, find verified colleges, and plan your merchant navy career.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-surface text-text-primary">
        {children}
        <NavAIWidget />
        <EligibilityCacheInit />
      </body>
    </html>
  )
}
