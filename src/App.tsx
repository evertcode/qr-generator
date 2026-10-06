import { useEffect, useMemo, useReducer, useRef, useState, ChangeEvent } from 'react'
import { ErrorCorrectionLevel, FileExtension } from 'qr-code-styling'

import Header from './components/Header'
import ContentEditor from './components/ContentEditor'
import SizeField from './components/SizeField'
import FillField from './components/FillField'
import InputFile from './components/InputFile'
import FormatPicker from './components/FormatPicker'
import ErrorCorrectionPicker from './components/ErrorCorrectionPicker'
import ShapePickers from './components/ShapePickers'
import PresetPicker from './components/PresetPicker'
import ShareLinkButton from './components/ShareLinkButton'
import RangeField from './components/RangeField'
import CheckboxField from './components/CheckboxField'
import Section from './components/Section'
import QrLabel from './components/QrLabel'
import Footer from './components/Footer'

import { useQrCode } from './hooks/useQrCode'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { focusRing } from './styles/focusRing'
import { textAction } from './styles/textAction'
import { validateLogoFile } from './utils/validateLogoFile'
import { exceedsQrCapacity } from './utils/qrCapacity'
import { copyQrToClipboard } from './utils/copyQrToClipboard'
import { assessScannability } from './utils/contrast'
import { buildQrPayload, describeQrContent } from './utils/buildQrPayload'
import { validateQrContent } from './utils/validateQrContent'
import { qrDesignReducer } from './design/qrDesignReducer'
import { DEFAULT_QR_DESIGN } from './design/defaultDesign'
import { toQrCodeOptions } from './design/toQrCodeOptions'
import { QR_STYLE_PRESETS } from './design/presets'
import { clearSavedDesign, getDesignStorage, saveDesign } from './design/persistence'
import { resolveInitialDesign } from './design/initialDesign'
import { encodeDesignToHash, isUploadedLogo } from './design/shareLink'
import { LOGO_MARGIN_MAX, LOGO_SIZE_MAX, LOGO_SIZE_MIN, MARGIN_MAX, SIZE_MAX, SIZE_MIN } from './design/limits'
import { AppStatus, LogoUploadError, QrSizeDimension } from './types/qr'
import { InitialDesignSource, QrContent, QrFill, QrFillTarget, QrLogoSettings, QrStylePreset, ScannabilityIssue } from './types/design'

import './App.css'

const QR_UPDATE_DELAY_MS = 150

const LOGO_ERROR_MESSAGES: Record<LogoUploadError, string> = {
  'unsupported-type': 'Use a PNG, JPEG, SVG or WebP image.',
  'too-large': 'That image is over 1 MB. Try a smaller one.',
  unreadable: "We couldn't read that file. Try another one."
}

const STATUS_MESSAGES: Record<AppStatus, string> = {
  copied: 'Copied to clipboard',
  unsupported: "Your browser can't copy images. Download it instead.",
  failed: "Couldn't copy the image. Try again.",
  'design-reset': 'Design reset',
  'design-restored': 'Restored your last design.',
  'logo-not-saved': 'Your logo was too big to keep for next time.',
  'link-loaded': 'Loaded the design from the link.',
  'invalid-link': 'This link has an invalid design. Showing the default one.',
  'link-copied': 'Link copied',
  'link-copy-failed': "Couldn't copy the link. Try again."
}
const SUCCESS_STATUSES: readonly AppStatus[] = ['copied', 'design-reset', 'design-restored', 'link-loaded', 'link-copied']
const INITIAL_STATUSES: Record<InitialDesignSource, AppStatus | undefined> = {
  link: 'link-loaded',
  'invalid-link': 'invalid-link',
  storage: 'design-restored',
  default: undefined
}
const STATUS_DURATION_MS = 4000

const EYE_FRAME_HINT = 'The outer square in each corner.'
const EYE_CENTER_HINT = 'The dot inside each corner square.'

// A pale lime keeps a background gradient light enough for dark dots
const BACKGROUND_GRADIENT_END = '#ecfccb'
const MARGIN_HINT = 'Leave some margin so scanners can find the code.'
const JPEG_TRANSPARENCY_HINT = "JPEG can't be transparent. Pick PNG, WebP or SVG."
const NO_DISABLED_EXTENSIONS: readonly FileExtension[] = []
const TRANSPARENT_DISABLED_EXTENSIONS: readonly FileExtension[] = ['jpeg']

const SCANNABILITY_MESSAGES: Record<ScannabilityIssue, string> = {
  'low-contrast': 'Low contrast. Some phones may not scan this code.',
  inverted: "Light dots on a dark background don't scan on every phone. Make the dots darker than the background."
}

const LOGO_SCAN_HINT = 'Logos cover part of the code. Use Q or H so it still scans.'
const LOW_CORRECTION_LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M']

const capacityMessage = (level: ErrorCorrectionLevel) =>
  `Too long for a QR code at level ${level}. Shorten it or pick a lower level.`

