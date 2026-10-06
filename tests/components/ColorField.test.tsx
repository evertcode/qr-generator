import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorField from '../../src/components/ColorField'

function ControlledColorField ({ initial }: { initial: string }) {
  const [color, setColor] = useState(initial)
  return <ColorField id='ink' label='Ink' color={color} onChange={setColor} />
}

describe('ColorField', () => {
  it('lets users type a full hex that starts with a valid short hex', async () => {
    const user = userEvent.setup()
    render(<ControlledColorField initial='#222222' />)
    const field = screen.getByRole('textbox', { name: 'Ink' })

    await user.clear(field)
    await user.type(field, '#3f6212')

    expect(field).toHaveValue('#3f6212')
    expect(screen.getByLabelText('Ink swatch')).toHaveValue('#3f6212')
  })

  it('shows external color changes', () => {
    const { rerender } = render(<ColorField id='ink' label='Ink' color='#222222' onChange={() => {}} />)

    rerender(<ColorField id='ink' label='Ink' color='#84cc16' onChange={() => {}} />)

    expect(screen.getByRole('textbox', { name: 'Ink' })).toHaveValue('#84cc16')
  })
})
