import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Surfelt',
  description: 'The terms and conditions governing your use of Surfelt.',
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

export default function TermsOfServicePage() {
  const lastUpdated = 'June 25, 2026'

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#00C37A' }}>
            Legal
          </p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-400 font-medium">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Surfelt ("the Service"), you agree to be bound by these Terms of
              Service. If you do not agree to all of these terms, do not use the Service. We may update
              these terms at any time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              Surfelt is an AI-powered product ingredient analysis tool. It allows users to scan product
              barcodes, photograph ingredient labels, or search by product name to receive an AI-generated
              safety analysis grading each ingredient on a scale of A to D. Supported product types
              include food and beverages, medications and supplements, cosmetics and skincare, cleaning
              and household products, and fragrances and personal care products. Results are for
              <strong className="text-gray-800"> informational purposes only</strong> and do not
              constitute medical, dietary, dermatological, toxicological, or any other professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">3. Eligibility and Accounts</h2>
            <p>
              You must be at least 13 years old to use Surfelt. By creating an account, you represent
              that you meet this age requirement. You are responsible for maintaining the confidentiality
              of your account credentials and for all activity that occurs under your account.
            </p>
            <p className="mt-3">
              We currently offer account creation via Google OAuth. You are responsible for complying
              with Google's Terms of Service in connection with that sign-in method.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the Service's APIs or infrastructure.</li>
              <li>Upload product images that contain content that is illegal, harmful, or unrelated to product ingredients.</li>
              <li>Circumvent scan limits or usage controls.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Use the Service to make medical diagnoses or replace professional healthcare advice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">5. No Medical Advice</h2>
            <p>
              Surfelt provides AI-generated ingredient safety information. This is not a substitute for
              professional medical, dietary, or healthcare advice, diagnosis, or treatment. Always seek
              the guidance of your physician or other qualified health professional with any questions
              you may have regarding a medical condition, allergy, or dietary restriction.
            </p>
            <p className="mt-3">
              Never disregard professional medical advice or delay in seeking it because of something
              you have read on Surfelt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6. AI Accuracy and Third-Party Data Disclaimer</h2>
            <p>
              AI-generated analyses may be incomplete, inaccurate, or out of date. Product formulations
              change, and regulatory classifications vary by jurisdiction. Surfelt makes no representation
              or warranty about the accuracy, completeness, or reliability of any analysis result. You
              rely on any analysis at your own risk.
            </p>
            <p className="mt-3">
              For barcode and name-based product lookups, ingredient information is retrieved from public
              product databases (including Open Food Facts, Open Beauty Facts, and Nutritionix), publicly
              accessible websites, and Safety Data Sheets. This data is provided as-is. We are not
              affiliated with these sources and cannot verify or guarantee the accuracy, completeness, or
              currency of data retrieved from them.
            </p>
            <p className="mt-3">
              For fragrance and perfume products, ingredient formulas are legally protected trade secrets
              in many jurisdictions. Brands are generally only required to disclose known allergens. The
              ingredient list for such products may be limited or may list "Fragrance" or "Parfum" as a
              single entry covering many undisclosed compounds. Surfelt cannot display ingredient
              information beyond what is publicly available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6a. Cleaning and Household Products</h2>
            <p>
              When Surfelt is used to analyze cleaning products, disinfectants, or other household
              chemicals, the results are for general informational awareness only. Always follow the
              manufacturer's instructions, safety warnings, and hazard labels on the product packaging.
              Do not use Surfelt's analysis to override or disregard any product warning label. These
              products are not intended for ingestion, and nothing in Surfelt's analysis should be
              interpreted as guidance on safe consumption or alternative use of any such product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Scan Limits</h2>
            <p>
              Each account is subject to a daily scan limit (default: 20 scans per day). We reserve the
              right to adjust these limits at any time. Attempts to circumvent scan limits may result in
              account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>
              The Surfelt name, logo, and all content, features, and functionality of the Service are
              owned by Surfelt and are protected by intellectual property laws. You may not copy,
              reproduce, distribute, or create derivative works without our written permission.
            </p>
            <p className="mt-3">
              You retain ownership of any product images you upload. By uploading images, you grant us
              a non-exclusive, royalty-free license to use those images solely to provide the Service
              (including processing them through AI vision models).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">9. Third-Party Services and Data Sources</h2>
            <p>
              Surfelt uses third-party services including Supabase, Groq, Cerebras, SambaNova, and
              Google. Ingredient text and product images you submit are sent to one or more of these
              AI providers for processing. Your use of the Service is also subject to those providers'
              terms of service. We are not responsible for the practices of third-party services.
            </p>
            <p className="mt-3">
              To retrieve ingredient information for products, Surfelt may query public product databases
              (Open Food Facts, Open Beauty Facts, Nutritionix), publicly accessible retail websites,
              and publicly available Safety Data Sheets. Surfelt is not affiliated with these sources.
              Ingredient data retrieved from them is used solely to provide the Service and is not
              resold or redistributed. We do not warrant that this data is accurate or complete.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Surfelt and its operators shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, use, goodwill, or other intangible
              losses, resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Your use of or inability to use the Service.</li>
              <li>Any reliance on AI-generated ingredient analysis or safety grades.</li>
              <li>Unauthorized access to or alteration of your data.</li>
              <li>Any interruption or cessation of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">11. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either
              express or implied. We do not warrant that the Service will be uninterrupted, error-free,
              or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">12. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of
              these Terms. You may delete your account at any time. Upon termination, your right to use
              the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable law. Any
              disputes arising from these Terms or your use of the Service will be resolved in the
              jurisdiction where the operator is located.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">14. Contact</h2>
            <p>
              Questions about these Terms? Email us at{' '}
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
