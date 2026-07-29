import { LegalPage } from '../components/LegalPage'

/**
 * Aria Terms of Service — version 1.0.
 * Placeholders to finalize before launch: {{OPERATOR_NAME}}, {{CONTACT_EMAIL}}, {{JURISDICTION}}.
 */
export const TermsOfService = () => (
  <LegalPage title="Terms of Service" lastUpdated="July 29, 2026" version="1.0">
    <p>
      These terms are the agreement between you and Aria (operated by {'{{OPERATOR_NAME}}'})
      when you use our website and applications. By creating an account or using Aria, you
      accept them — along with our{' '}
      <a href="/privacy" style={{ color: 'var(--brand-solid)' }}>Privacy Policy</a>.
    </p>

    <h2>1. What Aria is</h2>
    <p>
      Aria is an AI spiritual companion: Bible study, daily devotions, emotional support
      conversations, and voice calls — all grounded in Christian Scripture.
    </p>
    <div className="legal-note">
      <p>
        <strong>What Aria is not:</strong> Aria is not a pastor, priest, counselor, therapist,
        or medical service. Nothing Aria says is professional advice. If you are in crisis,
        feeling unsafe, or struggling with your mental health, please contact a qualified
        professional or an emergency/crisis line in your country immediately — then keep
        walking with God and with people who can truly help you.
      </p>
    </div>
    <p>
      Aria is powered by AI, and AI can be wrong — occasionally even when quoting Scripture.
      Verify references against your Bible, and weigh everything with discernment, as Scripture
      itself instructs (1 Thessalonians 5:21).
    </p>

    <h2>2. Your account</h2>
    <ul>
      <li>Provide accurate information and keep your login credentials secure.</li>
      <li>You are responsible for activity under your account.</li>
      <li>You must be at least 13 years old.</li>
      <li>Tell us at {'{{CONTACT_EMAIL}}'} if you believe your account has been compromised.</li>
    </ul>

    <h2>3. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use Aria for anything unlawful or to harm others.</li>
      <li>Attempt to extract, resell, or redistribute Aria&apos;s responses or underlying systems.</li>
      <li>Probe, scrape, or attack the service, or circumvent limits and access controls.</li>
      <li>Impersonate any person, or misrepresent your affiliation with Aria.</li>
      <li>Use the emotional support feature in place of professional care in an emergency.</li>
    </ul>

    <h2>4. Your content and ours</h2>
    <p>
      <strong>You own what you write</strong> — your messages, journals, notes, and prayers
      remain yours. You grant us only the permission needed to store them and provide the
      service (including processing message content with AI providers, as described in the
      Privacy Policy).
    </p>
    <p>
      Aria&apos;s name, design, branding, and software are ours (or our licensors&apos;) and may
      not be copied or reused without written permission.
    </p>

    <h2>5. Free and premium features</h2>
    <p>
      Core features are free. Voice calls on the free tier are limited in length per session.
    </p>
    <p>
      Premium voice calls may be offered as pay-as-you-go minute packs, purchased through
      Paystack. Minutes are credited to your account and deducted as you talk, at the rate
      shown when you purchase. We never store your card details — payment is handled entirely
      by Paystack.
    </p>
    <p>
      <strong>Refunds:</strong> used minutes are non-refundable. If a technical failure on our
      side consumes minutes without delivering a call, we will re-credit them — contact
      {' {{CONTACT_EMAIL}}'}. Statutory refund rights in your country are not affected.
    </p>

    <h2>6. Suspension and ending your account</h2>
    <p>
      You may stop using Aria and request deletion of your account at any time
      ({'{{CONTACT_EMAIL}}'}). We may suspend access that violates these terms. Sections that by
      their nature should survive (such as content rights, disclaimers, and liability) do.
    </p>

    <h2>7. Disclaimers</h2>
    <p>
      Aria is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong>.
      To the fullest extent permitted by law, we disclaim all warranties — including accuracy of
      AI-generated content, fitness for a particular purpose, and uninterrupted availability.
      Spiritual and life decisions remain yours; test everything against Scripture and wise counsel.
    </p>

    <h2>8. Limitation of liability</h2>
    <p>
      To the fullest extent permitted by law, our total liability for any claim relating to Aria
      is limited to the greater of the amount you paid us in the 12 months before the claim, or
      the minimum amount the law allows. We are not liable for indirect or consequential damages,
      or for the conduct or statements of AI providers.
    </p>

    <h2>9. Changes to these terms</h2>
    <p>
      We may update these terms as Aria grows. When changes materially affect your rights, we
      will present the new terms for your acceptance; continued use after acceptance constitutes
      agreement. The version and date at the top always reflect the current edition.
    </p>

    <h2>10. Governing law and contact</h2>
    <p>
      These terms are governed by the laws of {'{{JURISDICTION}}'}, without regard to conflict of
      law rules. Any disputes will be resolved in the courts of that jurisdiction, unless local
      law grants you another venue.
    </p>
    <p>
      Questions: <strong>{'{{CONTACT_EMAIL}}'}</strong>.
    </p>
  </LegalPage>
)

export default TermsOfService
