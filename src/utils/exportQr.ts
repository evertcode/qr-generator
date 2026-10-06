import QRCodeStyling, { Options } from 'qr-code-styling'
import { QrExportOptions, QrExportSize } from '../types/design'

export const DEFAULT_FILE_NAME = 'qr'
const FILE_NAME_MAX_LENGTH = 100
// Path separators, characters Windows forbids and control characters (matched on purpose, to strip them)
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[/\\<>:"|?*\u0000-\u001f]/g
// The library adds the extension, so a typed one would end up doubled ("logo.png.svg")
const TYPED_EXTENSION = /\.(svg|png|jpe?g|webp)$/i

export function sanitizeFileName (name: string): string {
  const safe = name
    .replace(UNSAFE_CHARS, '')
    .trim()
    .replace(TYPED_EXTENSION, '')
    .replace(/[. ]+$/, '')
    .slice(0, FILE_NAME_MAX_LENGTH)
    .trim()
  return safe || DEFAULT_FILE_NAME
}

// Scales the longest side to the export size, margins included, so the code keeps its proportions
export function scaleQrOptions (options: Options, size: QrExportSize | 'preview'): Options {
  if (size === 'preview') return options

  const width = options.width ?? size
  const height = options.height ?? size
  const scale = size / Math.max(width, height)
  const scaled = (value: number | undefined) => Math.round((value ?? 0) * scale)

  return {
    ...options,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    margin: scaled(options.margin),
    imageOptions: { ...options.imageOptions, margin: scaled(options.imageOptions?.margin) }
  }
}

// A separate instance renders the export, so the preview keeps its on-screen size
export const createExportQr = (options: Options, size: QrExportSize | 'preview'): QRCodeStyling =>
  new QRCodeStyling(scaleQrOptions(options, size))

export async function exportQr (options: Options, { extension, fileName, size }: QrExportOptions): Promise<void> {
  await createExportQr(options, size).download({ name: sanitizeFileName(fileName), extension })
}
