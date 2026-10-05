import { useEffect, useRef, useState } from 'react'
import QRCodeStyling, { Options } from 'qr-code-styling'
import { UseQrCodeResult } from '../types/qr'

export function useQrCode (options: Options): UseQrCodeResult {
  // Lazy initializer: the instance is built once, not on every render
  const [qrCode] = useState(() => new QRCodeStyling(options))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) qrCode.append(containerRef.current)
  }, [qrCode])

  useEffect(() => {
    qrCode.update(options)
  }, [qrCode, options])

  return { containerRef, qrCode }
}
