import Logo from '../../assets/logo.svg'

function Footer () {
  return (
    <footer className='w-full max-w-6xl mx-auto px-4 pb-8'>
      <div className='flex items-center gap-4 pt-4 border-t border-ink text-sm'>
        <span className='flex items-center gap-2'>
          <img className='w-5 h-5' src={Logo} alt='' />
          Made by evertcode
        </span>
      </div>
    </footer>
  )
}

export default Footer
