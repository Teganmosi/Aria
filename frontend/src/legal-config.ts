/**
 * Single source of truth for the legal documents (Privacy Policy, Terms of Service).
 *
 * Update THIS file when:
 *  - the business email is live        → contactEmail
 *  - the company is registered         → operatorName
 *  - the product is renamed            → productName
 * Every legal page reads from here — no other files need touching.
 */
export const LEGAL = {
  /** Product/brand name used throughout the legal documents. */
  productName: 'Aria',
  /** Operating entity. Pre-incorporation: reads naturally as "the Aria team". */
  operatorName: 'the Aria team',
  /**
   * Public support contact. Empty until the business email is set up —
   * pages render an honest fallback line instead of a placeholder.
   */
  contactEmail: '',
  /** Governing-law jurisdiction. */
  jurisdiction: 'the Federal Republic of Nigeria',
  /** Document version — bump on material changes (triggers re-consent flow). */
  version: '1.0',
  lastUpdated: 'July 29, 2026',
}
