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
  dots: QrShapeStyle<DotType>
  cornersSquare: QrShapeStyle<CornerSquareType>
  cornersDot: QrShapeStyle<CornerDotType>
  logo: QrLogo | null
}

export type QrFillTarget = 'dots' | 'cornersSquare' | 'cornersDot'

export type QrDesignAction =
  | { type: 'set-content'; content: QrContent }
  | { type: 'set-size'; dimension: QrSizeDimension; value: number }
  | { type: 'set-error-correction'; level: ErrorCorrectionLevel }
  | { type: 'set-fill'; target: QrFillTarget; fill: QrFill }
  | { type: 'set-logo'; src: string; name: string }
  | { type: 'remove-logo' }
  | { type: 'reset' }
