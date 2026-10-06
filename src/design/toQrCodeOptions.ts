import { Options } from 'qr-code-styling'
import { QrDesign } from '../types/design'
import { DEFAULT_LOGO_SETTINGS } from './defaultDesign'

const TRANSPARENT = 'rgba(0,0,0,0)'

export function toQrCodeOptions (design: QrDesign): Options {
  const logo = design.logo ?? DEFAULT_LOGO_SETTINGS

  return {
    width: design.size.width,
    height: design.size.height,
    type: 'canvas',
    data: design.content.text,
    // Always sent: `update` merges options, so a missing key would keep a removed logo
    image: design.logo?.src ?? '',
    margin: design.margin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: design.errorCorrectionLevel
    },
    imageOptions: {
      hideBackgroundDots: logo.hideBackgroundDots,
      imageSize: logo.size,
      margin: logo.margin,
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      color: design.dots.fill.color,
      type: design.dots.type
    },
    backgroundOptions: {
      color: design.background.transparent ? TRANSPARENT : design.background.fill.color
    },
    cornersSquareOptions: {
      color: design.cornersSquare.fill.color,
      type: design.cornersSquare.type
    },
    cornersDotOptions: {
      color: design.cornersDot.fill.color,
      type: design.cornersDot.type
    }
  }
}
