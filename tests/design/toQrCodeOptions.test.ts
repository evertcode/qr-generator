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
      data: 'https://github.com/evertcode',
      image: defaultLogo,
      margin: 0,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0, crossOrigin: 'anonymous' },
      dotsOptions: { color: '#222222', type: 'rounded' },
      backgroundOptions: { color: '#fff' },
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

  it('sends an empty image when there is no logo so a removed logo is cleared', () => {
    const options = toQrCodeOptions({ ...DEFAULT_QR_DESIGN, logo: null })

    expect(options).toHaveProperty('image', '')
  })
})
