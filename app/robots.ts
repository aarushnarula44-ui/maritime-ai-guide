import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maritimeaiguide.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/profile', '/api', '/settings', '/onboarding'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
