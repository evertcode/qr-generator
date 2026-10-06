import { QrContent, QrContentError } from '../types/design'

const isBlank = (value: string) => !value.trim()

export function validateQrContent (content: QrContent): QrContentError | null {
  switch (content.type) {
    case 'text':
      return isBlank(content.text) ? 'empty-text' : null
    case 'wifi':
      return isBlank(content.ssid) ? 'missing-ssid' : null
    case 'email':
      return isBlank(content.to) ? 'missing-email' : null
    case 'phone':
    case 'sms':
      return isBlank(content.number) ? 'missing-phone' : null
    case 'vcard':
      return isBlank(content.firstName) && isBlank(content.lastName) ? 'missing-name' : null
  }
}
