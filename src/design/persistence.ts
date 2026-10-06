import { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from 'qr-code-styling'
import {
  QrBackground,
  QrContent,
  QrDesign,
  QrFill,
  QrLogo,
  QrShapeStyle,
  QrWifiEncryption,
  SaveDesignResult
} from '../types/design'
import { normalizeHexColor } from '../utils/hexColor'
import { DEFAULT_QR_DESIGN } from './defaultDesign'
import {
  LOGO_MARGIN_MAX,
  LOGO_NAME_MAX_LENGTH,
  LOGO_SIZE_MAX,
  LOGO_SIZE_MIN,
  MARGIN_MAX,
  ROTATION_MAX,
  SIZE_MAX,
  SIZE_MIN
} from './limits'

export const DESIGN_STORAGE_KEY = 'qr-design:v1'
const STORAGE_VERSION = 1

// The bundled logo URL changes between builds, so it is stored as a marker instead
const DEFAULT_LOGO_MARKER = 'default'
const UPLOADED_LOGO = /^data:image\/(png|jpeg|svg\+xml|webp);base64,[A-Za-z0-9+/=]+$/

const DOT_TYPES: readonly DotType[] = ['dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded']
const CORNER_SQUARE_TYPES: readonly CornerSquareType[] = ['dot', 'square', 'extra-rounded']
const CORNER_DOT_TYPES: readonly CornerDotType[] = ['dot', 'square']
const ERROR_CORRECTION_LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']
const WIFI_ENCRYPTIONS: readonly QrWifiEncryption[] = ['WPA', 'WEP', 'nopass']

// Thrown inside the parser and turned into `null` at its boundary
class InvalidDesign extends Error {}

type Fields = Record<string, unknown>

const fields = (value: unknown): Fields => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new InvalidDesign()
  return value as Fields
}

const string = (value: unknown): string => {
  if (typeof value !== 'string') throw new InvalidDesign()
  return value
}

const boolean = (value: unknown): boolean => {
  if (typeof value !== 'boolean') throw new InvalidDesign()
  return value
}

const numberIn = (value: unknown, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new InvalidDesign()
  return value
}

const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T => {
  if (!allowed.includes(value as T)) throw new InvalidDesign()
  return value as T
}

const color = (value: unknown): string => {
  const normalized = normalizeHexColor(string(value))
  if (!normalized) throw new InvalidDesign()
  return normalized
}

const parseFill = (value: unknown): QrFill => {
  const fill = fields(value)
  if (fill.kind === 'solid') return { kind: 'solid', color: color(fill.color) }

  if (fill.kind === 'gradient') {
    const colors = fill.colors
    if (!Array.isArray(colors) || colors.length !== 2) throw new InvalidDesign()
    return {
      kind: 'gradient',
      gradientType: oneOf(fill.gradientType, ['linear', 'radial'] as const),
      rotation: numberIn(fill.rotation, 0, ROTATION_MAX),
      colors: [color(colors[0]), color(colors[1])]
    }
  }

  throw new InvalidDesign()
}

const parseShape = <T extends string>(value: unknown, types: readonly T[]): QrShapeStyle<T> => {
  const style = fields(value)
  return { type: oneOf(style.type, types), fill: parseFill(style.fill) }
}

const parseContent = (value: unknown): QrContent => {
  const content = fields(value)

  switch (content.type) {
    case 'text':
      return { type: 'text', text: string(content.text) }
    case 'wifi':
      return {
        type: 'wifi',
        ssid: string(content.ssid),
        password: string(content.password),
        encryption: oneOf(content.encryption, WIFI_ENCRYPTIONS),
        hidden: boolean(content.hidden)
      }
    case 'email':
      return { type: 'email', to: string(content.to), subject: string(content.subject), body: string(content.body) }
    case 'phone':
      return { type: 'phone', number: string(content.number) }
    case 'sms':
      return { type: 'sms', number: string(content.number), message: string(content.message) }
    case 'vcard':
      return {
        type: 'vcard',
        firstName: string(content.firstName),
        lastName: string(content.lastName),
        phone: string(content.phone),
        email: string(content.email),
        organization: string(content.organization),
        url: string(content.url)
      }
    default:
      throw new InvalidDesign()
  }
}

