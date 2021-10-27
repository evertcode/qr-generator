import QRCodeStyling from 'qr-code-styling'
import { useRef, useState, useEffect } from 'react'

import Logo from '../assets/logo.svg'

import './App.css'

function App () {
  const [options, setOptions] = useState({
    width: 300,
    height: 300,
    type: 'svg',
    data: 'https://github.com/evertcode',
    image:
      'data:image/svg+xml;base64,PHN2ZyBpZD0ic3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDI4LjQiIHdpZHRoPSIyMzM0IiBoZWlnaHQ9IjI1MDAiPgogIDxzdHlsZT4uc3Qwe2ZpbGw6I2ZmZn0uc3Qxe2ZpbGw6Izg0Y2MxNn0uc3Qye2ZpbGw6IzNmNjIxMn08L3N0eWxlPgogIDxnIGlkPSJzdmdnIj4KICAgIDxwYXRoIGlkPSJwYXRoMCIgZD0iTTMxNC44IDI4LjJjLS4zLjUtLjMgMzQyLjkgMCAzNDMuNC4yLjQuNi40IDE0LjUuNGgxNC4zVjI1Ny44bDE0LjMtLjEgMTQuMy0uMS4xLTE0LjMuMS0xNC4zSDQwMFYxMTMuNGgtMjkuMnYxMTQuMmgtMjcuMnYtMjAwaC0xNC4zYy0xMy45LjItMTQuMy4yLTE0LjUuNk04Ni4yIDE1Ny4xdjQyLjNoMjcuNnYtODQuNkg4Ni4ydjQyLjNtMTE0LjMtNDJjLS4xLjEtLjEgMTkuMSAwIDQyLjNsLjEgNDIgMTMuOC4xIDEzLjguMVYxMTVoLTEzLjdjLTExLS4yLTEzLjktLjEtMTQgLjFtLTE3MiAyODVsLS43LjN2MjhIMTE1di0yOGwtLjctLjNjLTEtLjUtODQuOS0uNC04NS44IDBtMTcxLjMuMWwtLjYuNHYyNy44aDg3LjJ2LTI4bC0uNy0uM2MtMS4zLS41LTg1LS40LTg1LjkuMSIgLz4KICAgIDxwYXRoIGlkPSJwYXRoMSIgY2xhc3M9InN0MCIgZD0iTTI4LjkgODYuMWMtLjQuMS0uNCAxNDEuNyAwIDE0MiAuNC40IDI1Ni4yLjMgMjU2LjYtLjEuNC0uNC41LTE0MS40LjEtMTQxLjgtLjMtLjItMjU2LjItLjMtMjU2LjctLjFtODUuMyAyOGwuNC4zdjQyLjdjMCAzOS40IDAgNDIuNy0uMyA0Mi45LS4zLjItMi43LjMtMTQuMy4zcy0xNCAwLTE0LjMtLjNjLS4zLS4zLS4zLTMuNS0uMy00Mi45di00Mi43bC40LS4zYy40LS4zIDIuMS0uMyAxNC4yLS4zczEzLjggMCAxNC4yLjNtMTE0LjQuMWMuMi4yLjMgOC4yLjMgNDIuOGwuMSA0Mi41LS41LjUtLjUuNWgtMTMuNmMtMTMuNyAwLTE0LjIgMC0xNC42LS43LS40LS42LS4yLTg1LjEuMy04NS41LjQtLjYgMjgtLjYgMjguNS0uMU04NiAyODUuOGMtLjUuNS0uMyAyNy45LjEgMjguMi4zLjEgNS4xLjIgMTQuMi4yaDEzLjh2MTMuOWMwIDEzLjYgMCAxMy45LjQgMTQuMy42LjYgODQuNS42IDg1LjEgMCAuMy0uMy4zLTEuNi4zLTE0LjN2LTEzLjloMTRjMTMuMyAwIDE0IDAgMTQuMy0uNC41LS42LjUtMjcuNCAwLTI3LjlzLTI3LjQtLjUtMjcuOSAwYy0uMy4zLS4zIDEuOS0uMyAxNC4zdjE0aC00Mi44Yy0zOC44IDAtNDIuOCAwLTQyLjktLjMtLjEtLjItLjEtNi41LS4xLTE0LjEgMC0xMC40LS4xLTEzLjgtLjItMTQtLjQtLjMtMjcuNi0uMy0yOCAwIiAvPgogICAgPHBhdGggaWQ9InBhdGgyIiBjbGFzcz0ic3QxIiBkPSJNMCAxOTkuNXYxNzEuN2gzMTMuOFYyOC42bC0xNDIuNC0uMWMtMTM1LjMgMC0xNDIuNSAwLTE0My4xLS40LS41LS4zLTEuNS0uNC0xNC40LS40SDB2MTcxLjhtMjg1LjQtMTQyYy4zLjMuNCAxIC40IDEzLjlWODVsLS41LjFjLS4yLjEtNTguMS4xLTEyOC42LjFsLTEyOC0uMS0uMS0xMy43YzAtOS45IDAtMTMuOC4yLTE0IC40LS40IDI1Ni4xLS4zIDI1Ni42LjFtLjIgMjguN2MuNC40LjMgMTQxLjQtLjEgMTQxLjgtLjQuNC0yNTYuMi41LTI1Ni42LjEtLjQtLjQtLjMtMTQxLjkgMC0xNDIgLjUtLjIgMjU2LjQtLjEgMjU2LjcuMU04NS44IDExNC4xbC0uNC4zdjQyLjdjMCAzOS40IDAgNDIuNy4zIDQyLjkuMy4yIDIuNy4zIDE0LjMuM3MxNCAwIDE0LjMtLjNjLjMtLjMuMy0zLjUuMy00Mi45di00Mi43bC0uNC0uM2MtLjQtLjMtMi4xLS4zLTE0LjItLjNzLTEzLjggMC0xNC4yLjNtMTE0LjIuMWMtLjQuNC0uNyA4NC45LS4zIDg1LjUuNC43IDEgLjcgMTQuNi43SDIyOGwuNS0uNS41LS41LS4xLTQyLjVjMC0zNC41LS4xLTQyLjUtLjMtNDIuOC0uNS0uNC0yOC4xLS40LTI4LjYuMW0tODYgLjRjLjMuMy4zIDg0LjYgMCA4NC45LS4zLjMtMjcuNi4zLTI3LjkgMC0uMy0uMy0uMy04NC42IDAtODQuOS4zLS4zIDI3LjUtLjMgMjcuOSAwbTExNC40LjJjLjQuNy4zIDg0LjItLjEgODQuNi0uNS42LTI3LjcuNi0yOC4xIDAtLjMtLjUtLjMtODQuMSAwLTg0LjYuMi0uNC42LS40IDE0LjEtLjRzMTMuOSAwIDE0LjEuNE0xMTQgMjg1LjhjLjIuMi4yIDMuNi4yIDE0IDAgNy42LjEgMTMuOS4xIDE0LjEuMS4zIDQuMS4zIDQyLjkuM0gyMDB2LTE0YzAtMTIuNCAwLTE0IC4zLTE0LjMuNS0uNSAyNy40LS41IDI3LjkgMHMuNiAyNy4zIDAgMjcuOWMtLjMuMy0xIC40LTE0LjMuNGgtMTR2MTMuOWMwIDEyLjcgMCAxNC0uMyAxNC4zLS41LjYtODQuNS42LTg1LjEgMC0uNC0uNC0uNC0uNy0uNC0xNC4zdi0xMy45aC0xMy44Yy05LjEgMC0xMy45LS4xLTE0LjItLjItLjUtLjMtLjYtMjcuNy0uMS0yOC4yLjQtLjMgMjcuNi0uMyAyOCAwIiAvPgogICAgPHBhdGggaWQ9InBhdGgzIiBjbGFzcz0ic3QyIiBkPSJNMjcuOCAxMy45djEzLjlsLjUuNGMuNS4zIDcgLjQgMTQyLjkuNWwxNDIuNC4xdjM0Mi42SDB2MjkuNGgxMy44YzEzLjQgMCAxMy44IDAgMTQuNi0uNCAxLjItLjYgODQuOS0uNiA4Ni4xIDAgMS4yLjYgODQuNC42IDg1LjQgMHM4NC44LS42IDg2LjEgMGMuOC40IDI4LjIuNiAyOC45LjIuMi0uMS4yLTMuMS4xLTE0LjUtLjEtMTguOC0uMS0zNTMuMyAwLTM3MS43VjBIMjcuOHYxMy45bTEgNDMuNmMtLjIuMi0uMiA0LS4yIDEzLjlsLjEgMTMuNyAxMjguMS4xYzcwLjUgMCAxMjguMyAwIDEyOC42LS4xbC41LS4xVjcxLjRjMC0xMi45IDAtMTMuNi0uNC0xMy45LS42LS40LTI1Ni4zLS41LTI1Ni43IDBNODYgMTE0LjZjLS4zLjMtLjMgODQuNiAwIDg0LjkuMy4zIDI3LjYuMyAyNy45IDAgLjMtLjMuMy04NC42IDAtODQuOS0uMy0uMy0yNy41LS4zLTI3LjkgMG0xMTQuMiA4NC44Yy4zLjYgMjcuNS42IDI4LjEgMG0tMTE0LjUtNDIuM3Y0Mi4zSDg2LjJ2LTg0LjZoMjcuNnY0Mi4zIiAvPgogIDwvZz4KPC9zdmc+',
    margin: 0,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'Q'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      color: '#222222',
      type: 'rounded'
    },
    backgroundOptions: {
      color: '#fff'
    },
    cornersSquareOptions: {
      color: '#222222',
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#222222',
      type: 'dot'
    }
  })

  const [fileExtension, setFileExtension] = useState('svg')
  const [qrCode] = useState(new QRCodeStyling(options))
  const ref = useRef(null)

  useEffect(() => {
    ref.current && qrCode.append(ref.current)
  }, [qrCode, ref])

  useEffect(() => {
    if (!qrCode) return
    qrCode.update(options)
  }, [qrCode, options])

  const onDataChange = (event) => {
    setOptions((opts) => ({
      ...opts,
      data: event.target.value
    }))
  }

  const onExtensionChange = (event) => {
    setFileExtension(event.target.value)
  }

  const onChangeImage = (event) => {
    const [file] = event.target.files

    if (file.size > 1024) return

    // eslint-disable-next-line no-undef
    const reader = new FileReader()

    if (file) {
      reader.readAsDataURL(file)

      reader.onload = () => {
        setOptions((opts) => ({
          ...opts,
          image: reader.result || ''
        }))
      }

      reader.onerror = () => {
        setOptions((opts) => ({
          ...opts,
          image: ''
        }))
      }
    } else {
      setOptions((opts) => ({
        ...opts,
        image: ''
      }))
    }
  }

  const onDownload = () => {
    if (!qrCode) return
    qrCode.download({
      extension: fileExtension
    })
  }

  return (
    <>
      <header className='flex justify-center items-center'>
        <h1 className='font-popins text-4xl xl:text-6xl font-bold'>
          QR Code Generator
        </h1>
      </header>
      <main className='flex flex-col justify-center items-center gap-1'>
        <div className='pt-4 xl:pt-10' ref={ref} />

        <div className='flex flex-col pt-4 space-y-2'>
          <input
            placeholder='https://www.google.com/'
            type='text'
            className='py-3 px-4 bg-white rounded-lg placeholder-gray-400 text-gray-900 appearance-none inline-block w-full shadow-md'
            value={options.data}
            onChange={onDataChange}
          />

          <label className='w-64 flex flex-col items-center px-4 py-6 bg-white text-green-500 rounded-lg shadow-lg tracking-wide uppercase border border-green-500 cursor-pointer hover:bg-green-500 hover:text-white'>
            <svg
              className='w-8 h-8'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
            >
              <path d='M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z' />
            </svg>
            <span className='mt-2 text-base leading-normal'>Select a file</span>
            <input type='file' onChange={onChangeImage} className='hidden' />
          </label>

          <div className='relative inline-block w-full text-gray-700'>
            <select
              placeholder='Extension'
              className='w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline'
              onChange={onExtensionChange}
              value={fileExtension}
            >
              <option value='svg'>SVG</option>
              <option value='png'>PNG</option>
              <option value='jpeg'>JPEG</option>
              <option value='webp'>WEBP</option>
            </select>
            <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
              <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20'>
                <path
                  d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  clipRule='evenodd'
                  fillRule='evenodd'
                />
              </svg>
            </div>
          </div>
          <button
            className='bg-green-500 text-white text-base font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200'
            onClick={onDownload}
          >
            Download
          </button>
        </div>
      </main>

      <footer className='text-gray-600 body-font'>
        <div className='container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col'>
          <a className='flex title-font font-medium items-center md:justify-start justify-center text-gray-900'>
            <img className='w-8 h-8' src={Logo} alt='logo' />
            <span className='ml-3 text-xl'>evertcode</span>
          </a>
          <p className='text-sm text-gray-700 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4'>
            © 2021 evertcode —
            <a
              href='https://github.com/evertcode'
              className='text-gray-600 ml-1'
              rel='noopener noreferrer'
              target='_blank'
            >
              @evertcode
            </a>
          </p>
          <span className='inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start'>
            <a className='text-gray-700'>
              <svg
                fill='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='w-5 h-5'
                viewBox='0 0 24 24'
              >
                <path d='M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' />
              </svg>
            </a>
            <a className='ml-3 text-gray-700'>
              <svg
                fill='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='w-5 h-5'
                viewBox='0 0 24 24'
              >
                <path d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' />
              </svg>
            </a>
            <a className='ml-3 text-gray-700'>
              <svg
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='w-5 h-5'
                viewBox='0 0 24 24'
              >
                <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                <path d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01' />
              </svg>
            </a>
            <a className='ml-3 text-gray-700'>
              <svg
                fill='currentColor'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='0'
                className='w-5 h-5'
                viewBox='0 0 24 24'
              >
                <path
                  stroke='none'
                  d='M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'
                />
                <circle cx='4' cy='4' r='2' stroke='none' />
              </svg>
            </a>
          </span>
        </div>
      </footer>
    </>
  )
}

export default App
