import { QrDesign, QrLogo } from '../types/design'
import defaultLogo from '../../assets/logo.svg'

export const DEFAULT_LOGO_SETTINGS: Omit<QrLogo, 'src' | 'name'> = {
  size: 0.4,
  margin: 0,
  hideBackgroundDots: true
}

const INK = '#222222'

export const DEFAULT_QR_DESIGN: QrDesign = {
  content: { type: 'text', text: 'https://github.com/evertcode' },
  size: { width: 300, height: 300 },
  errorCorrectionLevel: 'Q',
  dots: { type: 'rounded', fill: { kind: 'solid', color: INK } },
  cornersSquare: { type: 'extra-rounded', fill: { kind: 'solid', color: INK } },
  cornersDot: { type: 'dot', fill: { kind: 'solid', color: INK } },
  background: { transparent: false, fill: { kind: 'solid', color: '#ffffff' } },
  margin: 0,
  logo: { src: defaultLogo, name: 'evertcode mascot', ...DEFAULT_LOGO_SETTINGS }
}
