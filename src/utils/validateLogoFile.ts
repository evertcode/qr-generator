import { LogoValidationResult } from '../types/qr'

export const LOGO_ACCEPTED_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
export const LOGO_MAX_BYTES = 1024 * 1024

export function validateLogoFile (file: File): LogoValidationResult {
  if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, reason: 'unsupported-type' }
  }

  if (file.size > LOGO_MAX_BYTES) {
    return { ok: false, reason: 'too-large' }
  }

  return { ok: true }
}
