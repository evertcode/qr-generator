import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FramedPreview from '../../src/components/FramedPreview'
import { QrFrame } from '../../src/types/design'

const frame: QrFrame = { text: 'Scan me', color: '#222222', textColor: '#ffffff' }

const preview = (value: QrFrame | null) => (
  <FramedPreview frame={value} width={300} height={300}>
    <div data-testid='qr-container' />
  </FramedPreview>
)

describe('FramedPreview', () => {
  it('keeps the same QR container node when the frame is toggled', () => {
    // The QR library draws into this node outside React, so React must not replace or reuse it
    const { rerender } = render(preview(null))
    const container = screen.getByTestId('qr-container')

    rerender(preview(frame))
    expect(screen.getByTestId('qr-container')).toBe(container)
    expect(screen.getByTestId('qr-frame')).toHaveTextContent('Scan me')

    rerender(preview(null))
    expect(screen.getByTestId('qr-container')).toBe(container)
  })

  it('renders no frame styles or text without a frame', () => {
    render(preview(null))

    expect(screen.getByTestId('qr-frame')).toHaveAttribute('data-framed', 'false')
    expect(screen.getByTestId('qr-frame')).not.toHaveAttribute('style')
    expect(screen.getByTestId('qr-frame')).toHaveTextContent('')
  })
})
