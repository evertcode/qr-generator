import { describe, expect, it } from 'vitest'
import { exceedsQrCapacity, getQrByteCapacity } from '../../src/utils/qrCapacity'

describe('getQrByteCapacity', () => {
  it.each([
    ['L', 2953],
    ['M', 2331],
    ['Q', 1663],
    ['H', 1273]
  ] as const)('returns %s capacity of %i bytes', (level, capacity) => {
    expect(getQrByteCapacity(level)).toBe(capacity)
  })
})

describe('exceedsQrCapacity', () => {
  it('does not exceed when data is at the limit', () => {
    expect(exceedsQrCapacity('x'.repeat(1663), 'Q')).toBe(false)
  })

  it('exceeds when data is one byte over the limit', () => {
    expect(exceedsQrCapacity('x'.repeat(1664), 'Q')).toBe(true)
  })

  it('counts multibyte UTF-8 characters by bytes, not by length', () => {
    // "é" takes 2 bytes, so 832 of them (1664 bytes) overflow level Q
    expect(exceedsQrCapacity('é'.repeat(831), 'Q')).toBe(false)
    expect(exceedsQrCapacity('é'.repeat(832), 'Q')).toBe(true)
  })
})
