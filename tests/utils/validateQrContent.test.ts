import { describe, expect, it } from 'vitest'
import { validateQrContent } from '../../src/utils/validateQrContent'
import { EMPTY_CONTENT } from '../../src/design/emptyContent'

describe('validateQrContent', () => {
  it.each([
    ['text', 'empty-text'],
    ['wifi', 'missing-ssid'],
    ['email', 'missing-email'],
    ['phone', 'missing-phone'],
    ['sms', 'missing-phone'],
    ['vcard', 'missing-name']
  ] as const)('reports the missing required field of an empty %s', (type, error) => {
    expect(validateQrContent(EMPTY_CONTENT[type])).toBe(error)
  })

  it('treats whitespace as missing', () => {
    expect(validateQrContent({ ...EMPTY_CONTENT.wifi, ssid: '   ' })).toBe('missing-ssid')
  })

  it('accepts a contact with only a last name', () => {
    expect(validateQrContent({ ...EMPTY_CONTENT.vcard, lastName: 'Lovelace' })).toBeNull()
  })

  it('accepts filled content', () => {
    expect(validateQrContent({ ...EMPTY_CONTENT.wifi, ssid: 'Home' })).toBeNull()
  })
})
