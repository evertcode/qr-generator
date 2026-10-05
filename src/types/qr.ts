import { RefObject } from 'react'
import QRCodeStyling from 'qr-code-styling'

export type QrColorTarget = 'dots' | 'cornersSquare' | 'cornersDot'
export type QrColorOptionKey = `${QrColorTarget}Options`
export type QrSizeDimension = 'width' | 'height'

export interface UseQrCodeResult {
  containerRef: RefObject<HTMLDivElement>
  qrCode: QRCodeStyling
}
