import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import { LOGO_MAX_BYTES } from '../src/utils/validateLogoFile'
import { DESIGN_STORAGE_KEY, serializeQrDesign } from '../src/design/persistence'
import { DEFAULT_QR_DESIGN } from '../src/design/defaultDesign'
import { encodeDesignToHash } from '../src/design/shareLink'

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
  window.history.replaceState(null, '', '/')
  vi.unstubAllGlobals()
  qrDouble.update.mockClear()
})

const TOO_LONG_FOR_Q = 'x'.repeat(1664)

describe('App', () => {
  it('renders with the default text and logo', () => {
    render(<App />)

    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('https://github.com/evertcode')
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
  })

  it('updates the QR label when typing in the text field', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByRole('textbox', { name: 'Link or text' })
    await user.clear(field)
    await user.type(field, 'hello qr')

    expect(screen.getByRole('figure')).toHaveTextContent('hello qr')
  })

  it('disables the download button when the text is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.clear(screen.getByRole('textbox', { name: 'Link or text' }))

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

    const field = screen.getByRole('textbox', { name: 'Link or text' })
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

    const field = screen.getByRole('textbox', { name: 'Link or text' })
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

  it('resets the design to the defaults', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByRole('textbox', { name: 'Link or text' })
    await user.clear(field)
    await user.type(field, 'edited')
    await user.click(screen.getByRole('radio', { name: 'H' }))
    await user.click(screen.getByRole('button', { name: 'remove' }))

    await user.click(screen.getByRole('button', { name: 'Reset design' }))

    // The content editor remounts on reset to clear its per-tab drafts
    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('https://github.com/evertcode')
    expect(screen.getByRole('radio', { name: 'Q' })).toBeChecked()
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
    expect(screen.getByText('Design reset')).toHaveAttribute('role', 'status')
  })

  it('changes the dot shape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const dots = screen.getByRole('group', { name: 'Dots' })

    expect(within(dots).getByRole('radio', { name: 'Rounded' })).toBeChecked()

    await user.click(within(dots).getByRole('radio', { name: 'Classy' }))

    expect(within(dots).getByRole('radio', { name: 'Classy' })).toBeChecked()
    await waitFor(() => {
      expect(qrDouble.update).toHaveBeenLastCalledWith(expect.objectContaining({
        dotsOptions: expect.objectContaining({ type: 'classy' })
      }))
    })
  })

  it('disables JPEG with a transparent background', async () => {
    const user = userEvent.setup()
    render(<App />)
    const formats = screen.getByRole('group', { name: 'File format' })

    await user.click(within(formats).getByRole('radio', { name: 'jpeg' }))
    await user.click(screen.getByRole('checkbox', { name: 'Transparent background' }))

    expect(within(formats).getByRole('radio', { name: 'jpeg' })).toBeDisabled()
    expect(within(formats).getByRole('radio', { name: 'png' })).toBeChecked()
    expect(formats).toHaveAccessibleDescription("JPEG can't be transparent. Pick PNG, WebP or SVG.")
    expect(screen.queryByLabelText('Background color')).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Transparent background' }))

    expect(within(formats).getByRole('radio', { name: 'jpeg' })).toBeEnabled()
    expect(screen.getByLabelText('Background color')).toBeInTheDocument()
  })

  it('changes the margin', async () => {
    const user = userEvent.setup()
    render(<App />)

    const margin = screen.getByLabelText('Margin')
    await user.clear(margin)
    await user.type(margin, '16')

    expect(margin).toHaveAccessibleDescription('Leave some margin so scanners can find the code.')
    await waitFor(() => {
      expect(qrDouble.update).toHaveBeenLastCalledWith(expect.objectContaining({ margin: 16 }))
    })
  })

  it('warns about low contrast', async () => {
    const user = userEvent.setup()
    render(<App />)
    const message = 'Low contrast. Some phones may not scan this code.'

    expect(screen.queryByText(message)).not.toBeInTheDocument()

    const dots = screen.getByRole('textbox', { name: 'Dots' })
    await user.clear(dots)
    await user.type(dots, '#cccccc')

    expect(screen.getByText(message).closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
  })

  it('warns about inverted colors', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const [name, color] of [['Dots', '#ffffff'], ['Eye frame', '#ffffff'], ['Eye center', '#ffffff'], ['Background color', '#222222']]) {
      const field = screen.getByRole('textbox', { name })
      await user.clear(field)
      await user.type(field, color)
    }

    expect(screen.getByText(/light dots on a dark background/i)).toBeInTheDocument()
    expect(screen.queryByText(/low contrast/i)).not.toBeInTheDocument()
  })

  it('applies a gradient to the dots', async () => {
    const user = userEvent.setup()
    render(<App />)
    const lastDotsOptions = () => qrDouble.update.mock.lastCall?.[0].dotsOptions

    await user.click(within(screen.getByRole('group', { name: 'Dots fill' })).getByRole('radio', { name: 'Gradient' }))
    const gradient = screen.getByRole('group', { name: 'Dots gradient' })
    const angle = within(gradient).getByRole('spinbutton', { name: 'Angle' })
    await user.clear(angle)
    await user.type(angle, '90')

    await waitFor(() => {
      expect(lastDotsOptions()?.gradient).toEqual({
        type: 'linear',
        rotation: Math.PI / 2,
        colorStops: [{ offset: 0, color: '#222222' }, { offset: 1, color: '#3f6212' }]
      })
    })

    await user.click(within(gradient).getByRole('radio', { name: 'Radial' }))
    expect(within(gradient).queryByRole('spinbutton', { name: 'Angle' })).not.toBeInTheDocument()

    await user.click(within(screen.getByRole('group', { name: 'Dots fill' })).getByRole('radio', { name: 'Solid' }))
    await waitFor(() => {
      expect(lastDotsOptions()).toEqual(expect.objectContaining({ color: '#222222', gradient: undefined }))
    })
  })

  it('changes the logo size', async () => {
    const user = userEvent.setup()
    render(<App />)

    const size = screen.getByRole('spinbutton', { name: 'Logo size' })
    expect(size).toHaveValue(40)

    await user.clear(size)
    await user.type(size, '25')
    await user.click(screen.getByRole('checkbox', { name: 'Hide dots behind the logo' }))

    await waitFor(() => {
      expect(qrDouble.update).toHaveBeenLastCalledWith(expect.objectContaining({
        imageOptions: expect.objectContaining({ imageSize: 0.25, hideBackgroundDots: false })
      }))
    })
  })

  it('hides the logo controls without a logo', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'remove' }))

    expect(screen.queryByRole('spinbutton', { name: 'Logo size' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Logo margin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Hide dots behind the logo' })).not.toBeInTheDocument()
  })

  it('builds a WiFi code', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'WiFi' }))
    await user.type(screen.getByRole('textbox', { name: 'Network name' }), 'Home')
    await user.type(screen.getByRole('textbox', { name: 'Password' }), 'secret')

    expect(screen.getByRole('figure')).toHaveTextContent('WiFi · Home')
    await waitFor(() => {
      expect(qrDouble.update).toHaveBeenLastCalledWith(expect.objectContaining({ data: 'WIFI:T:WPA;S:Home;P:secret;;' }))
    })
  })

  it('shows a required field error and disables saving', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'WiFi' }))

    expect(screen.getByText('Add a network name.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save as/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy image' })).toBeDisabled()
  })

  it('keeps the text when switching tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByRole('textbox', { name: 'Link or text' })
    await user.clear(field)
    await user.type(field, 'kept')
    await user.click(screen.getByRole('tab', { name: 'Email' }))
    await user.type(screen.getByRole('textbox', { name: 'To' }), 'hi@site.com')
    await user.click(screen.getByRole('tab', { name: 'Link or text' }))

    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('kept')

    await user.click(screen.getByRole('tab', { name: 'Email' }))
    expect(screen.getByRole('textbox', { name: 'To' })).toHaveValue('hi@site.com')
  })

  it('moves between content tabs with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<App />)

    screen.getByRole('tab', { name: 'Link or text' }).focus()
    await user.keyboard('{ArrowRight}')

    const wifi = screen.getByRole('tab', { name: 'WiFi' })
    expect(wifi).toHaveAttribute('aria-selected', 'true')
    expect(wifi).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'WiFi' })).toBeInTheDocument()
  })

  it('applies a preset and keeps the content', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByRole('textbox', { name: 'Link or text' })
    await user.clear(field)
    await user.type(field, 'my link')
    await user.click(screen.getByRole('button', { name: 'Dotted' }))

    expect(field).toHaveValue('my link')
    expect(within(screen.getByRole('group', { name: 'Dots' })).getByRole('radio', { name: 'Dots' })).toBeChecked()
    expect(screen.getByText('evertcode mascot')).toBeInTheDocument()
    await waitFor(() => {
      expect(qrDouble.update).toHaveBeenLastCalledWith(expect.objectContaining({
        data: 'my link',
        margin: 16,
        dotsOptions: expect.objectContaining({ type: 'dots', color: '#1e293b' })
      }))
    })
  })

  it('restores the saved design', () => {
    const saved = { ...DEFAULT_QR_DESIGN, content: { type: 'text' as const, text: 'saved link' }, margin: 8 }
    localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify({ version: 1, design: serializeQrDesign(saved) }))

    render(<App />)

    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('saved link')
    expect(screen.getByRole('spinbutton', { name: 'Margin' })).toHaveValue(8)
    expect(screen.getByText('Restored your last design.')).toHaveAttribute('role', 'status')
  })

  it('saves edits and clears the saved design on reset', async () => {
    const user = userEvent.setup()
    render(<App />)

    const field = screen.getByRole('textbox', { name: 'Link or text' })
    await user.clear(field)
    await user.type(field, 'keep me')

    await waitFor(() => {
      expect(localStorage.getItem(DESIGN_STORAGE_KEY)).toContain('keep me')
    })

    await user.click(screen.getByRole('button', { name: 'Reset design' }))

    expect(localStorage.getItem(DESIGN_STORAGE_KEY)).toBeNull()
  })

  it('loads a design from the link and clears the hash', () => {
    const linked = { ...DEFAULT_QR_DESIGN, content: { type: 'phone' as const, number: '+34 600 000 000' } }
    window.history.replaceState(null, '', `/#${encodeDesignToHash(linked)}`)

    render(<App />)

    expect(screen.getByRole('tab', { name: 'Phone' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue('+34 600 000 000')
    expect(screen.getByText('Loaded the design from the link.')).toHaveAttribute('role', 'status')
    expect(window.location.hash).toBe('')
  })

  it('shows an error and the default design for an invalid link', () => {
    window.history.replaceState(null, '', '/#design=broken')

    render(<App />)

    expect(screen.getByText('This link has an invalid design. Showing the default one.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('https://github.com/evertcode')
  })

  it('copies the share link', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    const copied = await navigator.clipboard.readText()
    expect(copied).toMatch(/#design=[A-Za-z0-9_-]+$/)
    expect(screen.getByText('Link copied')).toHaveAttribute('role', 'status')
  })

  it('warns that uploaded logos are left out of links', async () => {
    const user = setupUser()
    render(<App />)

    expect(screen.getByRole('button', { name: 'Copy link' })).not.toHaveAccessibleDescription()

    await user.upload(logoInput(), new File(['<svg/>'], 'brand.svg', { type: 'image/svg+xml' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAccessibleDescription("Uploaded logos aren't included in links.")
    })
  })

  it('loads a link pasted into the open app', async () => {
    render(<App />)
    const linked = { ...DEFAULT_QR_DESIGN, content: { type: 'text' as const, text: 'pasted link' } }

    window.history.replaceState(null, '', `/#${encodeDesignToHash(linked)}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    expect(await screen.findByText('Loaded the design from the link.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Link or text' })).toHaveValue('pasted link')
    expect(window.location.hash).toBe('')
  })
})
