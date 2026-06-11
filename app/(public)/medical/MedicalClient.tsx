'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Eye, Shield, ExternalLink } from 'lucide-react'

const QUESTIONS = [
  { id: 'color', label: 'Do you have any color vision deficiency (color blindness)?' },
  { id: 'diabetes', label: 'Do you have insulin-dependent diabetes?' },
  { id: 'epilepsy', label: 'Do you have a history of epilepsy or seizures?' },
  { id: 'glasses', label: 'Do you wear glasses or contact lenses?' },
  { id: 'hearing', label: 'Do you have any significant hearing impairment?' },
]

const CONDITIONS = [
  { condition: 'Insulin-dependent diabetes', note: 'Generally disqualifying' },
  { condition: 'Epilepsy or seizure history', note: 'Generally disqualifying' },
  { condition: 'Significant cardiovascular disease', note: 'May affect eligibility' },
  { condition: 'Severe mental health conditions', note: 'May affect eligibility' },
  { condition: 'Color blindness', note: 'Disqualifying for Deck Department only' },
  { condition: 'Significant hearing impairment', note: 'May affect eligibility' },
  { condition: 'Drug or alcohol dependency', note: 'Disqualifying' },
]

export function MedicalClient() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    color: null, diabetes: null, epilepsy: null, glasses: null, hearing: null,
  })
  const [submitted, setSubmitted] = useState(false)

  function toggle(id: string, val: boolean) {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  const allAnswered = Object.values(answers).every((v) => v !== null)

  function getResult() {
    const results: { type: 'warning' | 'info' | 'ok'; message: string }[] = []
    if (answers.color) {
      results.push({
        type: 'warning',
        message: '⚠️ Color vision deficiency may disqualify you from Deck Department courses (B.Sc. Nautical Science, DNS). Consider Engine Department (GME, B.E. Marine Engineering) or ETO courses instead.',
      })
    }
    if (answers.diabetes || answers.epilepsy) {
      results.push({
        type: 'warning',
        message: '⚠️ This condition may affect your eligibility for sea service. Consult a DGS-approved doctor before applying to any maritime course.',
      })
    }
    if (answers.glasses && !answers.color && !answers.diabetes && !answers.epilepsy) {
      results.push({
        type: 'info',
        message: '✓ Corrected vision (glasses or contact lenses) is generally acceptable if it meets DGS standards. Get tested by a DGS-approved medical examiner to confirm.',
      })
    }
    if (answers.hearing) {
      results.push({
        type: 'warning',
        message: '⚠️ Hearing impairment may affect eligibility. Audiometric testing is required. Consult a DGS-approved doctor.',
      })
    }
    if (results.length === 0) {
      results.push({
        type: 'ok',
        message: '✓ No obvious medical concerns identified based on your answers. Get a formal medical examination from a DGS-approved doctor to confirm eligibility.',
      })
    }
    return results
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1 text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
            <Shield className="w-3 h-3" /> Based on Merchant Shipping (Medical Examination) Rules, 2000
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Medical Fitness Requirements for Merchant Navy
          </h1>
          <p className="text-blue-200 text-lg">
            Know the health standards before investing in maritime education
          </p>
        </div>
      </section>

      {/* TOP DISCLAIMER */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong>Important Disclaimer:</strong> This page provides general information only. Final medical eligibility is determined by a DGS-approved medical examiner. Always consult a qualified doctor before making career decisions based on medical criteria. Requirements may have been updated — verify with the latest MS Medical Examination Rules.
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* GENERAL REQUIREMENTS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-4">General Requirements</h2>
          <p className="text-text-secondary text-sm mb-4">All seafarers must meet the following before joining any vessel:</p>
          <ul className="space-y-2">
            {[
              'Pass a medical examination by a DGS-approved doctor',
              'Meet eyesight standards for their department',
              'Meet minimum hearing standards (audiometric testing)',
              'Be free from conditions that impair the safe performance of duties',
              'Receive Medical Fitness Certificate — Form MEF',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-text-primary">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* EYESIGHT STANDARDS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5" /> Vision Requirements
          </h2>
          <p className="text-xs text-text-muted mb-5 italic">Disclaimer: Verify current standards with a DGS-approved examiner as requirements may be updated.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-primary mb-3 text-sm">Deck Officers (Navigating)</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><span className="font-medium text-primary">Distant vision:</span> 6/6 each eye (corrected or uncorrected)</li>
                <li><span className="font-medium text-primary">Near vision:</span> N5 each eye</li>
                <li><span className="font-medium text-primary">Color vision:</span> <span className="text-red-600 font-semibold">Must pass — color blindness is DISQUALIFYING</span></li>
                <li><span className="font-medium text-primary">Field of vision:</span> Normal</li>
                <li><span className="font-medium text-primary">Monocular vision:</span> Not permitted</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h3 className="font-semibold text-primary mb-3 text-sm">Engine Officers</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>Generally less stringent than deck officers</li>
                <li><span className="font-medium text-primary">Color vision:</span> Defective color vision may be acceptable (verify with MS Medical Rules)</li>
                <li>Corrected vision typically acceptable</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-primary mb-3 text-sm">Ratings (GP Rating, ETO, Catering)</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>Generally less stringent than officer standards</li>
                <li>Verify specific requirements with a DGS-approved medical examiner</li>
              </ul>
            </div>
          </div>
        </div>

        {/* COLOR BLINDNESS CALLOUT */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
          <div className="flex gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <h2 className="font-display text-xl font-bold text-amber-900">
              Color Vision — Critical Information for Deck Department Aspirants
            </h2>
          </div>
          <div className="text-amber-900 space-y-3 text-sm">
            <p>
              Color blindness (color vision deficiency) is <strong>DISQUALIFYING for the Deck Department</strong> (Navigating Officers). This includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>B.Sc. Nautical Science</li>
              <li>DNS (Diploma in Nautical Science)</li>
              <li>Any Deck Officer role</li>
            </ul>
            <p className="font-semibold">
              If you have any color vision deficiency, you CANNOT qualify as a Deck Officer. However, you may still be eligible for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Engine Department (Marine Engineering, GME)</li>
              <li>Electro-Technical Officers (ETO)</li>
              <li>GP Rating (subject to examination)</li>
            </ul>
            <div className="bg-amber-100 rounded-lg px-4 py-3 border border-amber-200 mt-2">
              <strong>Recommendation:</strong> Get a color vision test (Ishihara test) before investing in any pre-sea training for the Deck Department.
            </div>
          </div>
        </div>

        {/* HEARING */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-3">Hearing Standards</h2>
          <p className="text-xs text-text-muted mb-3 italic">Disclaimer: Verify current standards with a DGS-approved examiner.</p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Must meet minimum hearing standards set by DGS</li>
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Audiometric testing required as part of medical examination</li>
            <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> Cannot have significant hearing impairment that affects safe performance of duties</li>
          </ul>
        </div>

        {/* DISQUALIFYING CONDITIONS */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-2">Conditions That May Affect Eligibility</h2>
          <p className="text-sm text-text-secondary mb-4 italic">This is general guidance only — consult a doctor for your specific situation.</p>
          <div className="space-y-3">
            {CONDITIONS.map((c) => (
              <div key={c.condition} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
                <p className="text-sm font-medium text-primary">{c.condition}</p>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs bg-red-50 text-red-700 border border-red-100 rounded-full px-2 py-0.5">{c.note}</span>
                  <p className="text-xs text-text-muted mt-1">Verify with DGS-approved examiner</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MEDICAL PRE-SCREENER */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-1">Quick Medical Pre-Check</h2>
          <p className="text-sm text-text-secondary mb-1">Answer these questions to understand if you may face medical challenges.</p>
          <p className="text-xs text-red-600 font-semibold mb-5">This is NOT a medical diagnosis.</p>

          <div className="space-y-4 mb-6">
            {QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-medium text-primary mb-2">{q.label}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggle(q.id, true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
                      answers[q.id] === true
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-text-primary hover:bg-surface'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => toggle(q.id, false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
                      answers[q.id] === false
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-text-primary hover:bg-surface'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="w-full bg-accent text-primary font-semibold py-3 rounded-lg hover:bg-accent-dark transition disabled:opacity-40"
            >
              See My Results
            </button>
          ) : (
            <div className="space-y-3">
              {getResult().map((r, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg text-sm ${
                    r.type === 'warning'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : r.type === 'ok'
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}
                >
                  {r.message}
                </div>
              ))}
              <button
                onClick={() => { setSubmitted(false); setAnswers({ color: null, diabetes: null, epilepsy: null, glasses: null, hearing: null }) }}
                className="text-sm text-accent hover:underline"
              >
                Reset answers
              </button>
            </div>
          )}

          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-xs text-red-800">
            <strong>Disclaimer:</strong> This pre-screener is for general awareness only and is NOT a medical assessment. Only a qualified DGS-approved medical examiner can determine your actual fitness for sea service. Maritime AI Guide accepts no responsibility for decisions made based on this tool.
          </div>
        </div>

        {/* WHERE TO GET EXAM */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-xl font-bold text-primary mb-4">How to Get Your Medical Examination</h2>
          <div className="space-y-4">
            {[
              { step: 1, text: 'Find a DGS-approved doctor (list available on dgshipping.gov.in)' },
              { step: 2, text: 'Book an appointment with the approved examiner' },
              { step: 3, text: 'Bring: passport photos, valid ID, spectacles/contact lenses if worn' },
              { step: 4, text: 'Tests include: vision (Snellen chart, Ishihara for color), hearing (audiometry), general fitness assessment' },
              { step: 5, text: 'Receive your Medical Fitness Certificate (Form MEF) if you pass' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <p className="text-sm text-text-primary pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-surface rounded-lg px-4 py-3 text-sm text-text-secondary border border-border">
            <strong>Cost note:</strong> Examination fees vary by doctor. Typically ₹500 – ₹2,000.
          </div>
          <a
            href="https://dgshipping.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-accent font-semibold hover:underline"
          >
            Find DGS-approved doctors at dgshipping.gov.in <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* FINAL DISCLAIMER */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-800">
          <strong>Final Reminder:</strong> All information on this page is based on general knowledge of Merchant Shipping (Medical Examination) Rules, 2000. Medical eligibility standards can change. Always consult a qualified DGS-approved medical examiner and verify current requirements at <a href="https://dgshipping.gov.in" target="_blank" rel="noopener noreferrer" className="underline">dgshipping.gov.in</a> before making any educational or financial decisions related to a maritime career.
        </div>

        <div className="text-center">
          <Link href="/eligibility" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-light transition">
            Check Course Eligibility →
          </Link>
        </div>
      </div>
    </main>
  )
}
