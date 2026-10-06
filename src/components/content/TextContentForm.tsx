import { ContentFormProps } from '../../types/ui'
import Input from '../Input'

function TextContentForm ({ content, onChange, error }: ContentFormProps<'text'>) {
  return (
    <Input
      id='qr-data'
      label='Link or text'
      placeholder='https://your-site.com'
      value={content.text}
      onChange={(event) => onChange({ ...content, text: event.target.value })}
      error={error}
    />
  )
}

export default TextContentForm
