import { ImageResponse } from 'next/og'
import { STATIC_COURSES } from '@/lib/static-data'

export const runtime = 'edge'
export const alt = 'Maritime Course — Maritime AI Guide'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const DEPT_LABELS: Record<string, string> = {
  deck: '⚓ Deck Department',
  engine: '⚙️ Engine Department',
  eto: '⚡ Electro-Technical',
  ratings: '🚢 Ratings',
  catering: '🍽️ Catering',
}

export default function OGImage({ params }: { params: { slug: string } }) {
  const course = STATIC_COURSES.find((c) => c.slug === params.slug)
  const courseName = course?.name ?? 'Maritime Course'
  const dept = course?.department ? (DEPT_LABELS[course.department] ?? course.department) : 'Maritime Career'
  const salary = course?.salary_display ?? 'Competitive salary'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0B2847 0%, #1a4a7a 60%, #0D2444 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px' }}>⚓</div>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#F5C842' }}>Maritime AI Guide</div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(245, 200, 66, 0.15)',
            border: '1px solid rgba(245, 200, 66, 0.3)',
            color: '#F5C842',
            fontSize: '20px',
            fontWeight: '600',
            padding: '8px 20px',
            borderRadius: '50px',
            marginBottom: '24px',
            width: 'fit-content',
          }}
        >
          {dept}
        </div>

        <div style={{ fontSize: '54px', fontWeight: '800', color: '#ffffff', lineHeight: '1.15', marginBottom: '24px', flex: 1 }}>
          {courseName}
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '18px', color: '#93c5fd', marginBottom: '4px' }}>Salary Range</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#F5C842' }}>{salary}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '18px', color: '#60a5fa' }}>maritimeaiguide.in</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
