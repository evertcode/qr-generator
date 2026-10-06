import { describe, expect, it } from 'vitest'
import { QR_STYLE_PRESETS } from '../../src/design/presets'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { assessScannability } from '../../src/utils/contrast'

describe('QR_STYLE_PRESETS', () => {
  it.each(QR_STYLE_PRESETS.map((preset) => [preset.name, preset] as const))('%s passes the scannability check', (_, preset) => {
    expect(assessScannability({ ...DEFAULT_QR_DESIGN, ...preset.style })).toEqual([])
  })

  it('has unique ids', () => {
    const ids = QR_STYLE_PRESETS.map((preset) => preset.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('leaves room around the code for scanners', () => {
    expect(QR_STYLE_PRESETS.every((preset) => preset.style.margin > 0)).toBe(true)
  })
})
