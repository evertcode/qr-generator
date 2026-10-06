import { describe, expect, it } from 'vitest'
import { qrDesignReducer } from '../../src/design/qrDesignReducer'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import { QrDesign, QrDesignAction } from '../../src/types/design'

const apply = (action: QrDesignAction, state: QrDesign = DEFAULT_QR_DESIGN) => qrDesignReducer(state, action)

describe('qrDesignReducer', () => {
  it('sets the content without touching the other fields', () => {
    const next = apply({ type: 'set-content', content: { type: 'text', text: 'hello' } })

    expect(next).toEqual({ ...DEFAULT_QR_DESIGN, content: { type: 'text', text: 'hello' } })
  })

  it('sets one size dimension and keeps the other', () => {
    const next = apply({ type: 'set-size', dimension: 'height', value: 500 })

    expect(next).toEqual({ ...DEFAULT_QR_DESIGN, size: { width: 300, height: 500 } })
  })

  it('sets the error correction level without touching the other fields', () => {
    expect(apply({ type: 'set-error-correction', level: 'H' })).toEqual({ ...DEFAULT_QR_DESIGN, errorCorrectionLevel: 'H' })
  })

  it('sets the fill of one target and keeps its shape and the other targets', () => {
    const fill = { kind: 'solid', color: '#3f6212' } as const
    const next = apply({ type: 'set-fill', target: 'cornersSquare', fill })

    expect(next).toEqual({ ...DEFAULT_QR_DESIGN, cornersSquare: { type: 'extra-rounded', fill } })
  })

  it('sets the shape of one target and keeps its fill and the other targets', () => {
    const next = apply({ type: 'set-shape', target: 'dots', shape: 'classy' })

    expect(next).toEqual({ ...DEFAULT_QR_DESIGN, dots: { ...DEFAULT_QR_DESIGN.dots, type: 'classy' } })
  })

  it('replaces the logo image and keeps its size settings', () => {
    const state = { ...DEFAULT_QR_DESIGN, logo: { ...DEFAULT_QR_DESIGN.logo!, size: 0.3 } }
    const next = apply({ type: 'set-logo', src: 'data:image/png;base64,AA', name: 'brand.png' }, state)

    expect(next.logo).toEqual({ ...state.logo, src: 'data:image/png;base64,AA', name: 'brand.png' })
  })

  it('adds a logo with the default settings when there was none', () => {
    const state = { ...DEFAULT_QR_DESIGN, logo: null }
    const next = apply({ type: 'set-logo', src: 'data:image/png;base64,AA', name: 'brand.png' }, state)

    expect(next.logo).toEqual({ src: 'data:image/png;base64,AA', name: 'brand.png', size: 0.4, margin: 0, hideBackgroundDots: true })
  })

  it('removes the logo without touching the other fields', () => {
    expect(apply({ type: 'remove-logo' })).toEqual({ ...DEFAULT_QR_DESIGN, logo: null })
  })

  it('resets to the default design', () => {
    const edited = apply({ type: 'set-content', content: { type: 'text', text: 'edited' } })

    expect(apply({ type: 'reset' }, edited)).toBe(DEFAULT_QR_DESIGN)
  })
})
