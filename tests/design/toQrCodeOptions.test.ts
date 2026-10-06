import { describe, expect, it } from 'vitest'
import { toQrCodeOptions } from '../../src/design/toQrCodeOptions'
import { DEFAULT_QR_DESIGN } from '../../src/design/defaultDesign'
import defaultLogo from '../../assets/logo.svg'

describe('toQrCodeOptions', () => {
  it('maps the default design to the options the app used before the design model', () => {
    expect(toQrCodeOptions(DEFAULT_QR_DESIGN)).toEqual({
      width: 300,
      height: 300,
      type: 'canvas',
      data: 'https://example.com',
      image: defaultLogo,
      margin: 0,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0, crossOrigin: 'anonymous' },
      dotsOptions: { color: '#222222', type: 'rounded' },
      // Same white as before, now in the six digit form the color input needs
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { color: '#222222', type: 'extra-rounded' },
      cornersDotOptions: { color: '#222222', type: 'dot' }
    })
  })

  it('maps a solid fill to the color of its target', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      dots: { type: 'square', fill: { kind: 'solid', color: '#3f6212' } },
      cornersDot: { type: 'square', fill: { kind: 'solid', color: '#84cc16' } }
    })

    expect(options.dotsOptions).toEqual({ color: '#3f6212', type: 'square' })
    expect(options.cornersDotOptions).toEqual({ color: '#84cc16', type: 'square' })
    expect(options.cornersSquareOptions).toEqual({ color: '#222222', type: 'extra-rounded' })
  })

  it('maps a gradient fill to a two stop gradient with the rotation in radians', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      dots: { type: 'rounded', fill: { kind: 'gradient', gradientType: 'linear', rotation: 90, colors: ['#222222', '#3f6212'] } }
    })

    expect(options.dotsOptions).toEqual({
      type: 'rounded',
      color: '#222222',
      gradient: {
        type: 'linear',
        rotation: Math.PI / 2,
        colorStops: [{ offset: 0, color: '#222222' }, { offset: 1, color: '#3f6212' }]
      }
    })
  })

  it('always sends the gradient key so switching back to solid clears it', () => {
    const options = toQrCodeOptions(DEFAULT_QR_DESIGN)

    expect(Object.keys(options.dotsOptions!)).toContain('gradient')
    expect(options.dotsOptions!.gradient).toBeUndefined()
    expect(Object.keys(options.backgroundOptions!)).toContain('gradient')
  })

  it('maps a background gradient', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      background: { transparent: false, fill: { kind: 'gradient', gradientType: 'radial', rotation: 0, colors: ['#ffffff', '#ecfccb'] } }
    })

    expect(options.backgroundOptions?.gradient?.type).toBe('radial')
  })

  it('maps the background color and margin', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      background: { transparent: false, fill: { kind: 'solid', color: '#f5f0e6' } },
      margin: 12
    })

    expect(options.backgroundOptions).toEqual({ color: '#f5f0e6' })
    expect(options.margin).toBe(12)
  })

  it('maps a transparent background to a fully transparent color', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      background: { ...DEFAULT_QR_DESIGN.background, transparent: true }
    })

    expect(options.backgroundOptions).toEqual({ color: 'rgba(0,0,0,0)' })
  })

  it('maps the logo size, margin and hidden dots to the image options', () => {
    const options = toQrCodeOptions({
      ...DEFAULT_QR_DESIGN,
      logo: { ...DEFAULT_QR_DESIGN.logo!, size: 0.25, margin: 6, hideBackgroundDots: false }
    })

    expect(options.imageOptions).toEqual({ imageSize: 0.25, margin: 6, hideBackgroundDots: false, crossOrigin: 'anonymous' })
  })

  it('sends an empty image when there is no logo so a removed logo is cleared', () => {
    const options = toQrCodeOptions({ ...DEFAULT_QR_DESIGN, logo: null })

    expect(options).toHaveProperty('image', '')
  })
})
