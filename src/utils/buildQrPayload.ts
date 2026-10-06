import { QrContent } from '../types/design'

// WiFi fields escape the characters that delimit the format (ZXing "WIFI:" convention)
const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, '\\$1')

// vCard 3.0 (RFC 2426) text values escape backslash, semicolon, comma and newlines
const escapeVcard = (value: string) => value
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n')

const cleanPhone = (value: string) => value.replace(/[\s\-().]/g, '')

const buildEmail = (to: string, subject: string, body: string) => {
  const params = [['subject', subject], ['body', body]]
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  return `mailto:${to.trim()}${params.length ? `?${params.join('&')}` : ''}`
}

const buildVcard = (content: Extract<QrContent, { type: 'vcard' }>) => {
  const firstName = content.firstName.trim()
  const lastName = content.lastName.trim()
  const optional: [string, string][] = [
    ['ORG', content.organization],
    ['TEL', cleanPhone(content.phone)],
    ['EMAIL', content.email],
    ['URL', content.url]
  ]

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVcard(lastName)};${escapeVcard(firstName)};;;`,
    `FN:${escapeVcard([firstName, lastName].filter(Boolean).join(' '))}`,
    ...optional.filter(([, value]) => value.trim()).map(([key, value]) => `${key}:${escapeVcard(value.trim())}`),
    'END:VCARD'
  ].join('\r\n')
}

export function buildQrPayload (content: QrContent): string {
  switch (content.type) {
    case 'text':
      return content.text
    case 'wifi': {
      const password = content.encryption === 'nopass' ? '' : `P:${escapeWifi(content.password)};`
      const hidden = content.hidden ? 'H:true;' : ''
      return `WIFI:T:${content.encryption};S:${escapeWifi(content.ssid)};${password}${hidden};`
    }
    case 'email':
      return buildEmail(content.to, content.subject, content.body)
    case 'phone':
      return `tel:${cleanPhone(content.number)}`
    case 'sms':
      return `SMSTO:${cleanPhone(content.number)}:${content.message}`
    case 'vcard':
      return buildVcard(content)
  }
}

// Short, human caption for the preview label
export function describeQrContent (content: QrContent): string {
  switch (content.type) {
    case 'text':
      return content.text
    case 'wifi':
      return `WiFi · ${content.ssid}`
    case 'email':
      return `Email · ${content.to}`
    case 'phone':
      return `Phone · ${content.number}`
    case 'sms':
      return `SMS · ${content.number}`
    case 'vcard':
      return `Contact · ${[content.firstName, content.lastName].filter(Boolean).join(' ')}`
  }
}
