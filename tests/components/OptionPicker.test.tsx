import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OptionPicker from '../../src/components/OptionPicker'
import { OptionPickerItem } from '../../src/types/ui'

type Fruit = 'apple' | 'pear' | 'plum'

const OPTIONS: readonly OptionPickerItem<Fruit>[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'pear', label: 'Pear' },
  { value: 'plum', label: 'Plum' }
]

const renderPicker = (props: Partial<Parameters<typeof OptionPicker<Fruit>>[0]> = {}) => {
  const onChange = vi.fn()
  render(<OptionPicker id='fruit' label='Fruit' value='apple' options={OPTIONS} onChange={onChange} {...props} />)
  return { onChange }
}

describe('OptionPicker', () => {
  it('renders a group of radios named by the label', () => {
    renderPicker()

    const group = screen.getByRole('group', { name: 'Fruit' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks the selected option', () => {
    renderPicker({ value: 'pear' })

    expect(screen.getByRole('radio', { name: 'Pear' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked()
  })

  it('calls onChange with the option value on click', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPicker()

    await user.click(screen.getByRole('radio', { name: 'Plum' }))

    expect(onChange).toHaveBeenCalledWith('plum')
  })

  it('calls onChange with the next option on arrow keys', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPicker()

    screen.getByRole('radio', { name: 'Apple' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(onChange).toHaveBeenCalledWith('pear')
  })

  it('links the hint with aria-describedby', () => {
    renderPicker({ hint: 'Pick one you like.' })

    expect(screen.getByRole('group', { name: 'Fruit' })).toHaveAccessibleDescription('Pick one you like.')
  })

  it('renders option icons next to their labels', () => {
    renderPicker({ options: OPTIONS.map((option) => ({ ...option, icon: <svg data-testid={`icon-${option.value}`} /> })) })

    expect(screen.getByRole('radio', { name: 'Pear' }).nextElementSibling).toContainElement(screen.getByTestId('icon-pear'))
  })
})
