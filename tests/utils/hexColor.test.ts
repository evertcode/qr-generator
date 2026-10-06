import { describe, expect, it } from 'vitest'
import { normalizeHexColor } from '../../src/utils/hexColor'

describe('normalizeHexColor', () => {
  it('normalizes #rgb shorthand to #rrggbb', () => {
    expect(normalizeHexColor('#2a7')).toBe('#22aa77')
  })

  it('accepts a valid #rrggbb value', () => {
    expect(normalizeHexColor('#222222')).toBe('#222222')
  })

  it('accepts values without the leading #', () => {
    expect(normalizeHexColor('fff')).toBe('#ffffff')
    expect(normalizeHexColor('84cc16')).toBe('#84cc16')
  })

  it('ignores surrounding whitespace', () => {
    expect(normalizeHexColor('  #84cc16  ')).toBe('#84cc16')
  })

  it('is case insensitive and returns lowercase', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc')
    expect(normalizeHexColor('#84CC16')).toBe('#84cc16')
  })

  it.each(['', '#', '#12', '#1234', '#12345', '#1234567', '#ggg', '#12345z', 'red'])(
    'returns null for the invalid value "%s"',
    (value) => {
      expect(normalizeHexColor(value)).toBeNull()
    }
  )
})
