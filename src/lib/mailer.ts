/**
 * Bravexo transactional mail — zero-infrastructure email delivery.
 *
 * OTP codes are delivered through FormSubmit's AJAX endpoint, which forwards
 * the payload to the recipient's real inbox (no backend, no keys). The very
 * first submission to a new address triggers a one-time activation email the
 * owner must click; afterwards every code lands in Gmail instantly.
 *
 * When Supabase is configured, server-side email OTP (Supabase mailer) is
 * used instead — see src/lib/auth.tsx.
 */

export interface OtpSendResult {
  ok: boolean
  error?: string
  activationRequired?: boolean
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendOtpEmail(email: string, code: string): Promise<OtpSendResult> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Bravexo EarlyBooster — your verification code',
        _template: 'table',
        _captcha: 'false',
        Product: 'Bravexo EarlyBooster',
        'Verification code': code,
        Note: 'This code expires when you leave the registration page.',
      }),
    })
    if (!res.ok) {
      return { ok: false, error: `Mail provider returned HTTP ${res.status}.` }
    }
    const data = (await res.json().catch(() => ({}))) as { success?: string; message?: string }
    // FormSubmit replies with an activation notice until the inbox owner
    // confirms the address once.
    const activation = /activat/i.test(data.message ?? '') || /activat/i.test(data.success ?? '')
    return { ok: true, activationRequired: activation }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error while sending email.' }
  }
}
