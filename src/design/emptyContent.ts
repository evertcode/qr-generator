import { QrContentDrafts } from '../types/design'

export const EMPTY_CONTENT: QrContentDrafts = {
  text: { type: 'text', text: '' },
  wifi: { type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false },
  email: { type: 'email', to: '', subject: '', body: '' },
  phone: { type: 'phone', number: '' },
  sms: { type: 'sms', number: '', message: '' },
  vcard: { type: 'vcard', firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' }
}
