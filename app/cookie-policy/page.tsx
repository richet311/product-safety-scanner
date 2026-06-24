import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Surfelt',
  description: 'How Surfelt uses cookies and similar technologies.',
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

export default function CookiePolicyPage() {
  const lastUpdated = 'June 24, 2026'

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#00C37A' }}>
            Legal
          </p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Cookie Policy</h1>
          <p className="text-sm text-gray-400 font-medium">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device by your web browser when you visit a
              website. They allow the website to remember information about your visit — for example,
              whether you are logged in — so you don't have to re-enter it every time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Cookies We Use</h2>
            <p>Surfelt uses a minimal number of cookies, all strictly necessary to operate the Service.</p>

            <div className="mt-4 rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: '#F0F2F5' }}>
                    <th className="text-left px-4 py-3 font-black text-gray-700 uppercase tracking-wider">Cookie</th>
                    <th className="text-left px-4 py-3 font-black text-gray-700 uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-4 py-3 font-black text-gray-700 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-800 font-semibold">sb-*-auth-token</td>
                    <td className="px-4 py-3 text-gray-600">Supabase authentication session — keeps you logged in</td>
                    <td className="px-4 py-3 text-gray-600">Session / 1 week</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-800 font-semibold">oauth_intent</td>
                    <td className="px-4 py-3 text-gray-600">Tracks whether you initiated OAuth for sign-in or sign-up, so we redirect you to the right page after Google authentication</td>
                    <td className="px-4 py-3 text-gray-600">Until OAuth completes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              These cookies are <strong className="text-gray-800">strictly necessary</strong>. Without
              them, the Service cannot function — you would not be able to stay logged in or complete
              the Google sign-in flow.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">3. What We Do Not Use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No advertising or tracking cookies.</li>
              <li>No third-party analytics cookies (e.g., Google Analytics, Hotjar).</li>
              <li>No social media tracking pixels.</li>
              <li>No fingerprinting or cross-site tracking technologies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Managing Cookies</h2>
            <p>
              Because the cookies we use are strictly necessary to operate the Service, we do not
              display a cookie consent banner — there is nothing optional to consent to.
            </p>
            <p className="mt-3">
              You can block or delete cookies through your browser settings at any time. However,
              blocking the authentication cookie will prevent you from staying logged in to Surfelt.
              Most browsers allow you to manage cookies through:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-3">
              <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Edge: Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy if we introduce new features that use additional
              cookies. We will post updates on this page with a new "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Contact</h2>
            <p>
              Questions about our use of cookies? Email us at{' '}
              <a href="mailto:richetsopa@gmail.com" className="underline hover:text-gray-900" style={{ color: '#00C37A' }}>
                richetsopa@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </main>

      <LegalFooter />
    </div>
  )
}
