import { InputType, ContentFormProps } from '../../types/ui'
import { QrContentOf } from '../../types/design'
import Input from '../Input'

type VcardField = Exclude<keyof QrContentOf<'vcard'>, 'type'>

const FIELDS: readonly { field: VcardField; label: string; placeholder: string; type?: InputType }[] = [
  { field: 'firstName', label: 'First name', placeholder: 'Ada' },
  { field: 'lastName', label: 'Last name', placeholder: 'Lovelace' },
  { field: 'phone', label: 'Phone', placeholder: '+34 600 000 000', type: 'tel' },
  { field: 'email', label: 'Email', placeholder: 'ada@your-site.com', type: 'email' },
  { field: 'organization', label: 'Company', placeholder: 'Analytical Engines' },
  { field: 'url', label: 'Website', placeholder: 'https://your-site.com', type: 'url' }
]

function VcardContentForm ({ content, onChange, error }: ContentFormProps<'vcard'>) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {FIELDS.map(({ field, label, placeholder, type }) => (
        <Input
          key={field}
          id={`qr-vcard-${field}`}
          type={type}
          label={label}
          placeholder={placeholder}
          value={content[field]}
          onChange={(event) => onChange({ ...content, [field]: event.target.value })}
          error={field === 'firstName' ? error : undefined}
        />
      ))}
    </div>
  )
}

export default VcardContentForm
