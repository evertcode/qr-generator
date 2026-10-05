import { useState, ChangeEvent } from 'react'
import {
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
import FormatPicker from './components/FormatPicker'
import Section from './components/Section'
import QrLabel from './components/QrLabel'
import Footer from './components/Footer'

import { useQrCode } from './hooks/useQrCode'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { focusRing } from './styles/focusRing'
import { QrColorTarget, QrSizeDimension } from './types/qr'
import defaultLogo from '../assets/logo.svg'

import './App.css'

const SIZE_MIN = 100
const SIZE_MAX = 1000
const QR_UPDATE_DELAY_MS = 150

function App () {
  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: 'canvas' as DrawType,
    data: 'https://github.com/evertcode',
    image: defaultLogo,
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

  const [imageName, setImageName] = useState<string>('evertcode mascot')
  const [fileExtension, setFileExtension] = useState<FileExtension>('svg')
  const debouncedOptions = useDebouncedValue(options, QR_UPDATE_DELAY_MS)
  const { containerRef, qrCode } = useQrCode(debouncedOptions)

  const isDataEmpty = !options.data?.trim()

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((opts) => ({
      ...opts,
      data: event.target.value
    }))
  }

  const onChangeSize = (dimension: QrSizeDimension) => (value: number) => {
    setOptions((opts) => ({
      ...opts,
      [dimension]: value
    }))
  }

  const onExtensionChange = (extension: FileExtension) => {
    setFileExtension(extension)
  }

  const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.item(0)

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
    if (isDataEmpty) return
    // Flush pending edits so a quick click never saves a stale code
    qrCode.update(options)
    qrCode.download({
      extension: fileExtension
    })
  }

  const onChangeColor = (target: QrColorTarget) => (color: string) => {
    const key = `${target}Options` as const
    setOptions((opts) => ({
      ...opts,
      [key]: {
        ...opts[key],
        color
      }
    }))
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1 w-full max-w-6xl mx-auto px-4 py-8 lg:py-12'>
        <div className='grid border-t border-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start'>
          <section
            aria-label='QR code preview'
            className='py-8 lg:pr-10 lg:sticky lg:top-0'
          >
            <QrLabel content={options.data ?? ''} width={options.width ?? 300} height={options.height ?? 300}>
              <div className='qr-preview' ref={containerRef} />
            </QrLabel>
          </section>

          <div className='py-8 space-y-8 border-t border-rule lg:border-t-0 lg:border-l lg:pl-10'>
            <Section number='01' title='Link'>
              <Input
                id='qr-data'
                label='Link or text'
                placeholder='https://your-site.com'
                value={options.data}
                onChange={onDataChange}
                error={isDataEmpty ? 'Nothing to encode yet. Paste a link or type something.' : undefined}
              />
            </Section>

            <Section number='02' title='Size'>
              <div className='grid grid-cols-2 gap-6'>
                <SizeField
                  id='qr-width'
                  label='Width'
                  value={options.width ?? 300}
                  min={SIZE_MIN}
                  max={SIZE_MAX}
                  onChange={onChangeSize('width')}
                />
                <SizeField
                  id='qr-height'
                  label='Height'
                  value={options.height ?? 300}
                  min={SIZE_MIN}
                  max={SIZE_MAX}
                  onChange={onChangeSize('height')}
                />
              </div>
              <p className='flex justify-between font-mono text-xs text-muted'>
                <span>{SIZE_MIN}–{SIZE_MAX} px each side</span>
                <output htmlFor='qr-width qr-height' className='text-ink'>
                  {options.width ?? 300} × {options.height ?? 300} px
                </output>
              </p>
            </Section>

            <Section number='03' title='Ink'>
              <ColorField
                id='qr-dots-color'
                label='Dots'
                color={options.dotsOptions?.color ?? '#222222'}
                onChange={onChangeColor('dots')}
              />
              <ColorField
                id='qr-square-color'
                label='Eye frame'
                color={options.cornersSquareOptions?.color ?? '#222222'}
                onChange={onChangeColor('cornersSquare')}
              />
              <ColorField
                id='qr-corner-color'
                label='Eye center'
                color={options.cornersDotOptions?.color ?? '#222222'}
                onChange={onChangeColor('cornersDot')}
              />
            </Section>

            <Section number='04' title='Logo'>
              <InputFile
                id='qr-logo'
                label='Add a logo'
                image={options.image}
                imageName={imageName}
                onChangeImage={onChangeImage}
                onRemoveImage={onRemoveImage}
              />
            </Section>

            <Section title='Save'>
              <div className='flex flex-wrap items-end justify-between gap-4'>
                <FormatPicker
                  id='qr-extension'
                  label='File format'
                  fileExtension={fileExtension}
                  onExtensionChange={onExtensionChange}
                />
                <button
                  type='button'
                  className={`inline-flex items-center gap-2 h-10 px-5 bg-moss text-white font-medium hover:bg-ink disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed ${focusRing}`}
                  onClick={onDownload}
                  disabled={isDataEmpty}
                >
                  Save as {fileExtension.toUpperCase()}
                  <span aria-hidden='true'>↓</span>
                </button>
              </div>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
