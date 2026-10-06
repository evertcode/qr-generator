import { ContentFormProps } from '../../types/ui'
import Input from '../Input'

function EmailContentForm ({ content, onChange, error }: ContentFormProps<'email'>) {
  return (
    <div className='space-y-4'>
      <Input
        id='qr-email-to'
        type='email'
        label='To'
        placeholder='hello@your-site.com'
        value={content.to}
        onChange={(event) => onChange({ ...content, to: event.target.value })}
        error={error}
      />
      <Input
        id='qr-email-subject'
        label='Subject'
        placeholder='Hi there'
        value={content.subject}
        onChange={(event) => onChange({ ...content, subject: event.target.value })}
      />
      <Input
        id='qr-email-body'
        label='Message'
        placeholder='Write your message'
        value={content.body}
        onChange={(event) => onChange({ ...content, body: event.target.value })}
      />
    </div>
  )
}

export default EmailContentForm
