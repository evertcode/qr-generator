import { describe, expect, it } from 'vitest'
import { assessScannability, getContrastRatio } from '../../src/utils/contrast'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { QrDesign } from '../../src/types/design'

// Paints dots and eyes with the same ink
const withColors = (ink: string, background: string, transparent = false): QrDesign => ({
  ...DEFAULT_QR_DESIGN,
  dots: { ...DEFAULT_QR_DESIGN.dots, fill: { kind: 'solid', color: ink } },
  cornersSquare: { ...DEFAULT_QR_DESIGN.cornersSquare, fill: { kind: 'solid', color: ink } },
  cornersDot: { ...DEFAULT_QR_DESIGN.cornersDot, fill: { kind: 'solid', color: ink } },
  background: { transparent, fill: { kind: 'solid', color: background } }
})

describe('getContrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('returns 1 for equal colors', () => {
    expect(getContrastRatio('#84cc16', '#84cc16')).toBe(1)
  })

  it('is symmetric', () => {
    expect(getContrastRatio('#3f6212', '#f5f0e6')).toBe(getContrastRatio('#f5f0e6', '#3f6212'))
  })

  it('accepts shorthand colors', () => {
    expect(getContrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
  })
})

describe('assessScannability', () => {
  it('reports nothing for the default design', () => {
    expect(assessScannability(DEFAULT_QR_DESIGN)).toEqual([])
  })

  it('reports low-contrast below 4:1', () => {
    // #949494 on white is about 3:1
    expect(assessScannability(withColors('#949494', '#ffffff'))).toEqual(['low-contrast'])
  })

  it('accepts a contrast of at least 4:1', () => {
    // #767676 on white is about 4.5:1
    expect(assessScannability(withColors('#767676', '#ffffff'))).toEqual([])
  })

  it('reports inverted when the dots are lighter than the background', () => {
    expect(assessScannability(withColors('#ffffff', '#222222'))).toEqual(['inverted'])
  })

  it('checks the eye colors too', () => {
    const design = { ...DEFAULT_QR_DESIGN, cornersDot: { ...DEFAULT_QR_DESIGN.cornersDot, fill: { kind: 'solid', color: '#eeeeee' } } } as QrDesign

    expect(assessScannability(design)).toEqual(['low-contrast'])
  })

  it('checks every gradient color of the dots against the background', () => {
    const design: QrDesign = {
      ...DEFAULT_QR_DESIGN,
      dots: { ...DEFAULT_QR_DESIGN.dots, fill: { kind: 'gradient', gradientType: 'linear', rotation: 0, colors: ['#222222', '#dddddd'] } }
    }

    expect(assessScannability(design)).toEqual(['low-contrast'])
  })

  it('checks the dots against every background gradient color', () => {
    const design: QrDesign = {
      ...DEFAULT_QR_DESIGN,
      background: { transparent: false, fill: { kind: 'gradient', gradientType: 'linear', rotation: 0, colors: ['#ffffff', '#333333'] } }
    }

    // #222222 on the #333333 end is still darker, so it is low contrast but not inverted
    expect(assessScannability(design)).toEqual(['low-contrast'])
  })

  it('reports a frame that touches the code', () => {
    const framed: QrDesign = { ...DEFAULT_QR_DESIGN, frame: { text: 'Scan me', color: '#222222', textColor: '#ffffff' } }

    expect(assessScannability({ ...framed, margin: 0 })).toEqual(['frame-touches-code'])
    expect(assessScannability({ ...framed, margin: 9 })).toEqual([])
  })

  it('reports a frame touching the code even with a transparent background', () => {
    const framed: QrDesign = {
      ...withColors('#222222', '#ffffff', true),
      frame: { text: 'Scan me', color: '#222222', textColor: '#ffffff' }
    }

    expect(assessScannability(framed)).toEqual(['frame-touches-code'])
  })

  it('reports nothing for a transparent background', () => {
    expect(assessScannability(withColors('#eeeeee', '#ffffff', true))).toEqual([])
  })
})
