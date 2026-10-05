import { QrLabelProps } from '../types/ui'

function QrLabel ({ content, width, height, children }: QrLabelProps) {
  return (
    <figure className='relative p-3 border border-dashed border-muted'>
      <span aria-hidden='true' className='absolute -top-3 left-4 px-1 bg-paper text-muted'>
        ✂
      </span>
      <div className='bg-white'>
        <div className='flex justify-center p-6'>
          {children}
        </div>
        <figcaption className='flex items-center justify-between gap-4 px-4 py-2 border-t border-rule font-mono text-xs'>
          <span className='min-w-0 truncate' title={content}>
            {content || '—'}
          </span>
          <span className='shrink-0 text-muted'>
            {width} × {height} px
          </span>
        </figcaption>
      </div>
    </figure>
  )
}

export default QrLabel
