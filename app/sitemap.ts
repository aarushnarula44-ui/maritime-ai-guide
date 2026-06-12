import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maritimeaiguide.in'

const COURSE_SLUGS = [
  'bsc-nautical-science',
  'dns-diploma-nautical-science',
  'be-btech-marine-engineering',
  'graduate-marine-engineering',
  'gp-rating',
  'electro-technical-officer',
  'pre-sea-training-rating',
  'catering-hospitality',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/colleges`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/eligibility`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/salary`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/cet`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/sponsorships`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/medical`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/fraud-protection`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/parents`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/roadmap`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const coursePages: MetadataRoute.Sitemap = COURSE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/courses/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let collegePages: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient()
    const { data: colleges } = await supabase
      .from('colleges')
      .select('slug, updated_at')
      .eq('is_active', true) as { data: { slug: string; updated_at: string }[] | null }

    if (colleges) {
      collegePages = colleges.flatMap((c) => [
        {
          url: `${BASE_URL}/colleges/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/verify/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        },
      ])
    }
  } catch {}

  return [...staticPages, ...coursePages, ...collegePages]
}
