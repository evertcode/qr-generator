import { FramedPreviewProps } from '../types/ui'
import { FRAME_FONT_FAMILY, FRAME_FONT_WEIGHT, frameLayout } from '../design/frameLayout'

// Draws the same frame as the exports around the live preview, from the same layout.
// The wrapper is always rendered: the QR library draws into the child node, so that node must never
// move or be reused by React when the frame is toggled.
function FramedPreview ({ frame, width, height, children }: FramedPreviewProps) {
  const layout = frame && frameLayout(width, height)

  return (
    <div
      data-testid='qr-frame'
      data-framed={frame !== null}
      className='inline-flex max-w-full flex-col items-center'
      style={frame && layout ? { background: frame.color, padding: `${layout.border}px ${layout.border}px 0` } : undefined}
    >
      {children}
      {frame && layout && (
        <div
          className='flex w-full items-center justify-center text-center leading-none'
          style={{
            height: layout.band,
            color: frame.textColor,
            fontFamily: FRAME_FONT_FAMILY,
            fontWeight: FRAME_FONT_WEIGHT,
            fontSize: layout.fontSize
          }}
        >
          {frame.text}
        </div>
      )}
    </div>
  )
}

export default FramedPreview
