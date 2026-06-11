import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { STATIC_COLLEGES } from '@/lib/static-data'
import { Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink, Anchor } from 'lucide-react'

export async function generateStaticParams() {
  return STATIC_COLLEGES.map((c) => ({ college: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { college: string }
}): Promise<Metadata> {
  const college = STATIC_COLLEGES.find((c) => c.slug === params.college)
  if (!college) return { title: 'Verify College' }

  const statusText =
    college.dgs_approval_status === 'approved' ? 'DGS Approved' : 'NOT Verified by DGS'

  return {
    title: `${college.name} — ${statusText} | Maritime AI Guide`,
    openGraph: {
      title: `${college.name}: ${statusText}`,
      description: college.dgs_approval_status === 'approved'
        ? `${college.name} holds a valid DGS approval (${college.dgs_approval_number}).`
        : `${college.name} is NOT on the official DGS approved list. Verify before paying.`,
    },
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle className="w-16 h-16 text-success" />
  if (status === 'pending' || status === 'suspended') return <AlertTriangle className="w-16 h-16 text-warning" />
  return <XCircle className="w-16 h-16 text-danger" />
}

export default function VerifyCollegePage({ params }: { params: { college: string } }) {
  const college = STATIC_COLLEGES.find((c) => c.slug === params.college)
  if (!college) notFound()

  const isApproved = college.dgs_approval_status === 'approved'
  const statusColors = {
    approved: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', label: 'DGS APPROVED' },
    pending: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', label: 'PENDING VERIFICATION' },
    suspended: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', label: 'SUSPENDED' },
    not_listed: { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger', label: 'NOT LISTED BY DGS' },
    flagged: { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger', label: 'FLAGGED — DO NOT PAY FEES' },
  }

  const colors = statusColors[college.dgs_approval_status as keyof typeof statusColors] ?? statusColors.pending

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border py-4 px-4 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-accent" />
          <span className="font-display font-semibold text-primary">Maritime AI Guide</span>
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-floating max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <StatusIcon status={college.dgs_approval_status} />
          </div>

          <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.border} border rounded-full px-4 py-1.5 mb-4`}>
            <Shield className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-sm font-bold ${colors.text}`}>{colors.label}</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-primary mb-2">{college.name}</h1>

          {(college.city || college.state) && (
            <p className="text-text-secondary text-sm mb-6">
              {[college.city, college.state].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="bg-surface rounded-xl p-4 text-left space-y-3 mb-6">
            {college.dgs_approval_number && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-text-muted">DGS Approval No.</span>
                <span className="text-sm font-semibold text-primary">{college.dgs_approval_number}</span>
              </div>
            )}
            {college.last_dgs_verified && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-text-muted">Last Verified</span>
                <span className="text-sm font-semibold text-primary">{college.last_dgs_verified}</span>
              </div>
            )}
            {college.imu_affiliated && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-text-muted">IMU Affiliated</span>
                <span className="text-sm font-semibold text-success">Yes</span>
              </div>
            )}
          </div>

          {!isApproved && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-danger text-sm font-semibold mb-1">Important Warning</p>
              <p className="text-danger/80 text-xs">
                This institution does not appear on the official DGS approved list. Do not pay any fees or sign any admission forms without verifying directly with the Directorate General of Shipping.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href={`/colleges/${college.slug}`}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-light transition text-center text-sm"
            >
              View Full College Profile
            </Link>
            <a
              href="https://dgshipping.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-border text-text-secondary font-medium py-3 rounded-xl hover:bg-surface transition text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Verify on DGS Website
            </a>
          </div>

          <p className="text-xs text-text-muted mt-4">
            Data sourced from DGS Training Circular No. 12 of 2020 and official DGS records.
          </p>
        </div>
      </div>
    </main>
  )
}
