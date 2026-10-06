import { Gradient, Options } from 'qr-code-styling'
import { QrDesign, QrFill } from '../types/design'
import { DEFAULT_LOGO_SETTINGS } from './defaultDesign'
import { buildQrPayload } from '../utils/buildQrPayload'

const TRANSPARENT = 'rgba(0,0,0,0)'

interface QrColorOptions {
  color: string
  gradient: Gradient | undefined
}

// `gradient` is always sent: `update` merges options, so a missing key would keep an old gradient
const toColorOptions = (fill: QrFill): QrColorOptions => {
  if (fill.kind === 'solid') return { color: fill.color, gradient: undefined }

  return {
    color: fill.colors[0],
    gradient: {
      type: fill.gradientType,
      rotation: (fill.rotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: fill.colors[0] },
        { offset: 1, color: fill.colors[1] }
      ]
    }
  }
}

export function toQrCodeOptions (design: QrDesign): Options {
  const logo = design.logo ?? DEFAULT_LOGO_SETTINGS

  return {
    width: design.size.width,
    height: design.size.height,
    type: 'canvas',
    data: buildQrPayload(design.content),
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
      ...toColorOptions(design.dots.fill),
      type: design.dots.type
    },
    backgroundOptions: {
      ...(design.background.transparent
        ? { color: TRANSPARENT, gradient: undefined }
        : toColorOptions(design.background.fill))
    },
    cornersSquareOptions: {
      ...toColorOptions(design.cornersSquare.fill),
      type: design.cornersSquare.type
    },
    cornersDotOptions: {
      ...toColorOptions(design.cornersDot.fill),
      type: design.cornersDot.type
    }
  }
}
