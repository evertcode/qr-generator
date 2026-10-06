import { FileExtension } from 'qr-code-styling'
import { QrFrame } from '../types/design'
import { FRAME_FONT_FAMILY, FRAME_FONT_WEIGHT, frameLayout } from '../design/frameLayout'

const RASTER_TYPES: Record<Exclude<FileExtension, 'svg'>, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const svgSize = (svg: Element) => ({
  width: Number(svg.getAttribute('width')),
  height: Number(svg.getAttribute('height'))
})

// The QR stays a nested <svg>, so the export is still fully vector
async function composeSvg (qr: Blob, frame: QrFrame): Promise<Blob> {
  const document = new DOMParser().parseFromString(await qr.text(), 'image/svg+xml')
  const qrSvg = document.documentElement
  const { width, height } = svgSize(qrSvg)
  const layout = frameLayout(width, height)
  qrSvg.setAttribute('x', String(layout.border))
  qrSvg.setAttribute('y', String(layout.border))

  const framed = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">`,
    `<rect width="${layout.width}" height="${layout.height}" fill="${escapeXml(frame.color)}"/>`,
    new XMLSerializer().serializeToString(qrSvg),
    `<text x="${layout.width / 2}" y="${height + layout.border + layout.band / 2}" fill="${escapeXml(frame.textColor)}"`,
    ` font-family="${escapeXml(FRAME_FONT_FAMILY)}" font-weight="${FRAME_FONT_WEIGHT}" font-size="${layout.fontSize}"`,
    ` text-anchor="middle" dominant-baseline="central">${escapeXml(frame.text)}</text>`,
    '</svg>'
  ].join('')

  return new Blob([framed], { type: 'image/svg+xml' })
}

async function composeRaster (qr: Blob, frame: QrFrame, type: string): Promise<Blob> {
  const image = await createImageBitmap(qr)
  const layout = frameLayout(image.width, image.height)
  const font = `${FRAME_FONT_WEIGHT} ${layout.fontSize}px ${FRAME_FONT_FAMILY}`
  // Canvas text falls back silently when the web font is not loaded yet
  await document.fonts.load(font)

  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not available')

  context.fillStyle = frame.color
  context.fillRect(0, 0, layout.width, layout.height)
  context.drawImage(image, layout.border, layout.border)
  context.fillStyle = frame.textColor
  context.font = font
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(frame.text, layout.width / 2, image.height + layout.border + layout.band / 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The framed image could not be encoded')), type)
  })
}

export function composeFramedQr (qr: Blob, frame: QrFrame, extension: FileExtension): Promise<Blob> {
  return extension === 'svg' ? composeSvg(qr, frame) : composeRaster(qr, frame, RASTER_TYPES[extension])
}
