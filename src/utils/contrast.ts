import { QrDesign, QrFill, ScannabilityIssue } from '../types/design'
import { normalizeHexColor } from './hexColor'

// Scanners need clearly darker dots than background; 4:1 leaves room for print and screen glare
const MIN_SCANNABLE_CONTRAST = 4
// A frame needs a quiet zone between it and the modules, relative to the code size
const MIN_FRAMED_MARGIN_RATIO = 0.03

const channelLuminance = (channel: number) => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (hex: string): number => {
  const normalized = normalizeHexColor(hex)
  if (!normalized) throw new Error(`Invalid hex color: ${hex}`)

  const [r, g, b] = [1, 3, 5].map((start) => parseInt(normalized.slice(start, start + 2), 16))
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

export function getContrastRatio (a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

const fillColors = (fill: QrFill): string[] => fill.kind === 'solid' ? [fill.color] : fill.colors

const frameTouchesCode = (design: QrDesign) =>
  design.frame !== null && design.margin < Math.max(design.size.width, design.size.height) * MIN_FRAMED_MARGIN_RATIO

export function assessScannability (design: QrDesign): ScannabilityIssue[] {
  const frameIssues: ScannabilityIssue[] = frameTouchesCode(design) ? ['frame-touches-code'] : []
  if (design.background.transparent) return frameIssues

  // Every ink color is checked against every background color, so gradients are judged at their weakest point
  const backgrounds = fillColors(design.background.fill)
  const inks = [design.dots, design.cornersSquare, design.cornersDot].flatMap((style) => fillColors(style.fill))
  const pairs = inks.flatMap((ink) => backgrounds.map((background) => [ink, background] as const))
  const issues: ScannabilityIssue[] = []

  if (pairs.some(([ink, background]) => getContrastRatio(ink, background) < MIN_SCANNABLE_CONTRAST)) {
    issues.push('low-contrast')
  }
  if (pairs.some(([ink, background]) => relativeLuminance(ink) > relativeLuminance(background))) {
    issues.push('inverted')
  }

  return [...issues, ...frameIssues]
}
