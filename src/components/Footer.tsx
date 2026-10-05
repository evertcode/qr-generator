import Logo from '../../assets/logo.svg'
import { focusRing } from '../styles/focusRing'

function Footer () {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='text-gray-800 body-font'>
      <div className='container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col'>
        <div className='flex title-font font-medium items-center md:justify-start justify-center text-gray-900'>
          <img className='w-8 h-8' src={Logo} alt='' />
          <span className='ml-3 text-xl'>evertcode</span>
        </div>
        <p className='text-sm sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4'>
          © {currentYear} evertcode —
          <a
            href='https://github.com/evertcode'
            className={`ml-1 rounded underline hover:text-gray-900 ${focusRing}`}
            rel='noopener noreferrer'
            target='_blank'
          >
            @evertcode
          </a>
        </p>
        <span className='inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start'>
          <a
            href='https://github.com/evertcode'
            aria-label='evertcode on GitHub'
            className={`rounded hover:text-gray-900 ${focusRing}`}
            rel='noopener noreferrer'
            target='_blank'
          >
            <svg
              fill='currentColor'
              className='w-6 h-6'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path d='M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z' />
            </svg>
          </a>
        </span>
      </div>
    </footer>
  )
}

export default Footer
