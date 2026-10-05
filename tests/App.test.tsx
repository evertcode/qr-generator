import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import { LOGO_MAX_BYTES } from '../src/utils/validateLogoFile'

// jsdom has no canvas, so the QR library is replaced with a no-op double
vi.mock('qr-code-styling', () => ({
  default: class {
    append = vi.fn()
    update = vi.fn()
    download = vi.fn()
  }
}))

const logoInput = () => document.querySelector<HTMLInputElement>('#qr-logo')!

// The file input filters by `accept`, so rejected types must bypass it to reach the app
const setupUser = () => userEvent.setup({ applyAccept: false })

class FailingFileReader {
  result = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  readAsDataURL () {
    setTimeout(() => this.onerror?.())
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('replaces the logo with a valid upload', async () => {
    const user = setupUser()
    render(<App />)

    await user.upload(logoInput(), new File(['<svg/>'], 'brand.svg', { type: 'image/svg+xml' }))

    expect(await screen.findByText('brand.svg')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error and keeps the previous logo when uploading an unsupported file type', async () => {
    const user = setupUser()
    render(<App />)

    await user.upload(logoInput(), new File(['gif'], 'anim.gif', { type: 'image/gif' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Use a PNG, JPEG, SVG or WebP image.')
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
  })

  it('shows an error and keeps the previous logo when uploading a file over 1 MB', async () => {
    const user = setupUser()
    render(<App />)

    await user.upload(logoInput(), new File([new Uint8Array(LOGO_MAX_BYTES + 1)], 'huge.png', { type: 'image/png' }))

    expect(screen.getByRole('alert')).toHaveTextContent('That image is over 1 MB. Try a smaller one.')
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
  })

  it('shows an error when the file cannot be read', async () => {
    vi.stubGlobal('FileReader', FailingFileReader)
    const user = setupUser()
    render(<App />)

    await user.upload(logoInput(), new File(['png'], 'broken.png', { type: 'image/png' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't read that file. Try another one.")
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
  })
})
