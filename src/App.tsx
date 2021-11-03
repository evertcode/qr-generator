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

import { ColorResult, SketchPicker } from 'react-color'

import Header from './components/Header'
import Input from './components/Input'
import InputFile from './components/InputFile'
import SelectExtension from './components/SelectExtension'
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

  const [showDotPicker, setShowDotPicker] = useState<boolean>(false)
  const [showSquarePicker, setShowSquarePicker] = useState<boolean>(false)
  const [showCornerPicker, setShowCornerPicker] = useState<boolean>(false)
  const [fileExtension, setFileExtension] = useState<FileExtension>('svg')
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current && qrCode.append(ref.current)
  }, [qrCode, ref])

  useEffect(() => {
    if (!qrCode) return
    qrCode.update(options)
    console.log(options)
  }, [qrCode, options])

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      data: event.target.value
    }))
  }

  const onChangeWidth = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      width: Number(event.target.value)
    }))
  }

  const onChangeHeight = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      height: Number(event.target.value)
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

  const onChangeDotColor = (col: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      dotsOptions: {
        ...opts.dotsOptions,
        color: col.hex
      }
    }))
  }

  const onChangeSquareColor = (col: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      cornersSquareOptions: {
        ...opts.cornersSquareOptions,
        color: col.hex
      }
    }))
  }

  const onChangeCornerColor = (col: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      cornersDotOptions: {
        ...opts.cornersDotOptions,
        color: col.hex
      }
    }))
  }

  const onShowDotPicker = () => {
    setShowDotPicker(oldValue => !oldValue)
  }

  const onShowSquarePicker = () => {
    setShowSquarePicker(oldValue => !oldValue)
  }

  const onShowCornerPicker = () => {
    setShowCornerPicker(oldValue => !oldValue)
  }

  return (
    <>
      <Header />
      <main className='flex flex-col justify-center items-center gap-1'>
        <div className='pt-4 xl:pt-10' ref={ref} />

        <div className='flex flex-col pt-4 space-y-2'>
          <Input
            placeholder={'https://www.google.com/'}
            value={options.data}
            onChange={onDataChange}
          />

          <Input
            placeholder={'300'}
            value={options.width}
            onChange={onChangeWidth}
          />

          <Input
            placeholder={'300'}
            value={options.height}
            onChange={onChangeHeight}
          />

          <div className='flex items-center flex-row space-x-2'>
            <label>Dots color:</label>
            <div onClick={onShowDotPicker} className='p-1 bg-white shadow rounded-lg inline-block pointer' >
              <div style={{
                backgroundColor: options.dotsOptions?.color
              }} className='w-10 h-4 rounded-lg' />
            </div>
            {showDotPicker && (<div className='absolute z-10'>
              <div onClick={onShowDotPicker} className='fixed top-0 right-0 bottom-0 left-0' />
              <SketchPicker color={options.dotsOptions?.color} onChange={onChangeDotColor} />
            </div>)}
          </div>

          <div className='flex items-center flex-row space-x-2'>
            <label>Corners Square Color:</label>
            <div onClick={onShowSquarePicker} className='p-1 bg-white shadow rounded-lg inline-block pointer' >
              <div style={{
                backgroundColor: options.cornersSquareOptions?.color
              }} className='w-10 h-4 rounded-lg' />
            </div>
            {showSquarePicker && (<div className='absolute z-10'>
              <div onClick={onShowSquarePicker} className='fixed top-0 right-0 bottom-0 left-0' />
              <SketchPicker color={options.cornersSquareOptions?.color} onChange={onChangeSquareColor} />
            </div>)}
          </div>

          <div className='flex items-center flex-row space-x-2'>
            <label>Corners Dot Color:</label>
            <div onClick={onShowCornerPicker} className='p-1 bg-white shadow rounded-lg inline-block pointer' >
              <div style={{
                backgroundColor: options.cornersDotOptions?.color
              }} className='w-10 h-4 rounded-lg' />
            </div>
            {showCornerPicker && (<div className='absolute z-10'>
              <div onClick={onShowCornerPicker} className='fixed top-0 right-0 bottom-0 left-0' />
              <SketchPicker color={options.cornersDotOptions?.color} onChange={onChangeCornerColor} />
            </div>)}
          </div>

          <InputFile onChangeImage={onChangeImage} />

          <div className='relative inline-block w-full text-gray-700'>
            <SelectExtension fileExtension={fileExtension} onExtensionChange={onExtensionChange} />
          </div>
          <button
            className='bg-green-500 text-white text-base font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200'
            onClick={onDownload}
          >
            Download
          </button>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default App
