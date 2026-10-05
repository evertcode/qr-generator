import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import { LOGO_MAX_BYTES } from '../src/utils/validateLogoFile'

const qrDouble = vi.hoisted(() => ({
  update: vi.fn(),
  getRawData: vi.fn(async () => new Blob(['png'], { type: 'image/png' }))
}))

// jsdom has no canvas, so the QR library is replaced with a no-op double
vi.mock('qr-code-styling', () => ({
  default: class {
    append = vi.fn()
    update = qrDouble.update
    getRawData = qrDouble.getRawData
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
  qrDouble.update.mockClear()
})

const TOO_LONG_FOR_Q = 'x'.repeat(1664)

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

  it('selects Q as the default error correction level', () => {
    render(<App />)

    expect(screen.getByRole('radio', { name: 'Q' })).toBeChecked()
  })

  it('shows the capacity error and disables download when the text exceeds the selected level capacity', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByLabelText('Link or text')
    await user.clear(field)
    await user.click(field)
    await user.paste(TOO_LONG_FOR_Q)

    expect(screen.getByText('Too long for a QR code at level Q. Shorten it or pick a lower level.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save as/i })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'M' }))

    expect(screen.queryByText(/too long for a qr code/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save as/i })).toBeEnabled()
  })

  it('never sends text over the capacity to the QR renderer', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByLabelText('Link or text')
    await user.clear(field)
    await user.click(field)
    await user.paste(TOO_LONG_FOR_Q)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const renderedData = qrDouble.update.mock.calls.map(([options]) => options.data)
    expect(renderedData).not.toContain(TOO_LONG_FOR_Q)
  })

  it('shows the logo hint when a logo is set and the level is L or M', async () => {
    const user = userEvent.setup()
    render(<App />)
    const hint = 'Logos cover part of the code. Use Q or H so it still scans.'

    expect(screen.queryByText(hint)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'L' }))
    expect(screen.getByText(hint)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'M' }))
    expect(screen.getByRole('group', { name: 'Error correction' })).toHaveAccessibleDescription(hint)

    await user.click(screen.getByRole('button', { name: 'remove' }))
    expect(screen.queryByText(hint)).not.toBeInTheDocument()
  })

  it('announces the copy result in the live region', async () => {
    const user = userEvent.setup()
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('ClipboardItem', class {})
    // userEvent.setup() installs its own clipboard stub, so it is replaced afterwards
    Object.defineProperty(navigator, 'clipboard', { value: { write }, configurable: true })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Copy image' }))

    expect(await screen.findByText('Copied to clipboard')).toHaveAttribute('role', 'status')
    expect(write).toHaveBeenCalledOnce()
  })

  it('describes the eye color fields with their hints', () => {
    render(<App />)

    expect(screen.getByLabelText('Eye frame')).toHaveAccessibleDescription('The outer square in each corner.')
    expect(screen.getByLabelText('Eye center')).toHaveAccessibleDescription('The dot inside each corner square.')
  })
})
