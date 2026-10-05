import { ErrorCorrectionLevel } from 'qr-code-styling'

// Byte mode capacity of the largest QR code (version 40) for each level
const QR_BYTE_CAPACITY: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273
}

const encoder = new TextEncoder()

export function getQrByteCapacity (level: ErrorCorrectionLevel): number {
  return QR_BYTE_CAPACITY[level]
}

export function exceedsQrCapacity (data: string, level: ErrorCorrectionLevel): boolean {
  return encoder.encode(data).length > getQrByteCapacity(level)
}