const parseLogoSource = (value: unknown): string => {
  const src = string(value)
  if (src === DEFAULT_LOGO_MARKER) return DEFAULT_QR_DESIGN.logo!.src
  // Only images uploaded as data URLs are accepted, never remote URLs
  if (!UPLOADED_LOGO.test(src)) throw new InvalidDesign()
  return src
}

const parseLogo = (value: unknown): QrLogo | null => {
  if (value === null) return null
  const logo = fields(value)
  const name = string(logo.name)
  if (name.length > LOGO_NAME_MAX_LENGTH) throw new InvalidDesign()

  return {
    src: parseLogoSource(logo.src),
    name,
    size: numberIn(logo.size, LOGO_SIZE_MIN, LOGO_SIZE_MAX),
    margin: numberIn(logo.margin, 0, LOGO_MARGIN_MAX),
    hideBackgroundDots: boolean(logo.hideBackgroundDots)
  }
}

const parseBackground = (value: unknown): QrBackground => {
  const background = fields(value)
  return { transparent: boolean(background.transparent), fill: parseFill(background.fill) }
}

// Builds a fresh design from known fields only, so unknown or extra data never reaches the app
export function parseQrDesign (value: unknown): QrDesign | null {
  try {
    const design = fields(value)
    const size = fields(design.size)

    return {
      content: parseContent(design.content),
      size: { width: numberIn(size.width, SIZE_MIN, SIZE_MAX), height: numberIn(size.height, SIZE_MIN, SIZE_MAX) },
      errorCorrectionLevel: oneOf(design.errorCorrectionLevel, ERROR_CORRECTION_LEVELS),
      dots: parseShape(design.dots, DOT_TYPES),
      cornersSquare: parseShape(design.cornersSquare, CORNER_SQUARE_TYPES),
      cornersDot: parseShape(design.cornersDot, CORNER_DOT_TYPES),
      background: parseBackground(design.background),
      margin: numberIn(design.margin, 0, MARGIN_MAX),
      logo: parseLogo(design.logo)
    }
  } catch (error) {
    if (error instanceof InvalidDesign) return null
    throw error
  }
}

// The serializable form of a design: the bundled logo becomes a marker
export function serializeQrDesign (design: QrDesign): QrDesign {
  if (design.logo?.src !== DEFAULT_QR_DESIGN.logo?.src) return design
  return { ...design, logo: { ...design.logo!, src: DEFAULT_LOGO_MARKER } }
}

const write = (storage: Storage, design: QrDesign) => {
  storage.setItem(DESIGN_STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, design: serializeQrDesign(design) }))
}

export function saveDesign (storage: Storage, design: QrDesign): SaveDesignResult {
  try {
    write(storage, design)
    return 'saved'
  } catch {
    // Uploaded logos are the only large field; retry without one before giving up
    if (!design.logo) return 'failed'
    try {
      write(storage, { ...design, logo: null })
      return 'saved-without-logo'
    } catch {
      return 'failed'
    }
  }
}

export function loadSavedDesign (storage: Storage): QrDesign | null {
  try {
    const raw = storage.getItem(DESIGN_STORAGE_KEY)
    if (raw === null) return null
    const stored = fields(JSON.parse(raw))
    return stored.version === STORAGE_VERSION ? parseQrDesign(stored.design) : null
  } catch {
    return null
  }
}

export function clearSavedDesign (storage: Storage): void {
  try {
    storage.removeItem(DESIGN_STORAGE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable
  }
}

// `localStorage` itself throws when the browser blocks site data
export function getDesignStorage (): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
