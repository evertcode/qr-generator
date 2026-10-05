import QRCodeStyling from 'qr-code-styling'
import { CopyResult } from '../types/qr'

export async function copyQrToClipboard (qrCode: QRCodeStyling): Promise<CopyResult> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return 'unsupported'

  try {
    // The item gets a pending blob so Safari still treats the write as part of the click
    const png = qrCode.getRawData('png').then((blob) => {
      if (!blob) throw new Error('The QR code could not be rendered as PNG')
      return blob
    })
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
    return 'copied'
  } catch {
    return 'failed'
  }
}
