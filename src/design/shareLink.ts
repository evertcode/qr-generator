import { QrDesign, QrLogo } from '../types/design'
import { DEFAULT_QR_DESIGN } from './defaultDesign'
import { parseQrDesign, serializeQrDesign } from './persistence'

const HASH_PARAM = 'design'
const LINK_VERSION = 1

export const isUploadedLogo = (logo: QrLogo | null): boolean =>
  logo !== null && logo.src !== DEFAULT_QR_DESIGN.logo?.src

const toBase64Url = (text: string): string => {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64Url = (encoded: string): string => {
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

const designParam = (hash: string): string | null =>
  new URLSearchParams(hash.replace(/^#/, '')).get(HASH_PARAM)

export const hasSharedDesign = (hash: string): boolean => designParam(hash) !== null

// Uploaded logos would make the link huge, so they are left out; the bundled logo travels as a marker
export function encodeDesignToHash (design: QrDesign): string {
  const shareable = isUploadedLogo(design.logo) ? { ...design, logo: null } : design
  const payload = JSON.stringify({ version: LINK_VERSION, design: serializeQrDesign(shareable) })
  return `${HASH_PARAM}=${toBase64Url(payload)}`
}

export function decodeDesignFromHash (hash: string): QrDesign | null {
  const encoded = designParam(hash)
  if (!encoded) return null

  try {
    const shared: unknown = JSON.parse(fromBase64Url(encoded))
    if (typeof shared !== 'object' || shared === null || !('version' in shared) || shared.version !== LINK_VERSION) return null
    return parseQrDesign((shared as { design?: unknown }).design)
  } catch {
    return null
  }
}
