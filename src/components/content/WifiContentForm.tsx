import { QrWifiEncryption } from '../../types/design'
import { ContentFormProps, OptionPickerItem } from '../../types/ui'
import Input from '../Input'
import OptionPicker from '../OptionPicker'
import CheckboxField from '../CheckboxField'

const ENCRYPTION_OPTIONS: readonly OptionPickerItem<QrWifiEncryption>[] = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None' }
]

function WifiContentForm ({ content, onChange, error }: ContentFormProps<'wifi'>) {
  return (
    <div className='space-y-4'>
      <Input
        id='qr-wifi-ssid'
        label='Network name'
        placeholder='Home'
        value={content.ssid}
        onChange={(event) => onChange({ ...content, ssid: event.target.value })}
        error={error}
      />
      <OptionPicker
        id='qr-wifi-encryption'
        label='Security'
        value={content.encryption}
        options={ENCRYPTION_OPTIONS}
        onChange={(encryption) => onChange({ ...content, encryption })}
      />
      {content.encryption !== 'nopass' && (
        <Input
          id='qr-wifi-password'
          label='Password'
          placeholder='Network password'
          value={content.password}
          onChange={(event) => onChange({ ...content, password: event.target.value })}
        />
      )}
      <CheckboxField
        id='qr-wifi-hidden'
        label='Hidden network'
        checked={content.hidden}
        onChange={(hidden) => onChange({ ...content, hidden })}
      />
    </div>
  )
}

export default WifiContentForm
