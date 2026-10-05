function Header() {
  return (
    <header className='flex flex-col justify-center items-center px-4 pt-6 text-center'>
      <h1 className='font-popins text-3xl sm:text-4xl xl:text-6xl font-bold text-gray-900'>
        QR Code Generator
      </h1>
      <p className='mt-2 max-w-xl text-base sm:text-lg text-gray-800'>
        Turn any link or text into a custom QR code. Pick colors, add your logo and download it as SVG, PNG, JPEG or WEBP.
      </p>
    </header>
  )
}

export default Header
