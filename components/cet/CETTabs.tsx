'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Link from 'next/link'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

const TABS = ['Overview', 'Exam Pattern', 'Syllabus', 'Cities', 'Registration', 'Preparation'] as const
type Tab = typeof TABS[number]

const SUBJECT_DATA = [
  { subject: 'Mathematics', questions: 50, marks: 50, strategy: 'Highest weightage', color: '#1E3A5F' },
  { subject: 'Physics', questions: 50, marks: 50, strategy: 'Highest weightage', color: '#0A1628' },
  { subject: 'Chemistry', questions: 20, marks: 20, strategy: 'Medium weightage', color: '#00C896' },
  { subject: 'English', questions: 40, marks: 40, strategy: 'Important', color: '#00D4FF' },
  { subject: 'Gen. Aptitude', questions: 40, marks: 40, strategy: 'Important', color: '#FFB347' },
]

const CITIES = [
  'Agra', 'Ahmedabad', 'Allahabad', 'Bangalore', 'Bhopal', 'Bhubaneswar',
  'Chandigarh', 'Chennai', 'Coimbatore', 'Dehradun', 'Faridabad', 'Guwahati',
  'Hyderabad', 'Jaipur', 'Kanpur', 'Kochi', 'Kolkata', 'Kota', 'Lucknow',
  'Madurai', 'Meerut', 'Mumbai', 'Muzaffarpur', 'Nagpur', 'New Delhi', 'Noida',
  'Patna', 'Pune', 'Raipur', 'Ranchi', 'Shimla', 'Siliguri', 'Srinagar',
  'Trivandrum', 'Varanasi', 'Visakhapatnam',
]

