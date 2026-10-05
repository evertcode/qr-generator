import { useEffect, useState, ChangeEvent } from 'react'
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
import ErrorCorrectionPicker from './components/ErrorCorrectionPicker'
import Section from './components/Section'
import QrLabel from './components/QrLabel'
import Footer from './components/Footer'

import { useQrCode } from './hooks/useQrCode'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { focusRing } from './styles/focusRing'
import { validateLogoFile } from './utils/validateLogoFile'
import { exceedsQrCapacity } from './utils/qrCapacity'
import { copyQrToClipboard } from './utils/copyQrToClipboard'
import { CopyResult, LogoUploadError, QrColorTarget, QrSizeDimension } from './types/qr'
import defaultLogo from '../assets/logo.svg'

import './App.css'

const SIZE_MIN = 100
const SIZE_MAX = 1000
const QR_UPDATE_DELAY_MS = 150

const LOGO_ERROR_MESSAGES: Record<LogoUploadError, string> = {
  'unsupported-type': 'Use a PNG, JPEG, SVG or WebP image.',
  'too-large': 'That image is over 1 MB. Try a smaller one.',
  unreadable: "We couldn't read that file. Try another one."
}

const COPY_MESSAGES: Record<CopyResult, string> = {
  copied: 'Copied to clipboard',
  unsupported: "Your browser can't copy images. Download it instead.",
  failed: "Couldn't copy the image. Try again."
}
const COPY_STATUS_DURATION_MS = 4000

const EYE_FRAME_HINT = 'The outer square in each corner.'
const EYE_CENTER_HINT = 'The dot inside each corner square.'

const EMPTY_DATA_MESSAGE = 'Nothing to encode yet. Paste a link or type something.'
const LOGO_SCAN_HINT = 'Logos cover part of the code. Use Q or H so it still scans.'
const LOW_CORRECTION_LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M']

const capacityMessage = (level: ErrorCorrectionLevel) =>
  `Too long for a QR code at level ${level}. Shorten it or pick a lower level.`

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
  const [logoError, setLogoError] = useState<LogoUploadError>()
  const [copyResult, setCopyResult] = useState<CopyResult>()
  const [fileExtension, setFileExtension] = useState<FileExtension>('svg')
  const debouncedOptions = useDebouncedValue(options, QR_UPDATE_DELAY_MS)
  const { containerRef, qrCode } = useQrCode(debouncedOptions)

  const data = options.data ?? ''
  const errorCorrectionLevel = options.qrOptions?.errorCorrectionLevel ?? 'Q'
  const isDataEmpty = !data.trim()
  const isDataTooLong = exceedsQrCapacity(data, errorCorrectionLevel)
  const canSave = !isDataEmpty && !isDataTooLong
  const dataError = isDataEmpty
    ? EMPTY_DATA_MESSAGE
    : isDataTooLong ? capacityMessage(errorCorrectionLevel) : undefined
  const showLogoHint = Boolean(options.image) && LOW_CORRECTION_LEVELS.includes(errorCorrectionLevel)

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

  const onErrorCorrectionLevelChange = (level: ErrorCorrectionLevel) => {
    setOptions((opts) => ({
      ...opts,
      qrOptions: {
        ...opts.qrOptions,
        errorCorrectionLevel: level
      }
    }))
  }

  const onExtensionChange = (extension: FileExtension) => {
    setFileExtension(extension)
  }

  const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.item(0)
    target.value = ''

    if (!file) return

    const validation = validateLogoFile(file)
    if (!validation.ok) {
      setLogoError(validation.reason)
      return
    }

    // The previous logo stays in place until the new one is read successfully
    const reader = new FileReader()

    reader.onload = () => {
      setOptions((opts) => ({
        ...opts,
        image: reader.result as string
      }))
      setImageName(file.name)
      setLogoError(undefined)
    }

    reader.onerror = () => {
      setLogoError('unreadable')
    }

    reader.readAsDataURL(file)
  }

  const onRemoveImage = () => {
    setOptions((opts) => ({
      ...opts,
      image: ''
    }))
    setLogoError(undefined)
  }

  useEffect(() => {
    if (!copyResult) return
    const timeout = setTimeout(() => setCopyResult(undefined), COPY_STATUS_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [copyResult])

  // Flush pending edits so a quick click never exports a stale code
  const flushQrCode = () => {
    qrCode.update(options)
  }

  const onDownload = () => {
    if (!canSave) return
    flushQrCode()
    qrCode.download({
      extension: fileExtension
    })
  }

  const onCopy = async () => {
    if (!canSave) return
    flushQrCode()
    setCopyResult(await copyQrToClipboard(qrCode))
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
            <QrLabel content={data} width={options.width ?? 300} height={options.height ?? 300}>
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
                error={dataError}
              />
            </Section>

            <Section number='02' title='Size'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
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
                hint={EYE_FRAME_HINT}
                color={options.cornersSquareOptions?.color ?? '#222222'}
                onChange={onChangeColor('cornersSquare')}
              />
              <ColorField
                id='qr-corner-color'
                label='Eye center'
                hint={EYE_CENTER_HINT}
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
                error={logoError && LOGO_ERROR_MESSAGES[logoError]}
              />
              <ErrorCorrectionPicker
                id='qr-error-correction'
                label='Error correction'
                level={errorCorrectionLevel}
                onLevelChange={onErrorCorrectionLevelChange}
                hint={showLogoHint ? LOGO_SCAN_HINT : undefined}
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
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    className={`inline-flex items-center h-10 px-5 border border-ink text-ink font-medium hover:bg-rule disabled:border-rule disabled:text-muted disabled:hover:bg-transparent disabled:cursor-not-allowed ${focusRing}`}
                    onClick={onCopy}
                    disabled={!canSave}
                  >
                    Copy image
                  </button>
                  <button
                    type='button'
                    className={`inline-flex items-center gap-2 h-10 px-5 bg-moss text-white font-medium hover:bg-ink disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed ${focusRing}`}
                    onClick={onDownload}
                    disabled={!canSave}
                  >
                    Save as {fileExtension.toUpperCase()}
                    <span aria-hidden='true'>↓</span>
                  </button>
                </div>
              </div>
              <p role='status' className={`min-h-5 text-sm ${copyResult === 'copied' ? 'text-moss' : 'text-red-700'}`}>
                {copyResult && COPY_MESSAGES[copyResult]}
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
