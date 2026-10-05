import Logo from '../../assets/logo.svg'

function Header () {
  return (
    <header className='w-full max-w-6xl mx-auto px-4 pt-6'>
      <div className='flex items-center gap-2 pb-3 border-b border-ink'>
        <img src={Logo} alt='' className='w-6 h-6' />
        <span className='font-mono text-sm font-medium'>
          evertcode <span className='text-muted'>/</span> qr
        </span>
      </div>
      <h1 className='mt-8 max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-balance'>
        Make a QR that looks like yours.
      </h1>
      <p className='mt-3 text-base sm:text-lg text-muted'>
        No sign-up, no tracking. Nothing leaves your browser.
      </p>
    </header>
  )
}

export default Header