const CITIES_BY_STATE: Record<string, string[]> = {
  'Delhi / NCR': ['New Delhi', 'Noida', 'Faridabad'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'Uttar Pradesh': ['Agra', 'Allahabad', 'Kanpur', 'Lucknow', 'Meerut', 'Varanasi'],
  'Karnataka': ['Bangalore'],
  'Telangana': ['Hyderabad'],
  'West Bengal': ['Kolkata', 'Siliguri'],
  'Rajasthan': ['Jaipur', 'Kota'],
  'Bihar': ['Patna', 'Muzaffarpur'],
  'Gujarat': ['Ahmedabad'],
  'Madhya Pradesh': ['Bhopal'],
  'Odisha': ['Bhubaneswar'],
  'Punjab / Haryana': ['Chandigarh'],
  'Assam': ['Guwahati'],
  'Kerala': ['Kochi', 'Trivandrum'],
  'Uttarakhand': ['Dehradun'],
  'Andhra Pradesh': ['Visakhapatnam'],
  'Chhattisgarh': ['Raipur'],
  'Jharkhand': ['Ranchi'],
  'Himachal Pradesh': ['Shimla'],
  'Jammu & Kashmir': ['Srinagar'],
}

const SYLLABUS = [
  {
    subject: 'Mathematics', marks: 50, color: '#1E3A5F',
    topics: ['Algebra', 'Trigonometry', 'Calculus', 'Statistics', 'Coordinate Geometry', 'Matrices and Determinants', 'Vectors and 3D Geometry', 'Probability'],
  },
  {
    subject: 'Physics', marks: 50, color: '#0A1628',
    topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity and Magnetism', 'Modern Physics', 'Waves and Oscillations', 'Units and Measurements'],
  },
  {
    subject: 'Chemistry', marks: 20, color: '#00C896',
    topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Electrochemistry', 'Chemical Equilibrium', 'Atomic Structure'],
  },
  {
    subject: 'English', marks: 40, color: '#00D4FF',
    topics: ['Grammar and Usage', 'Reading Comprehension', 'Vocabulary', 'Sentence Correction', 'Para Jumbles', 'Fill in the Blanks'],
  },
  {
    subject: 'General Aptitude', marks: 40, color: '#FFB347',
    topics: ['Logical Reasoning', 'Numerical Ability', 'Spatial Reasoning', 'Data Interpretation', 'General Knowledge (Maritime focused)'],
  },
]

const PREP_PLANS: Record<string, { weeks: string; focus: string }[]> = {
  '3-month': [
    { weeks: 'Weeks 1–4', focus: 'Mathematics fundamentals: Algebra, Trigonometry, Calculus basics' },
    { weeks: 'Weeks 5–8', focus: 'Physics: Mechanics, Thermodynamics, Optics' },
    { weeks: 'Weeks 9–10', focus: 'Chemistry and English revision' },
    { weeks: 'Weeks 11–12', focus: 'General Aptitude + Full mock tests daily' },
  ],
  '6-month': [
    { weeks: 'Month 1', focus: 'Mathematics: Algebra, Trigonometry, Coordinate Geometry' },
    { weeks: 'Month 2', focus: 'Mathematics: Calculus, Matrices, Vectors, Statistics' },
    { weeks: 'Month 3', focus: 'Physics: Mechanics, Thermodynamics, Optics' },
    { weeks: 'Month 4', focus: 'Physics (advanced) + Chemistry complete syllabus' },
    { weeks: 'Month 5', focus: 'English + General Aptitude + subject-wise practice' },
    { weeks: 'Month 6', focus: 'Full mock tests + weak area revision' },
  ],
  '1-month': [
    { weeks: 'Week 1', focus: 'Math: Calculus + Trigonometry (most important topics)' },
    { weeks: 'Week 2', focus: 'Physics: Mechanics + Electricity + Modern Physics' },
    { weeks: 'Week 3', focus: 'Chemistry (basics) + English grammar + Aptitude' },
    { weeks: 'Week 4', focus: 'Daily full mock tests + review wrong answers only' },
  ],
}

function SyllabusAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {SYLLABUS.map((s, i) => (
        <div key={s.subject} className="border border-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: s.color }}>
                {s.marks}
              </span>
              <span className="font-semibold text-text-primary">{s.subject}</span>
              <span className="text-text-secondary text-sm">({s.marks} marks)</span>
            </div>
            {open === i ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
          </button>
          {open === i && (
            <div className="px-5 pb-4 border-t border-border bg-surface">
              <div className="flex flex-wrap gap-2 pt-4">
                {s.topics.map(t => (
                  <span key={t} className="bg-white border border-border text-text-primary text-sm px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/cet/practice" className="text-accent text-sm font-medium hover:underline flex items-center gap-1">
                  Practice {s.subject} Questions <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StateGroup() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
        <div key={state} className="border border-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface transition"
            onClick={() => setOpen(open === state ? null : state)}
          >
            <span className="font-medium text-text-primary">{state}</span>
            <span className="text-text-secondary text-sm">{cities.length} {cities.length === 1 ? 'city' : 'cities'}</span>
          </button>
          {open === state && (
            <div className="px-5 pb-4 border-t border-border bg-surface flex flex-wrap gap-2 pt-3">
              {cities.map(c => (
                <span key={c} className="bg-white border border-border text-text-primary text-sm px-3 py-1 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PrepPlan() {
  const [plan, setPlan] = useState<'3-month' | '6-month' | '1-month'>('3-month')
  const plans = ['3-month', '6-month', '1-month'] as const
  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {plans.map(p => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${plan === p ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary'}`}
          >
            {p === '3-month' ? '3-Month Plan' : p === '6-month' ? '6-Month Plan' : '1-Month Crash Plan'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {PREP_PLANS[plan].map((row, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white border border-border rounded-xl">
            <span className="text-accent font-bold text-sm w-24 shrink-0">{row.weeks}</span>
            <span className="text-text-primary text-sm">{row.focus}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CETTabs() {
  const [active, setActive] = useState<Tab>('Overview')

  return (
    <div>
      {/* Tab Nav */}
      <div className="overflow-x-auto -mx-4 px-4 mb-8">
        <div className="flex gap-1 min-w-max border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                active === tab ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Overview */}
      {active === 'Overview' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">What is IMU CET?</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              The Indian Maritime University Common Entrance Test (IMU-CET) is a national-level entrance examination conducted by the Indian Maritime University (IMU) on behalf of the Directorate General of Shipping (DGS). It is the gateway to undergraduate maritime programmes at IMU campuses and affiliated institutes across India.
            </p>
            <p className="text-text-secondary leading-relaxed">
              The test is conducted online (Computer Based Test) in English and screens candidates for technical aptitude in Mathematics, Physics, Chemistry, English, and General Aptitude. Qualifying IMU-CET is mandatory for admission to CET-required maritime courses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Courses Covered by CET</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'BE/B.Tech Marine Engineering', duration: '4 Years', dept: 'Engine', color: 'bg-green-50 border-green-200' },
                { name: 'B.Sc. Nautical Science', duration: '3 Years', dept: 'Deck', color: 'bg-blue-50 border-blue-200' },
                { name: 'Diploma in Nautical Science (DNS)', duration: '1 Year', dept: 'Deck', color: 'bg-blue-50 border-blue-200' },
              ].map(c => (
                <div key={c.name} className={`p-5 rounded-xl border ${c.color}`}>
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{c.dept}</span>
                  <p className="font-bold text-text-primary mt-1 mb-2">{c.name}</p>
                  <span className="text-sm text-text-secondary">{c.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Key Facts</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                ['Conducting Body', 'Indian Maritime University (IMU)'],
                ['On behalf of', 'Directorate General of Shipping'],
                ['Mode', 'Online (Computer Based Test)'],
                ['Language', 'English'],
                ['Negative Marking', 'None'],
                ['Score Validity', 'Current academic year only'],
                ['Registration Fee', '₹1,000'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 p-4 bg-white border border-border rounded-xl">
                  <span className="text-text-secondary text-sm w-36 shrink-0">{k}</span>
                  <span className="font-medium text-text-primary text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Exam Pattern */}
      {active === 'Exam Pattern' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">CET Exam Structure</h2>
            <p className="text-xs text-text-secondary mb-6">Source: DGS Training Circular No. 12 of 2020, Annexure II</p>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    {['Subject', 'Questions', 'Marks', 'Strategy'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBJECT_DATA.map((row, i) => (
                    <tr key={row.subject} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                      <td className="px-4 py-3 font-medium text-text-primary">{row.subject}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.questions}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.marks}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.strategy}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-bold">
                    <td className="px-4 py-3 text-text-primary">TOTAL</td>
                    <td className="px-4 py-3 text-text-primary">200</td>
                    <td className="px-4 py-3 text-text-primary">200</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Question Distribution</h3>
            <div className="bg-white border border-border rounded-xl p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBJECT_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown) => [`${v} questions`]} />
                  <Bar dataKey="questions" radius={[4, 4, 0, 0]}>
                    {SUBJECT_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Key Rules</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '✅', text: 'No negative marking — attempt all questions' },
                { icon: '⏱️', text: 'Duration: 3 hours (180 minutes)' },
                { icon: '⚡', text: '~54 seconds per question on average' },
                { icon: '🖐️', text: 'Biometrics captured during exam' },
              ].map(r => (
                <div key={r.text} className="flex gap-3 p-4 bg-white border border-border rounded-xl">
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-text-primary text-sm">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Tie-Breaking Rules (Equal Scores)</h3>
            <ol className="space-y-2">
              {[
                'Total marks in CET',
                'Highest marks in Mathematics',
                'Highest marks in Physics',
                'Highest marks in Chemistry',
                'Highest marks in General Aptitude',
                'Highest marks in English',
                'Seniority in date of birth',
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-primary">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: Syllabus */}
      {active === 'Syllabus' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">CET Syllabus</h2>
            <p className="text-text-secondary text-sm mb-6">Based on CBSE/ICSE/State Board Curriculum</p>
          </div>
          <SyllabusAccordion />
        </div>
      )}

      {/* TAB 4: Cities */}
      {active === 'Cities' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">36 Exam Centers Across India</h2>
            <p className="text-text-secondary text-sm mb-6">CET conducted at 100+ venues in these cities</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {CITIES.map(c => (
                <span key={c} className="bg-white border border-border text-text-primary text-sm px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Browse by State</h3>
            <StateGroup />
            <p className="text-text-secondary text-sm mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              📍 Exact venue within your city will be assigned after registration
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: Registration */}
      {active === 'Registration' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-text-primary">How to Register for IMU CET</h2>

          {[
            {
              step: 1, title: 'Check Eligibility',
              content: (
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>• 12th pass with 60% aggregate in PCM</p>
                  <p>• 50% in English in 10th or 12th</p>
                  <p>• Age below 25 years (General category)</p>
                  <Link href="/eligibility" className="text-accent font-medium hover:underline flex items-center gap-1 mt-2">
                    Check your eligibility <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )
            },
            {
              step: 2, title: 'Prepare Documents',
              content: (
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Passport OR 10th Marksheet (DOB proof)', spec: 'JPG/JPEG/PDF · max 200KB' },
                    { label: '12th Std/Degree Certificate', spec: 'JPG/JPEG/PDF · max 200KB' },
                    { label: 'Photograph: 35mm × 45mm', spec: 'max 450×600px · 20KB–60KB · JPG/JPEG/PNG' },
                    { label: 'Signature: 45mm × 25mm', spec: 'max 600×300px · 10KB–30KB · JPG/JPEG/PNG' },
                    { label: 'SC/ST/OBC/EWS certificate (if applicable)', spec: 'JPG/JPEG/PDF · max 200KB' },
                  ].map(d => (
                    <div key={d.label} className="flex gap-2">
                      <span className="text-success shrink-0">✓</span>
                      <div>
                        <p className="text-text-primary font-medium">{d.label}</p>
                        <p className="text-text-muted text-xs">{d.spec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              step: 3, title: 'Register Online',
              content: (
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>• Visit IMU official website</p>
                  <p>• Fill application form completely</p>
                  <p>• Upload all required documents</p>
                  <p>• Pay ₹1,000 registration fee (online only)</p>
                </div>
              )
            },
            {
              step: 4, title: 'Download Hall Ticket',
              content: <p className="text-sm text-text-secondary">Available before exam. Contains test venue and timing details.</p>
            },
            {
              step: 5, title: 'Appear for Exam',
              content: <p className="text-sm text-text-secondary">Carry Hall Ticket + valid photo ID. Biometrics captured at venue.</p>
            },
            {
              step: 6, title: 'Check Results',
              content: <p className="text-sm text-text-secondary">Published on DGS website. Rank certificate issued online.</p>
            },
          ].map(({ step, title, content }) => (
            <div key={step} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {step}
                </div>
                {step < 6 && <div className="w-px flex-1 bg-border mt-2" />}
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-text-primary mb-3">{title}</h3>
                {content}
              </div>
            </div>
          ))}

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
            <p className="font-medium text-text-primary mb-3">Get notified when CET registration opens</p>
            <Link href="/eligibility" className="inline-flex items-center gap-2 bg-accent text-primary font-bold py-2.5 px-6 rounded-full hover:bg-accent-dark transition text-sm">
              Set Reminder <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 6: Preparation */}
      {active === 'Preparation' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">How to Prepare for IMU CET</h2>
            <PrepPlan />
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Subject-Wise Tips</h3>
            <div className="space-y-3">
              {[
                { s: 'Mathematics', tip: 'Focus on Calculus and Trigonometry — they carry the most questions. Practice differentiation, integration, and trig identities daily.' },
                { s: 'Physics', tip: 'Mechanics and Electricity carry the most weight. Master Newton\'s laws, work-energy theorem, circuits, and electrostatics.' },
                { s: 'Chemistry', tip: 'Only 20 marks — cover atomic structure, electrochemistry, and organic basics. Don\'t over-invest time here.' },
                { s: 'English', tip: 'Grammar and reading comprehension are most predictable. Practice daily para jumbles and sentence correction.' },
                { s: 'General Aptitude', tip: 'Practice logical reasoning daily with our mock tests. Maritime GK is a bonus — know basic ship terminology.' },
              ].map(({ s, tip }) => (
                <div key={s} className="p-4 bg-white border border-border rounded-xl">
                  <p className="font-semibold text-text-primary mb-1">{s}</p>
                  <p className="text-sm text-text-secondary">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Practice with Free Mock Tests</h3>
            <div className="flex gap-4 flex-wrap text-sm text-blue-200 mb-4">
              <span>250+ Questions</span>
              <span>5 Subjects</span>
              <span>Instant Results</span>
              <span>Performance Tracking</span>
            </div>
            <Link
              href="/cet/practice"
              className="inline-flex items-center gap-2 bg-accent text-primary font-bold py-2.5 px-6 rounded-full hover:bg-accent-dark transition text-sm"
            >
              Start Practicing Free <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
