import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'

// jsdom has no canvas, so the QR library is replaced with a no-op double
vi.mock('qr-code-styling', () => ({
  default: class {
    append = vi.fn()
    update = vi.fn()
    download = vi.fn()
  }
}))

describe('App', () => {
  it('renders with the default text and logo', () => {
    render(<App />)

    expect(screen.getByLabelText('Link or text')).toHaveValue('https://github.com/evertcode')
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
  })

  it('updates the QR label when typing in the text field', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByLabelText('Link or text')
    await user.clear(field)
    await user.type(field, 'hello qr')

    expect(screen.getByRole('figure')).toHaveTextContent('hello qr')
  })

  it('disables the download button when the text is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.clear(screen.getByLabelText('Link or text'))

    expect(screen.getByRole('button', { name: /save as/i })).toBeDisabled()
    expect(screen.getByText(/nothing to encode yet/i)).toBeInTheDocument()
  })
})
