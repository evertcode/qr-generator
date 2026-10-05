import Logo from '../../assets/logo.svg'
import { focusRing } from '../styles/focusRing'

function Footer () {
  return (
    <footer className='w-full max-w-6xl mx-auto px-4 pb-8'>
      <div className='flex items-center justify-between gap-4 pt-4 border-t border-ink text-sm'>
        <span className='flex items-center gap-2'>
          <img className='w-5 h-5' src={Logo} alt='' />
          Made by evertcode
        </span>
        <a
          href='https://github.com/evertcode'
          className={`rounded-sm font-medium text-moss underline underline-offset-4 decoration-1 hover:decoration-2 ${focusRing}`}
          rel='noopener noreferrer'
          target='_blank'
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

export default Footer
