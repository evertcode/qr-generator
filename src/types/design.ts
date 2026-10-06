import { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from 'qr-code-styling'
import { QrSizeDimension } from './qr'

export type QrFill = { kind: 'solid'; color: string }

export type QrContent = { type: 'text'; text: string }

export interface QrSize {
  width: number
  height: number
}

export interface QrShapeStyle<T extends string> {
  type: T
  fill: QrFill
}

export interface QrLogo {
  src: string
  name: string
  size: number
  margin: number
  hideBackgroundDots: boolean
}

export interface QrDesign {
  content: QrContent
  size: QrSize
  errorCorrectionLevel: ErrorCorrectionLevel
  dots: QrShapeStyle<QrShapeTypes['dots']>
  cornersSquare: QrShapeStyle<QrShapeTypes['cornersSquare']>
  cornersDot: QrShapeStyle<QrShapeTypes['cornersDot']>
  logo: QrLogo | null
}

export type QrShapeTarget = 'dots' | 'cornersSquare' | 'cornersDot'
export type QrFillTarget = QrShapeTarget

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
  | { type: 'set-logo'; src: string; name: string }
  | { type: 'remove-logo' }
  | { type: 'reset' }
