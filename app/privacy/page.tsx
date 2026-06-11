import PageWrapper from '@/components/layout/PageWrapper'

export const metadata = { title: 'Privacy Policy — Maritime AI Guide' }

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <h1 className="font-display text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: June 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: `We collect information you provide when creating an account (name, email, phone number), your academic profile details (qualification, percentage, age), and usage data such as pages visited and features used. We also collect device information (browser type, device type) automatically.`
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to provide personalized eligibility checks and course recommendations, to improve our AI advisor (NavAI), to send relevant notifications about CET dates and sponsorship openings (with your consent), and to ensure the security and integrity of our platform.`
            },
            {
              title: '3. Third-Party Services',
              content: `We use Supabase for database and authentication services. We use OpenAI's API to power NavAI responses. These providers have their own privacy policies and are contractually obligated to protect your data. We do not sell your personal data to any third party.`
            },
            {
              title: '4. Data Storage and Security',
              content: `Your data is stored securely on Supabase infrastructure hosted in the EU/US region. We use row-level security (RLS) policies to ensure users can only access their own data. Passwords are hashed and never stored in plain text.`
            },
            {
              title: '5. Your Rights',
              content: `You have the right to access, correct, or delete your personal data at any time from your Profile settings. You may also request a full data export by contacting us at privacy@maritimeaiguide.in. You can opt out of non-essential communications at any time.`
            },
            {
              title: '6. Cookies',
              content: `We use essential cookies for authentication session management. We do not use tracking cookies or third-party advertising cookies. You may disable cookies in your browser, but this may affect your ability to log in.`
            },
            {
              title: '7. Contact',
              content: `For privacy-related queries, contact us at privacy@maritimeaiguide.in or write to us at Maritime AI Guide, India.`
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-semibold text-primary mb-3">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
