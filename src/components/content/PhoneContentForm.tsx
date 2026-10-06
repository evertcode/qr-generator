import { ContentFormProps } from '../../types/ui'
import Input from '../Input'

function PhoneContentForm ({ content, onChange, error }: ContentFormProps<'phone'>) {
  return (
    <Input
      id='qr-phone-number'
      type='tel'
      label='Phone number'
      placeholder='+34 600 000 000'
      value={content.number}
      onChange={(event) => onChange({ ...content, number: event.target.value })}
      error={error}
    />
  )
}

export default PhoneContentForm
