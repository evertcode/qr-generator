import { useRef, useState, useEffect, ChangeEvent } from 'react'
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
  Options,
  FileExtension
} from 'qr-code-styling'

import Header from './components/Header'
import Input from './components/Input'
import SizeField from './components/SizeField'
import ColorField from './components/ColorField'
import InputFile from './components/InputFile'
import SelectExtension from './components/SelectExtension'
import Section from './components/Section'
import Footer from './components/Footer'

import './App.css'

function App() {
  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: 'canvas' as DrawType,
    data: 'https://github.com/evertcode',
    image:
      'data:image/svg+xml;base64,PHN2ZyBpZD0ic3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDI4LjQiIHdpZHRoPSIyMzM0IiBoZWlnaHQ9IjI1MDAiPgogIDxzdHlsZT4uc3Qwe2ZpbGw6I2ZmZn0uc3Qxe2ZpbGw6Izg0Y2MxNn0uc3Qye2ZpbGw6IzNmNjIxMn08L3N0eWxlPgogIDxnIGlkPSJzdmdnIj4KICAgIDxwYXRoIGlkPSJwYXRoMCIgZD0iTTMxNC44IDI4LjJjLS4zLjUtLjMgMzQyLjkgMCAzNDMuNC4yLjQuNi40IDE0LjUuNGgxNC4zVjI1Ny44bDE0LjMtLjEgMTQuMy0uMS4xLTE0LjMuMS0xNC4zSDQwMFYxMTMuNGgtMjkuMnYxMTQuMmgtMjcuMnYtMjAwaC0xNC4zYy0xMy45LjItMTQuMy4yLTE0LjUuNk04Ni4yIDE1Ny4xdjQyLjNoMjcuNnYtODQuNkg4Ni4ydjQyLjNtMTE0LjMtNDJjLS4xLjEtLjEgMTkuMSAwIDQyLjNsLjEgNDIgMTMuOC4xIDEzLjguMVYxMTVoLTEzLjdjLTExLS4yLTEzLjktLjEtMTQgLjFtLTE3MiAyODVsLS43LjN2MjhIMTE1di0yOGwtLjctLjNjLTEtLjUtODQuOS0uNC04NS44IDBtMTcxLjMuMWwtLjYuNHYyNy44aDg3LjJ2LTI4bC0uNy0uM2MtMS4zLS41LTg1LS40LTg1LjkuMSIgLz4KICAgIDxwYXRoIGlkPSJwYXRoMSIgY2xhc3M9InN0MCIgZD0iTTI4LjkgODYuMWMtLjQuMS0uNCAxNDEuNyAwIDE0MiAuNC40IDI1Ni4yLjMgMjU2LjYtLjEuNC0uNC41LTE0MS40LjEtMTQxLjgtLjMtLjItMjU2LjItLjMtMjU2LjctLjFtODUuMyAyOGwuNC4zdjQyLjdjMCAzOS40IDAgNDIuNy0uMyA0Mi45LS4zLjItMi43LjMtMTQuMy4zcy0xNCAwLTE0LjMtLjNjLS4zLS4zLS4zLTMuNS0uMy00Mi45di00Mi43bC40LS4zYy40LS4zIDIuMS0uMyAxNC4yLS4zczEzLjggMCAxNC4yLjNtMTE0LjQuMWMuMi4yLjMgOC4yLjMgNDIuOGwuMSA0Mi41LS41LjUtLjUuNWgtMTMuNmMtMTMuNyAwLTE0LjIgMC0xNC42LS43LS40LS42LS4yLTg1LjEuMy04NS41LjQtLjYgMjgtLjYgMjguNS0uMU04NiAyODUuOGMtLjUuNS0uMyAyNy45LjEgMjguMi4zLjEgNS4xLjIgMTQuMi4yaDEzLjh2MTMuOWMwIDEzLjYgMCAxMy45LjQgMTQuMy42LjYgODQuNS42IDg1LjEgMCAuMy0uMy4zLTEuNi4zLTE0LjN2LTEzLjloMTRjMTMuMyAwIDE0IDAgMTQuMy0uNC41LS42LjUtMjcuNCAwLTI3LjlzLTI3LjQtLjUtMjcuOSAwYy0uMy4zLS4zIDEuOS0uMyAxNC4zdjE0aC00Mi44Yy0zOC44IDAtNDIuOCAwLTQyLjktLjMtLjEtLjItLjEtNi41LS4xLTE0LjEgMC0xMC40LS4xLTEzLjgtLjItMTQtLjQtLjMtMjcuNi0uMy0yOCAwIiAvPgogICAgPHBhdGggaWQ9InBhdGgyIiBjbGFzcz0ic3QxIiBkPSJNMCAxOTkuNXYxNzEuN2gzMTMuOFYyOC42bC0xNDIuNC0uMWMtMTM1LjMgMC0xNDIuNSAwLTE0My4xLS40LS41LS4zLTEuNS0uNC0xNC40LS40SDB2MTcxLjhtMjg1LjQtMTQyYy4zLjMuNCAxIC40IDEzLjlWODVsLS41LjFjLS4yLjEtNTguMS4xLTEyOC42LjFsLTEyOC0uMS0uMS0xMy43YzAtOS45IDAtMTMuOC4yLTE0IC40LS40IDI1Ni4xLS4zIDI1Ni42LjFtLjIgMjguN2MuNC40LjMgMTQxLjQtLjEgMTQxLjgtLjQuNC0yNTYuMi41LTI1Ni42LjEtLjQtLjQtLjMtMTQxLjkgMC0xNDIgLjUtLjIgMjU2LjQtLjEgMjU2LjcuMU04NS44IDExNC4xbC0uNC4zdjQyLjdjMCAzOS40IDAgNDIuNy4zIDQyLjkuMy4yIDIuNy4zIDE0LjMuM3MxNCAwIDE0LjMtLjNjLjMtLjMuMy0zLjUuMy00Mi45di00Mi43bC0uNC0uM2MtLjQtLjMtMi4xLS4zLTE0LjItLjNzLTEzLjggMC0xNC4yLjNtMTE0LjIuMWMtLjQuNC0uNyA4NC45LS4zIDg1LjUuNC43IDEgLjcgMTQuNi43SDIyOGwuNS0uNS41LS41LS4xLTQyLjVjMC0zNC41LS4xLTQyLjUtLjMtNDIuOC0uNS0uNC0yOC4xLS40LTI4LjYuMW0tODYgLjRjLjMuMy4zIDg0LjYgMCA4NC45LS4zLjMtMjcuNi4zLTI3LjkgMC0uMy0uMy0uMy04NC42IDAtODQuOS4zLS4zIDI3LjUtLjMgMjcuOSAwbTExNC40LjJjLjQuNy4zIDg0LjItLjEgODQuNi0uNS42LTI3LjcuNi0yOC4xIDAtLjMtLjUtLjMtODQuMSAwLTg0LjYuMi0uNC42LS40IDE0LjEtLjRzMTMuOSAwIDE0LjEuNE0xMTQgMjg1LjhjLjIuMi4yIDMuNi4yIDE0IDAgNy42LjEgMTMuOS4xIDE0LjEuMS4zIDQuMS4zIDQyLjkuM0gyMDB2LTE0YzAtMTIuNCAwLTE0IC4zLTE0LjMuNS0uNSAyNy40LS41IDI3LjkgMHMuNiAyNy4zIDAgMjcuOWMtLjMuMy0xIC40LTE0LjMuNGgtMTR2MTMuOWMwIDEyLjcgMCAxNC0uMyAxNC4zLS41LjYtODQuNS42LTg1LjEgMC0uNC0uNC0uNC0uNy0uNC0xNC4zdi0xMy45aC0xMy44Yy05LjEgMC0xMy45LS4xLTE0LjItLjItLjUtLjMtLjYtMjcuNy0uMS0yOC4yLjQtLjMgMjcuNi0uMyAyOCAwIiAvPgogICAgPHBhdGggaWQ9InBhdGgzIiBjbGFzcz0ic3QyIiBkPSJNMjcuOCAxMy45djEzLjlsLjUuNGMuNS4zIDcgLjQgMTQyLjkuNWwxNDIuNC4xdjM0Mi42SDB2MjkuNGgxMy44YzEzLjQgMCAxMy44IDAgMTQuNi0uNCAxLjItLjYgODQuOS0uNiA4Ni4xIDAgMS4yLjYgODQuNC42IDg1LjQgMHM4NC44LS42IDg2LjEgMGMuOC40IDI4LjIuNiAyOC45LjIuMi0uMS4yLTMuMS4xLTE0LjUtLjEtMTguOC0uMS0zNTMuMyAwLTM3MS43VjBIMjcuOHYxMy45bTEgNDMuNmMtLjIuMi0uMiA0LS4yIDEzLjlsLjEgMTMuNyAxMjguMS4xYzcwLjUgMCAxMjguMyAwIDEyOC42LS4xbC41LS4xVjcxLjRjMC0xMi45IDAtMTMuNi0uNC0xMy45LS42LS40LTI1Ni4zLS41LTI1Ni43IDBNODYgMTE0LjZjLS4zLjMtLjMgODQuNiAwIDg0LjkuMy4zIDI3LjYuMyAyNy45IDAgLjMtLjMuMy04NC42IDAtODQuOS0uMy0uMy0yNy41LS4zLTI3LjkgMG0xMTQuMiA4NC44Yy4zLjYgMjcuNS42IDI4LjEgMG0tMTE0LjUtNDIuM3Y0Mi4zSDg2LjJ2LTg0LjZoMjcuNnY0Mi4zIiAvPgogIDwvZz4KPC9zdmc+',
    margin: 0,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      color: '#222222',
      type: 'rounded' as DotType
    },
    backgroundOptions: {
      color: '#fff'
    },
    cornersSquareOptions: {
      color: '#222222',
      type: 'extra-rounded' as CornerSquareType
    },
    cornersDotOptions: {
      color: '#222222',
      type: 'dot' as CornerDotType
    }
  })

  const [imageName, setImageName] = useState<string>('Default logo')
  const [fileExtension, setFileExtension] = useState<FileExtension>('svg')
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current && qrCode.append(ref.current)
  }, [qrCode, ref])

  useEffect(() => {
    if (!qrCode) return
    qrCode.update(options)
  }, [qrCode, options])

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      data: event.target.value
    }))
  }

  const onChangeWidth = (width: number) => {
    setOptions((opts) => ({
      ...opts,
      width
    }))
  }

  const onChangeHeight = (height: number) => {
    setOptions((opts) => ({
      ...opts,
      height
    }))
  }

  const onExtensionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFileExtension(event.target.value as FileExtension)
  }

  const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.item(0)

    // eslint-disable-next-line no-undef
    const reader = new FileReader()

    if (file) {
      reader.readAsDataURL(file)
      setImageName(file.name)

      reader.onload = () => {
        setOptions((opts) => ({
          ...opts,
          image: reader.result as string
        }))
      }

      reader.onerror = () => {
        setOptions((opts) => ({
          ...opts,
          image: ''
        }))
      }
    }

    target.value = ''
  }

  const onRemoveImage = () => {
    setOptions((opts) => ({
      ...opts,
      image: ''
    }))
  }

  const onDownload = () => {
    if (!qrCode) return
    qrCode.download({
      extension: fileExtension
    })
  }

  const onChangeDotColor = (color: string) => {
    setOptions((opts) => ({
      ...opts,
      dotsOptions: {
        ...opts.dotsOptions,
        color
      }
    }))
  }

  const onChangeSquareColor = (color: string) => {
    setOptions((opts) => ({
      ...opts,
      cornersSquareOptions: {
        ...opts.cornersSquareOptions,
        color
      }
    }))
  }

  const onChangeCornerColor = (color: string) => {
    setOptions((opts) => ({
      ...opts,
      cornersDotOptions: {
        ...opts.cornersDotOptions,
        color
      }
    }))
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1 w-full max-w-6xl mx-auto px-4 py-6 lg:py-10 grid gap-6 lg:grid-cols-2 lg:items-start'>
        <section
          aria-label='QR code preview'
          className='lg:sticky lg:top-6 bg-white rounded-2xl shadow-lg p-6 flex justify-center items-center'
        >
          <div className='qr-preview' ref={ref} />
        </section>

        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-6'>
          <Section title='Content'>
            <Input
              id='qr-data'
              label='URL or text'
              placeholder={'https://www.google.com/'}
              value={options.data}
              onChange={onDataChange}
            />
          </Section>

          <Section title='Size'>
            <div className='grid grid-cols-2 gap-4'>
              <SizeField
                id='qr-width'
                label='Width (px)'
                value={options.width ?? 300}
                min={100}
                max={1000}
                onChange={onChangeWidth}
              />
              <SizeField
                id='qr-height'
                label='Height (px)'
                value={options.height ?? 300}
                min={100}
                max={1000}
                onChange={onChangeHeight}
              />
            </div>
          </Section>

          <Section title='Colors'>
            <ColorField
              id='qr-dots-color'
              label='Dots color'
              color={options.dotsOptions?.color ?? '#222222'}
              onChange={onChangeDotColor}
            />
            <ColorField
              id='qr-square-color'
              label='Corners square color'
              color={options.cornersSquareOptions?.color ?? '#222222'}
              onChange={onChangeSquareColor}
            />
            <ColorField
              id='qr-corner-color'
              label='Corners dot color'
              color={options.cornersDotOptions?.color ?? '#222222'}
              onChange={onChangeCornerColor}
            />
          </Section>

          <Section title='Logo'>
            <InputFile
              id='qr-logo'
              label='Select an image'
              image={options.image}
              imageName={imageName}
              onChangeImage={onChangeImage}
              onRemoveImage={onRemoveImage}
            />
          </Section>

          <Section title='Download'>
            <div className='flex items-end gap-3'>
              <div className='w-32'>
                <SelectExtension
                  id='qr-extension'
                  label='Format'
                  fileExtension={fileExtension}
                  onExtensionChange={onExtensionChange}
                />
              </div>
              <button
                type='button'
                className='flex-1 h-10 bg-green-500 text-white text-base font-semibold px-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200'
                onClick={onDownload}
              >
                Download {fileExtension.toUpperCase()}
              </button>
            </div>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
