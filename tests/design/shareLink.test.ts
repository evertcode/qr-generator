import { describe, expect, it } from 'vitest'
import { decodeDesignFromHash, encodeDesignToHash, hasSharedDesign, isUploadedLogo } from '../../src/design/shareLink'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { QrDesign } from '../../src/types/design'

const sharedDesign: QrDesign = {
  ...DEFAULT_QR_DESIGN,
  content: { type: 'vcard', firstName: 'Zoë', lastName: 'Núñez', phone: '', email: '', organization: 'Café & Co', url: '' },
  dots: { type: 'classy', fill: { kind: 'gradient', gradientType: 'linear', rotation: 45, colors: ['#0c4a6e', '#0369a1'] } },
  margin: 16
}

const UPLOADED_LOGO = 'data:image/png;base64,iVBORw0KGgo='

describe('encodeDesignToHash and decodeDesignFromHash', () => {
  it('round trips a design, non ASCII text included', () => {
    expect(decodeDesignFromHash(encodeDesignToHash(sharedDesign))).toEqual(sharedDesign)
  })

  it('produces a URL safe hash', () => {
    expect(encodeDesignToHash(sharedDesign)).toMatch(/^design=[A-Za-z0-9_-]+$/)
  })

  it('accepts the hash with its leading #', () => {
    expect(decodeDesignFromHash(`#${encodeDesignToHash(sharedDesign)}`)).toEqual(sharedDesign)
  })

  it('keeps the default logo', () => {
    expect(decodeDesignFromHash(encodeDesignToHash(DEFAULT_QR_DESIGN))?.logo).toEqual(DEFAULT_QR_DESIGN.logo)
  })

  it('leaves out an uploaded logo', () => {
    const withUpload = { ...sharedDesign, logo: { ...sharedDesign.logo!, src: UPLOADED_LOGO, name: 'brand.png' } }

    expect(encodeDesignToHash(withUpload)).not.toContain(btoa('brand.png').slice(0, 8))
    expect(decodeDesignFromHash(encodeDesignToHash(withUpload))?.logo).toBeNull()
  })

  it.each([
    ['garbage', 'design=%%%'],
    ['valid base64 but not JSON', `design=${btoa('hello')}`],
    ['another version', `design=${btoa(JSON.stringify({ version: 2, design: {} }))}`],
    ['an invalid design', `design=${btoa(JSON.stringify({ version: 1, design: { margin: 999 } }))}`]
  ])('returns null for %s', (_, hash) => {
    expect(decodeDesignFromHash(hash)).toBeNull()
  })

  it('returns null without a design param', () => {
    expect(decodeDesignFromHash('#section-2')).toBeNull()
  })
})

describe('hasSharedDesign', () => {
  it('detects the design param only', () => {
    expect(hasSharedDesign('#design=abc')).toBe(true)
    expect(hasSharedDesign('#section-2')).toBe(false)
    expect(hasSharedDesign('')).toBe(false)
  })
})

describe('isUploadedLogo', () => {
  it('tells uploaded logos from the bundled one', () => {
    expect(isUploadedLogo(DEFAULT_QR_DESIGN.logo)).toBe(false)
    expect(isUploadedLogo({ ...DEFAULT_QR_DESIGN.logo!, src: UPLOADED_LOGO })).toBe(true)
    expect(isUploadedLogo(null)).toBe(false)
  })
})
