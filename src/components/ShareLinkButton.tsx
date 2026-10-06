import { ShareLinkButtonProps } from '../types/ui'
import { textAction } from '../styles/textAction'

const LOGO_EXCLUDED_NOTICE = "Uploaded logos aren't included in links."

function ShareLinkButton ({ onCopy, logoExcluded }: ShareLinkButtonProps) {
  return (
    <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
      <button
        type='button'
        onClick={onCopy}
        aria-describedby={logoExcluded ? 'qr-share-link-notice' : undefined}
        className={`${textAction} text-moss`}
      >
        Copy link
      </button>
      {logoExcluded && (
        <p id='qr-share-link-notice' className='text-xs text-muted'>
          {LOGO_EXCLUDED_NOTICE}
        </p>
      )}
    </div>
  )
}

export default ShareLinkButton
