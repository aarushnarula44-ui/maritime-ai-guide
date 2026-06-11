'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  collegeId: string
  onSuccess?: () => void
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-secondary w-32">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}>
            <Star
              className="w-5 h-5 transition"
              fill={star <= value ? '#FFB347' : 'none'}
              stroke={star <= value ? '#FFB347' : '#CBD5E1'}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReviewForm({ collegeId, onSuccess }: ReviewFormProps) {
  const [overall, setOverall] = useState(0)
  const [teaching, setTeaching] = useState(0)
  const [placement, setPlacement] = useState(0)
  const [facilities, setFacilities] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [courseAttended, setCourseAttended] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (overall === 0) { setError('Please give an overall rating.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/colleges/${collegeId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overall, teaching, placement, facilities, reviewText, courseAttended, graduationYear: Number(graduationYear) || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to submit review.')
      } else {
        setSuccess(true)
        onSuccess?.()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center">
        <p className="text-success font-semibold">Thank you! Your review has been submitted.</p>
        <p className="text-text-secondary text-sm mt-1">It will appear after moderation.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 space-y-5">
      <h3 className="font-display font-semibold text-primary text-lg">Write a Review</h3>

      <div className="space-y-3">
        <StarRating value={overall} onChange={setOverall} label="Overall *" />
        <StarRating value={teaching} onChange={setTeaching} label="Teaching Quality" />
        <StarRating value={placement} onChange={setPlacement} label="Placements" />
        <StarRating value={facilities} onChange={setFacilities} label="Facilities" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Your Review</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          placeholder="Share your experience at this college..."
          className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Course Attended</label>
          <input
            type="text"
            value={courseAttended}
            onChange={(e) => setCourseAttended(e.target.value)}
            placeholder="e.g. B.Sc. Nautical Science"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Graduation Year</label>
          <input
            type="number"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder="e.g. 2022"
            min={1990}
            max={new Date().getFullYear()}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-primary font-semibold py-3 rounded-xl hover:bg-accent-dark transition disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
