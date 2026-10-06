import { describe, expect, it } from 'vitest'
import { buildQrPayload, describeQrContent } from '../../src/utils/buildQrPayload'
import { EMPTY_CONTENT } from '../../src/design/emptyContent'

describe('buildQrPayload', () => {
  it('returns plain text unchanged', () => {
    expect(buildQrPayload({ type: 'text', text: 'https://github.com/evertcode' })).toBe('https://github.com/evertcode')
  })

  it('builds a WPA WiFi code with a hidden network', () => {
    const payload = buildQrPayload({ ...EMPTY_CONTENT.wifi, ssid: 'Home', password: 'secret', hidden: true })

    expect(payload).toBe('WIFI:T:WPA;S:Home;P:secret;H:true;;')
  })

  it('escapes backslash, semicolon, comma, colon and quotes in WiFi fields', () => {
    const payload = buildQrPayload({ ...EMPTY_CONTENT.wifi, ssid: 'My;Net,"1"', password: 'a\\b:c' })

    expect(payload).toBe('WIFI:T:WPA;S:My\\;Net\\,\\"1\\";P:a\\\\b\\:c;;')
  })

  it('omits the password for an open network', () => {
    const payload = buildQrPayload({ ...EMPTY_CONTENT.wifi, ssid: 'Cafe', password: 'ignored', encryption: 'nopass' })

    expect(payload).toBe('WIFI:T:nopass;S:Cafe;;')
  })

  it('builds mailto with URL encoded subject and body', () => {
    const payload = buildQrPayload({ type: 'email', to: ' hi@site.com ', subject: 'Hello there', body: 'A & B' })

    expect(payload).toBe('mailto:hi@site.com?subject=Hello%20there&body=A%20%26%20B')
  })

  it('builds a bare mailto when subject and body are empty', () => {
    expect(buildQrPayload({ ...EMPTY_CONTENT.email, to: 'hi@site.com' })).toBe('mailto:hi@site.com')
  })

  it('builds tel stripping spaces, dashes, dots and parentheses', () => {
    expect(buildQrPayload({ type: 'phone', number: '+34 (600) 000-00.0' })).toBe('tel:+34600000000')
  })

  it('builds SMSTO with the number and message', () => {
    expect(buildQrPayload({ type: 'sms', number: '+34 600 000 000', message: 'On my way' })).toBe('SMSTO:+34600000000:On my way')
  })

  it('builds a vCard 3.0 with only the filled fields', () => {
    const payload = buildQrPayload({ ...EMPTY_CONTENT.vcard, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@site.com' })

    expect(payload).toBe([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Lovelace;Ada;;;',
      'FN:Ada Lovelace',
      'EMAIL:ada@site.com',
      'END:VCARD'
    ].join('\r\n'))
  })

  it('escapes semicolons, commas and backslashes in vCard values', () => {
    const payload = buildQrPayload({ ...EMPTY_CONTENT.vcard, firstName: 'Ada', organization: 'Engines; Babbage, \\Co' })

    expect(payload).toContain('ORG:Engines\\; Babbage\\, \\\\Co')
  })
})

describe('describeQrContent', () => {
  it('summarizes each content type for the preview caption', () => {
    expect(describeQrContent({ ...EMPTY_CONTENT.wifi, ssid: 'Home' })).toBe('WiFi · Home')
    expect(describeQrContent({ ...EMPTY_CONTENT.vcard, firstName: 'Ada', lastName: 'Lovelace' })).toBe('Contact · Ada Lovelace')
    expect(describeQrContent({ type: 'text', text: 'hello' })).toBe('hello')
  })
})
