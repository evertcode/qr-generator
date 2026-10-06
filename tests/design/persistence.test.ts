import { describe, expect, it } from 'vitest'
import {
  DESIGN_STORAGE_KEY,
  clearSavedDesign,
  loadSavedDesign,
  parseQrDesign,
  saveDesign,
  serializeQrDesign
} from '../../src/design/persistence'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { QrDesign } from '../../src/types/design'

// In-memory Storage that can mimic a quota limit or a blocked storage
class FakeStorage implements Storage {
  private items = new Map<string, string>()

  constructor (private readonly quota = Infinity, private readonly blocked = false) {}

  get length () { return this.items.size }
  clear () { this.items.clear() }
  key (index: number) { return [...this.items.keys()][index] ?? null }
  removeItem (key: string) { this.items.delete(key) }

  getItem (key: string) {
    if (this.blocked) throw new DOMException('Blocked', 'SecurityError')
    return this.items.get(key) ?? null
  }

  setItem (key: string, value: string) {
    if (this.blocked) throw new DOMException('Blocked', 'SecurityError')
    if (value.length > this.quota) throw new DOMException('Full', 'QuotaExceededError')
    this.items.set(key, value)
  }
}

const UPLOADED_LOGO = `data:image/png;base64,${'A'.repeat(2000)}`

const customDesign: QrDesign = {
  ...DEFAULT_QR_DESIGN,
  content: { type: 'wifi', ssid: 'Home', password: 'secret', encryption: 'WPA', hidden: false },
  dots: { type: 'classy', fill: { kind: 'gradient', gradientType: 'radial', rotation: 0, colors: ['#7c2d12', '#be123c'] } },
  margin: 12
}

const stored = (design: unknown, version = 1) => JSON.stringify({ version, design })

describe('saveDesign and loadSavedDesign', () => {
  it('saves and loads the same design', () => {
    const storage = new FakeStorage()

    expect(saveDesign(storage, customDesign)).toBe('saved')
    expect(loadSavedDesign(storage)).toEqual(customDesign)
  })

  it('stores the bundled logo as a marker and restores it', () => {
    const storage = new FakeStorage()
    saveDesign(storage, DEFAULT_QR_DESIGN)

    expect(storage.getItem(DESIGN_STORAGE_KEY)).toContain('"src":"default"')
    expect(loadSavedDesign(storage)?.logo).toEqual(DEFAULT_QR_DESIGN.logo)
  })

  it('returns null when nothing is saved', () => {
    expect(loadSavedDesign(new FakeStorage())).toBeNull()
  })

  it('returns null for malformed JSON or another version', () => {
    const storage = new FakeStorage()

    storage.setItem(DESIGN_STORAGE_KEY, '{not json')
    expect(loadSavedDesign(storage)).toBeNull()

    storage.setItem(DESIGN_STORAGE_KEY, stored(serializeQrDesign(customDesign), 2))
    expect(loadSavedDesign(storage)).toBeNull()
  })

  it('saves without the logo when the storage is full', () => {
    const withLogo = { ...customDesign, logo: { ...customDesign.logo!, src: UPLOADED_LOGO } }
    const storage = new FakeStorage(1500)

    expect(saveDesign(storage, withLogo)).toBe('saved-without-logo')
    expect(loadSavedDesign(storage)).toEqual({ ...withLogo, logo: null })
  })

  it('fails when storage is unavailable', () => {
    expect(saveDesign(new FakeStorage(Infinity, true), customDesign)).toBe('failed')
    expect(loadSavedDesign(new FakeStorage(Infinity, true))).toBeNull()
  })

  it('clears the saved design', () => {
    const storage = new FakeStorage()
    saveDesign(storage, customDesign)

    clearSavedDesign(storage)

    expect(loadSavedDesign(storage)).toBeNull()
  })
})

describe('parseQrDesign', () => {
  const valid = serializeQrDesign(customDesign)

  it('accepts a valid serialized design', () => {
    expect(parseQrDesign(valid)).toEqual(customDesign)
  })

  it('drops unknown fields', () => {
    const parsed = parseQrDesign({ ...valid, extra: 'ignored', size: { ...valid.size, depth: 3 } })

    expect(parsed).toEqual(customDesign)
    expect(parsed).not.toHaveProperty('extra')
  })

  it('normalizes colors', () => {
    const parsed = parseQrDesign({ ...valid, cornersDot: { type: 'dot', fill: { kind: 'solid', color: '#ABC' } } })

    expect(parsed?.cornersDot.fill).toEqual({ kind: 'solid', color: '#aabbcc' })
  })

  it.each([
    ['a bad color', { cornersDot: { type: 'dot', fill: { kind: 'solid', color: 'red' } } }],
    ['an out of range size', { size: { width: 5000, height: 300 } }],
    ['an unknown shape', { dots: { type: 'stars', fill: { kind: 'solid', color: '#000000' } } }],
    ['an unknown content type', { content: { type: 'bitcoin', address: 'x' } }],
    ['a remote logo URL', { logo: { ...valid.logo, src: 'https://example.com/logo.png' } }],
    ['a logo size over the limit', { logo: { ...valid.logo, size: 0.9 } }],
    ['a gradient with one color', { dots: { type: 'square', fill: { kind: 'gradient', gradientType: 'linear', rotation: 0, colors: ['#000000'] } } }]
  ])('rejects %s', (_, override) => {
    expect(parseQrDesign({ ...valid, ...override })).toBeNull()
  })

  it.each([null, 'design', 42, []])('rejects the non object %s', (value) => {
    expect(parseQrDesign(value)).toBeNull()
  })
})
