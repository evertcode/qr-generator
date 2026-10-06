import { SizeFieldProps } from '../types/ui'
import RangeField from './RangeField'

function SizeField (props: SizeFieldProps) {
  return <RangeField {...props} step={10} unit='px' />
}

export default SizeField
