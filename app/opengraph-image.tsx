import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Maritime AI Guide — India\'s Maritime Career Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0B2847 0%, #1a4a7a 50%, #0D2444 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>⚓</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#F5C842', letterSpacing: '-1px' }}>
            Maritime AI Guide
          </div>
        </div>
        <div style={{ fontSize: '52px', fontWeight: '800', color: '#ffffff', textAlign: 'center', lineHeight: '1.15', marginBottom: '24px' }}>
          India&apos;s Maritime Career Platform
        </div>
        <div style={{ fontSize: '24px', color: '#93c5fd', textAlign: 'center', marginBottom: '40px' }}>
          AI-powered guidance for Indian merchant navy aspirants
        </div>
        <div
          style={{
            background: '#F5C842',
            color: '#0B2847',
            fontSize: '22px',
            fontWeight: '700',
            padding: '16px 40px',
            borderRadius: '50px',
          }}
        >
          Check your eligibility free →
        </div>
        <div style={{ marginTop: '32px', fontSize: '18px', color: '#60a5fa' }}>
          maritimeaiguide.in
        </div>
      </div>
    ),
    { ...size }
  )
}
