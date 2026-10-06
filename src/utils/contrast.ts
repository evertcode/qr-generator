import { QrDesign, ScannabilityIssue } from '../types/design'
import { normalizeHexColor } from './hexColor'

// Scanners need clearly darker dots than background; 4:1 leaves room for print and screen glare
const MIN_SCANNABLE_CONTRAST = 4

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

export function assessScannability (design: QrDesign): ScannabilityIssue[] {
  if (design.background.transparent) return []

  const background = design.background.fill.color
  const backgroundLuminance = relativeLuminance(background)
  const inks = [design.dots, design.cornersSquare, design.cornersDot].map((style) => style.fill.color)
  const issues: ScannabilityIssue[] = []

  if (inks.some((ink) => getContrastRatio(ink, background) < MIN_SCANNABLE_CONTRAST)) {
    issues.push('low-contrast')
  }
  if (inks.some((ink) => relativeLuminance(ink) > backgroundLuminance)) {
    issues.push('inverted')
  }

  return issues
}