function App () {
  const [storage] = useState(getDesignStorage)
  const [initial] = useState(() => resolveInitialDesign(storage, window.location.hash))
  const [design, dispatch] = useReducer(qrDesignReducer, initial.design)
  const [logoError, setLogoError] = useState<LogoUploadError>()
  const [status, setStatus] = useState<AppStatus | undefined>(INITIAL_STATUSES[initial.source])
  // Warn about an oversized logo once per logo, not on every save
  const warnedLogoSrc = useRef<string>()
  // Remounts the content editor on reset so its per-tab drafts are cleared too
  const [resetCount, setResetCount] = useState(0)
  const [fileExtension, setFileExtension] = useState<FileExtension>('svg')
  const debouncedDesign = useDebouncedValue(design, QR_UPDATE_DELAY_MS)
  const qrOptions = useMemo(() => toQrCodeOptions(debouncedDesign), [debouncedDesign])
  const { containerRef, qrCode } = useQrCode(qrOptions)

  const payload = buildQrPayload(design.content)
  const { errorCorrectionLevel, size, background } = design
  useEffect(() => {
    // Once loaded, the link's design lives in the app; keeping the hash would reload it over later edits
    const clearHash = () => window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (initial.source === 'link' || initial.source === 'invalid-link') clearHash()

    // A link pasted into a tab that already runs the app only changes the hash, without a reload
    const onHashChange = () => {
      const shared = resolveInitialDesign(null, window.location.hash)
      if (shared.source === 'default') return
      dispatch({ type: 'replace', design: shared.design })
      setStatus(INITIAL_STATUSES[shared.source])
      setResetCount((count) => count + 1)
      clearHash()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [initial.source])

  useEffect(() => {
    if (!storage) return
    // The default design is not worth restoring, so a reset leaves storage empty
    if (debouncedDesign === DEFAULT_QR_DESIGN) {
      clearSavedDesign(storage)
      return
    }
    const result = saveDesign(storage, debouncedDesign)
    const logoSrc = debouncedDesign.logo?.src
    if (result === 'saved-without-logo' && logoSrc !== warnedLogoSrc.current) {
      warnedLogoSrc.current = logoSrc
      setStatus('logo-not-saved')
    }
  }, [storage, debouncedDesign])

  const isDataTooLong = exceedsQrCapacity(payload, errorCorrectionLevel)
  const canSave = validateQrContent(design.content) === null && !isDataTooLong
  const capacityError = isDataTooLong ? capacityMessage(errorCorrectionLevel) : undefined
  const scannabilityIssues = assessScannability(design)
  const showLogoHint = design.logo !== null && LOW_CORRECTION_LEVELS.includes(errorCorrectionLevel)

  const onContentChange = (content: QrContent) => {
    dispatch({ type: 'set-content', content })
  }

  const onChangeSize = (dimension: QrSizeDimension) => (value: number) => {
    dispatch({ type: 'set-size', dimension, value })
  }

  const onErrorCorrectionLevelChange = (level: ErrorCorrectionLevel) => {
    dispatch({ type: 'set-error-correction', level })
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
      dispatch({ type: 'set-logo', src: reader.result as string, name: file.name })
      setLogoError(undefined)
    }

    reader.onerror = () => {
      setLogoError('unreadable')
    }

    reader.readAsDataURL(file)
  }

  const onLogoSettingsChange = (settings: Partial<QrLogoSettings>) => {
    dispatch({ type: 'update-logo', settings })
  }

  const onRemoveImage = () => {
    dispatch({ type: 'remove-logo' })
    setLogoError(undefined)
  }

  const onChangeFill = (target: QrFillTarget) => (fill: QrFill) => {
    dispatch({ type: 'set-fill', target, fill })
  }

  const onTransparentChange = (transparent: boolean) => {
    dispatch({ type: 'set-background', transparent })
    if (transparent && fileExtension === 'jpeg') setFileExtension('png')
  }

  const onMarginChange = (margin: number) => {
    dispatch({ type: 'set-margin', margin })
  }

  const onCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${encodeDesignToHash(design)}`
    try {
      await navigator.clipboard.writeText(url)
      setStatus('link-copied')
    } catch {
      setStatus('link-copy-failed')
    }
  }

  const onApplyPreset = (preset: QrStylePreset) => {
    dispatch({ type: 'apply-preset', style: preset.style })
  }

  const onReset = () => {
    dispatch({ type: 'reset' })
    if (storage) clearSavedDesign(storage)
    setResetCount((count) => count + 1)
    setLogoError(undefined)
    setStatus('design-reset')
  }

  useEffect(() => {
    if (!status) return
    const timeout = setTimeout(() => setStatus(undefined), STATUS_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [status])

  // Flush pending edits so a quick click never exports a stale code
  const flushQrCode = () => {
    qrCode.update(toQrCodeOptions(design))
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
    setStatus(await copyQrToClipboard(qrCode))
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
            <QrLabel content={describeQrContent(design.content)} width={size.width} height={size.height}>
              <div className={`qr-preview ${background.transparent ? 'qr-preview--transparent' : ''}`} ref={containerRef} />
            </QrLabel>
            <div aria-live='polite' className='mt-3 space-y-1'>
              {scannabilityIssues.map((issue) => (
                <p key={issue} className='flex gap-2 text-sm text-red-700'>
                  <span aria-hidden='true'>⚠</span>
                  {SCANNABILITY_MESSAGES[issue]}
                </p>
              ))}
            </div>
            <div className='mt-3 flex justify-end'>
              <button type='button' onClick={onReset} className={`${textAction} text-muted hover:text-ink`}>
                Reset design
              </button>
            </div>
          </section>

          <div className='py-8 space-y-8 border-t border-rule lg:border-t-0 lg:border-l lg:pl-10'>
            <Section number='01' title='Content'>
              <ContentEditor
                key={resetCount}
                content={design.content}
                onChange={onContentChange}
                capacityError={capacityError}
              />
            </Section>

            <Section number='02' title='Size'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <SizeField
                  id='qr-width'
                  label='Width'
                  value={size.width}
                  min={SIZE_MIN}
                  max={SIZE_MAX}
                  onChange={onChangeSize('width')}
                />
                <SizeField
                  id='qr-height'
                  label='Height'
                  value={size.height}
                  min={SIZE_MIN}
                  max={SIZE_MAX}
                  onChange={onChangeSize('height')}
                />
              </div>
              <p className='flex justify-between font-mono text-xs text-muted'>
                <span>{SIZE_MIN}–{SIZE_MAX} px each side</span>
                <output htmlFor='qr-width qr-height' className='text-ink'>
                  {size.width} × {size.height} px
                </output>
              </p>
            </Section>

            <Section number='03' title='Presets'>
              <PresetPicker presets={QR_STYLE_PRESETS} onApply={onApplyPreset} />
            </Section>

            <Section number='04' title='Shape'>
              <ShapePickers
                shapes={{ dots: design.dots.type, cornersSquare: design.cornersSquare.type, cornersDot: design.cornersDot.type }}
                onShapeChange={dispatch}
              />
            </Section>

            <Section number='05' title='Ink'>
              <FillField
                id='qr-dots-color'
                label='Dots'
                fill={design.dots.fill}
                onChange={onChangeFill('dots')}
              />
              <FillField
                id='qr-square-color'
                label='Eye frame'
                hint={EYE_FRAME_HINT}
                fill={design.cornersSquare.fill}
                onChange={onChangeFill('cornersSquare')}
              />
              <FillField
                id='qr-corner-color'
                label='Eye center'
                hint={EYE_CENTER_HINT}
                fill={design.cornersDot.fill}
                onChange={onChangeFill('cornersDot')}
              />
            </Section>

            <Section number='06' title='Background'>
              <CheckboxField
                id='qr-background-transparent'
                label='Transparent background'
                checked={background.transparent}
                onChange={onTransparentChange}
              />
              {!background.transparent && (
                <FillField
                  id='qr-background-color'
                  label='Background color'
                  fill={background.fill}
                  defaultGradientEnd={BACKGROUND_GRADIENT_END}
                  onChange={onChangeFill('background')}
                />
              )}
              <RangeField
                id='qr-margin'
                label='Margin'
                value={design.margin}
                min={0}
                max={MARGIN_MAX}
                step={1}
                unit='px'
                hint={MARGIN_HINT}
                onChange={onMarginChange}
              />
            </Section>

            <Section number='07' title='Logo'>
              <InputFile
                id='qr-logo'
                label='Add a logo'
                image={design.logo?.src}
                imageName={design.logo?.name ?? ''}
                onChangeImage={onChangeImage}
                onRemoveImage={onRemoveImage}
                error={logoError && LOGO_ERROR_MESSAGES[logoError]}
              />
              {design.logo && (
                <>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <RangeField
                      id='qr-logo-size'
                      label='Logo size'
                      value={Math.round(design.logo.size * 100)}
                      min={LOGO_SIZE_MIN * 100}
                      max={LOGO_SIZE_MAX * 100}
                      step={5}
                      unit='%'
                      onChange={(percent) => onLogoSettingsChange({ size: percent / 100 })}
                    />
                    <RangeField
                      id='qr-logo-margin'
                      label='Logo margin'
                      value={design.logo.margin}
                      min={0}
                      max={LOGO_MARGIN_MAX}
                      step={1}
                      unit='px'
                      onChange={(margin) => onLogoSettingsChange({ margin })}
                    />
                  </div>
                  <CheckboxField
                    id='qr-logo-hide-dots'
                    label='Hide dots behind the logo'
                    checked={design.logo.hideBackgroundDots}
                    onChange={(hideBackgroundDots) => onLogoSettingsChange({ hideBackgroundDots })}
                  />
                </>
              )}
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
                  disabledExtensions={background.transparent ? TRANSPARENT_DISABLED_EXTENSIONS : NO_DISABLED_EXTENSIONS}
                  hint={background.transparent ? JPEG_TRANSPARENCY_HINT : undefined}
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
              <ShareLinkButton onCopy={onCopyLink} logoExcluded={isUploadedLogo(design.logo)} />
              <p role='status' className={`min-h-5 text-sm ${status && SUCCESS_STATUSES.includes(status) ? 'text-moss' : 'text-red-700'}`}>
                {status && STATUS_MESSAGES[status]}
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
