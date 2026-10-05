import { describe, expect, it } from 'vitest'
import { LOGO_MAX_BYTES, validateLogoFile } from '../../src/utils/validateLogoFile'

const fileOf = (type: string, size = 10) => new File([new Uint8Array(size)], 'logo', { type })

describe('validateLogoFile', () => {
  it.each(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])('accepts %s', (type) => {
    expect(validateLogoFile(fileOf(type))).toEqual({ ok: true })
  })

  it.each(['image/gif', 'application/pdf', ''])('rejects the unsupported type "%s"', (type) => {
    expect(validateLogoFile(fileOf(type))).toEqual({ ok: false, reason: 'unsupported-type' })
  })

  it('accepts a file of exactly 1 MB', () => {
    expect(validateLogoFile(fileOf('image/png', LOGO_MAX_BYTES))).toEqual({ ok: true })
  })

  it('rejects a file over 1 MB', () => {
    expect(validateLogoFile(fileOf('image/png', LOGO_MAX_BYTES + 1))).toEqual({ ok: false, reason: 'too-large' })
  })
})
