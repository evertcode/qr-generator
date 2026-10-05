import { RefObject } from 'react'
import QRCodeStyling from 'qr-code-styling'

export type QrColorTarget = 'dots' | 'cornersSquare' | 'cornersDot'
export type QrColorOptionKey = `${QrColorTarget}Options`
export type QrSizeDimension = 'width' | 'height'

export interface UseQrCodeResult {
  containerRef: RefObject<HTMLDivElement>
  qrCode: QRCodeStyling
}

export type LogoValidationError = 'unsupported-type' | 'too-large'
export type LogoValidationResult = { ok: true } | { ok: false; reason: LogoValidationError }
export type LogoUploadError = LogoValidationError | 'unreadable'

export type CopyResult = 'copied' | 'unsupported' | 'failed'
