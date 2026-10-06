import { useRef } from 'react'
import { QrContent, QrContentDrafts, QrContentError, QrContentType } from '../types/design'
import { ContentEditorProps } from '../types/ui'
import { EMPTY_CONTENT } from '../design/emptyContent'
import { validateQrContent } from '../utils/validateQrContent'
import ContentTypeTabs, { contentPanelId, contentTabId } from './ContentTypeTabs'
import TextContentForm from './content/TextContentForm'
import WifiContentForm from './content/WifiContentForm'
import EmailContentForm from './content/EmailContentForm'
import PhoneContentForm from './content/PhoneContentForm'
import SmsContentForm from './content/SmsContentForm'
import VcardContentForm from './content/VcardContentForm'

const ID = 'qr-content'

const CONTENT_ERROR_MESSAGES: Record<QrContentError, string> = {
  'empty-text': 'Nothing to encode yet. Paste a link or type something.',
  'missing-ssid': 'Add a network name.',
  'missing-email': 'Add an email address.',
  'missing-phone': 'Add a phone number.',
  'missing-name': 'Add at least a name.'
}

function ContentForm ({ content, onChange, error }: { content: QrContent; onChange: (content: QrContent) => void; error?: string }) {
  switch (content.type) {
    case 'text':
      return <TextContentForm content={content} onChange={onChange} error={error} />
    case 'wifi':
      return <WifiContentForm content={content} onChange={onChange} error={error} />
    case 'email':
      return <EmailContentForm content={content} onChange={onChange} error={error} />
    case 'phone':
      return <PhoneContentForm content={content} onChange={onChange} error={error} />
    case 'sms':
      return <SmsContentForm content={content} onChange={onChange} error={error} />
    case 'vcard':
      return <VcardContentForm content={content} onChange={onChange} error={error} />
  }
}

function ContentEditor ({ content, onChange, capacityError }: ContentEditorProps) {
  // Each tab keeps what was typed in it for the session, so switching back loses nothing
  const drafts = useRef<QrContentDrafts>({ ...EMPTY_CONTENT })
  drafts.current = { ...drafts.current, [content.type]: content }

  const onTypeChange = (type: QrContentType) => {
    if (type !== content.type) onChange(drafts.current[type])
  }

  const contentError = validateQrContent(content)
  const requiredError = contentError ? CONTENT_ERROR_MESSAGES[contentError] : undefined
  // The single text field shows the capacity error itself; the other forms show it below
  const isText = content.type === 'text'

  return (
    <div className='space-y-4'>
      <ContentTypeTabs id={ID} value={content.type} onChange={onTypeChange} />
      <div
        id={contentPanelId(ID)}
        role='tabpanel'
        aria-labelledby={contentTabId(ID, content.type)}
        className='space-y-3'
      >
        <ContentForm content={content} onChange={onChange} error={requiredError ?? (isText ? capacityError : undefined)} />
        {!isText && !requiredError && capacityError && (
          <p className='text-sm text-red-700'>{capacityError}</p>
        )}
      </div>
    </div>
  )
}

export default ContentEditor
