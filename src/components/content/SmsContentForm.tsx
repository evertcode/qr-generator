import { ContentFormProps } from '../../types/ui'
import Input from '../Input'

function SmsContentForm ({ content, onChange, error }: ContentFormProps<'sms'>) {
  return (
    <div className='space-y-4'>
      <Input
        id='qr-sms-number'
        type='tel'
        label='Phone number'
        placeholder='+34 600 000 000'
        value={content.number}
        onChange={(event) => onChange({ ...content, number: event.target.value })}
        error={error}
      />
      <Input
        id='qr-sms-message'
        label='Message'
        placeholder='Write your message'
        value={content.message}
        onChange={(event) => onChange({ ...content, message: event.target.value })}
      />
    </div>
  )
}

export default SmsContentForm
