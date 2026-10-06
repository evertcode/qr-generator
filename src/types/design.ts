import { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from 'qr-code-styling'
import { QrSizeDimension } from './qr'

export type QrGradientType = 'linear' | 'radial'
export type QrFillKind = 'solid' | 'gradient'

export type QrFill =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; gradientType: QrGradientType; rotation: number; colors: [string, string] }

export type QrWifiEncryption = 'WPA' | 'WEP' | 'nopass'

export type QrContent =
  | { type: 'text'; text: string }
  | { type: 'wifi'; ssid: string; password: string; encryption: QrWifiEncryption; hidden: boolean }
  | { type: 'email'; to: string; subject: string; body: string }
  | { type: 'phone'; number: string }
  | { type: 'sms'; number: string; message: string }
  | { type: 'vcard'; firstName: string; lastName: string; phone: string; email: string; organization: string; url: string }

export type QrContentType = QrContent['type']
export type QrContentOf<T extends QrContentType> = Extract<QrContent, { type: T }>
export type QrContentDrafts = { [K in QrContentType]: QrContentOf<K> }
export type QrContentError = 'empty-text' | 'missing-ssid' | 'missing-email' | 'missing-phone' | 'missing-name'

export interface QrSize {
  width: number
  height: number
}

export interface QrShapeStyle<T extends string> {
  type: T
  fill: QrFill
}

export interface QrBackground {
  transparent: boolean
  fill: QrFill
}

export interface QrLogo {
  src: string
  name: string
  size: number
  margin: number
  hideBackgroundDots: boolean
}

export type QrLogoSettings = Omit<QrLogo, 'src' | 'name'>

export interface QrDesign {
  content: QrContent
  size: QrSize
  errorCorrectionLevel: ErrorCorrectionLevel
  dots: QrShapeStyle<QrShapeTypes['dots']>
  cornersSquare: QrShapeStyle<QrShapeTypes['cornersSquare']>
  cornersDot: QrShapeStyle<QrShapeTypes['cornersDot']>
  background: QrBackground
  margin: number
  logo: QrLogo | null
}

export type QrDesignStyle = Pick<QrDesign, 'dots' | 'cornersSquare' | 'cornersDot' | 'background' | 'margin'>

export interface QrStylePreset {
  id: string
  name: string
  style: QrDesignStyle
}

export type InitialDesignSource = 'link' | 'invalid-link' | 'storage' | 'default'

export interface InitialDesign {
  design: QrDesign
  source: InitialDesignSource
}

export interface DesignHistory {
  design: QrDesign
  dispatch: (action: QrDesignAction) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export type SaveDesignResult = 'saved' | 'saved-without-logo' | 'failed'

export type QrShapeTarget = 'dots' | 'cornersSquare' | 'cornersDot'
export type ScannabilityIssue = 'low-contrast' | 'inverted'

export type QrFillTarget = QrShapeTarget | 'background'

export interface QrShapeTypes {
  dots: DotType
  cornersSquare: CornerSquareType
  cornersDot: CornerDotType
}

export type QrSetShapeAction = {
  [K in QrShapeTarget]: { type: 'set-shape'; target: K; shape: QrShapeTypes[K] }
}[QrShapeTarget]

export type QrDesignAction =
  | { type: 'set-content'; content: QrContent }
  | { type: 'set-size'; dimension: QrSizeDimension; value: number }
  | { type: 'set-error-correction'; level: ErrorCorrectionLevel }
  | { type: 'set-fill'; target: QrFillTarget; fill: QrFill }
  | QrSetShapeAction
  | { type: 'set-background'; transparent: boolean }
  | { type: 'set-margin'; margin: number }
  | { type: 'set-logo'; src: string; name: string }
  | { type: 'update-logo'; settings: Partial<QrLogoSettings> }
  | { type: 'remove-logo' }
  | { type: 'apply-preset'; style: QrDesignStyle }
  | { type: 'replace'; design: QrDesign }
  | { type: 'reset' }
