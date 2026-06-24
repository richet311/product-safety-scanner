import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Surfelt',
  description: 'How Surfelt collects, uses, and protects your personal information.',
}

function LegalHeader() {
  return (
    <header className="border-b border-gray-100" style={{ backgroundColor: 'rgba(255,255,255,0.97)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Surf<span style={{ color: '#00C37A' }}>elt</span>
          </a>
          <a href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-150">
            ← Back to Home
          </a>
        </div>
      </div>
    </header>
  )
}

function LegalFooter() {
  return (
    <footer className="border-t border-gray-200 mt-16" style={{ backgroundColor: '#E8EAED' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-semibold">
            © {new Date().getFullYear()} Surfelt. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="/cookie-policy" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 24, 2026'

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#00C37A' }}>
            Legal
          </p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-400 font-medium">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Who We Are</h2>
            <p>
              Surfelt ("we," "us," or "our") is an AI-powered product safety analysis tool. This Privacy
              Policy explains what information we collect when you use Surfelt, how we use it, and your
              choices regarding that information. By creating an account or using our service you agree to
              the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-bold text-gray-800 mb-2">Account Information</h3>
            <p>
              When you sign in with Google, we receive your name, email address, and profile photo URL from
              Google OAuth. We store this alongside your Surfelt account identifier.
            </p>

            <h3 className="text-base font-bold text-gray-800 mb-2 mt-4">Health Profile (Voluntarily Provided)</h3>
            <p>
              If you choose to set up a health profile, we store the information you enter: allergies and
              intolerances, dietary preferences, health conditions, and age. This information is optional.
              You provide it voluntarily to receive personalized ingredient analysis.
            </p>

            <h3 className="text-base font-bold text-gray-800 mb-2 mt-4">Scan History</h3>
            <p>
              Every product scan you perform is saved to your account. This includes the product name,
              raw ingredient text, the AI-generated safety analysis, an overall grade (A–D), and the
              date of the scan.
            </p>

            <h3 className="text-base font-bold text-gray-800 mb-2 mt-4">Product Images</h3>
            <p>
              When you photograph a product label, the image is uploaded to our secure cloud storage
              (Supabase Storage) and associated with your scan record. Images are used to extract
              ingredient text via AI vision analysis.
            </p>

            <h3 className="text-base font-bold text-gray-800 mb-2 mt-4">Usage Data</h3>
            <p>
              We record a timestamp each time you perform a scan for the purpose of enforcing daily usage
              limits. We do not collect device identifiers, IP addresses beyond what our infrastructure
              logs automatically, or behavioral analytics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and personalize the ingredient safety analysis service.</li>
              <li>To save your scan history so you can review past results on your dashboard.</li>
              <li>To enforce per-account daily scan limits.</li>
              <li>To improve the accuracy and quality of AI-generated analyses (in aggregate, without identifying you).</li>
              <li>To send transactional communications related to your account if necessary.</li>
            </ul>
            <p className="mt-3">
              We do not use your health profile data for advertising. We do not sell, rent, or trade
              your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>We rely on the following sub-processors to operate Surfelt:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-gray-800">Supabase</strong>: provides our database, authentication,
                and file storage. Your account data, health profile, scan history, and product images are
                stored on Supabase infrastructure.
              </li>
              <li>
                <strong className="text-gray-800">Groq</strong>: provides the AI inference API used to
                analyze ingredient lists and extract text from product photos. Ingredient text and images
                are sent to Groq for processing and are subject to Groq's privacy policy.
              </li>
              <li>
                <strong className="text-gray-800">Google</strong>: provides OAuth sign-in. When you sign
                in with Google, Google's privacy policy governs the authentication flow.
              </li>
              <li>
                <strong className="text-gray-800">Vercel</strong>: hosts our web application. Vercel may
                collect standard web server logs (IP addresses, request metadata) as part of hosting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain your account data and scan history for as long as your account is active. Product
              images are stored in cloud storage indefinitely unless you delete your account. If you
              delete your account, we will delete your personal data from our database, although backups
              may retain it for a short period thereafter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Access the personal data we hold about you.</li>
              <li>Update or correct your health profile at any time from your account settings.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent by deleting your account.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{' '}
              <a href="mailto:surfeltsupport@gmail.com" className="underline hover:text-gray-900" style={{ color: '#00C37A' }}>
                surfeltsupport@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Security</h2>
            <p>
              We use industry-standard security practices including HTTPS encryption in transit and
              Supabase Row-Level Security policies that ensure users can only access their own data.
              However, no method of transmission over the internet is completely secure. We cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>
              Surfelt is not directed to children under 13. We do not knowingly collect personal data
              from children under 13. If you believe a child has provided us with personal information,
              contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated policy on
              this page with a new "Last updated" date. Continued use of Surfelt after changes
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy? Email us at{' '}
              <a href="mailto:surfeltsupport@gmail.com" className="underline hover:text-gray-900" style={{ color: '#00C37A' }}>
                surfeltsupport@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </main>

      <LegalFooter />
    </div>
  )
}
