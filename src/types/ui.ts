import { ChangeEvent, ReactNode } from 'react'
import { ErrorCorrectionLevel, FileExtension } from 'qr-code-styling'

export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void
export type ExtensionChangeHandler = (extension: FileExtension) => void
export type NumberChangeHandler = (value: number) => void
export type ColorChangeHandler = (color: string) => void
export type ErrorCorrectionLevelChangeHandler = (level: ErrorCorrectionLevel) => void

export interface InputProps {
  id: string
  label: string
  placeholder: string
  value: string | number | undefined
  onChange: InputChangeHandler
  error?: string
}

export interface SizeFieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: NumberChangeHandler
}

export interface ColorFieldProps {
  id: string
  label: string
  color: string
  onChange: ColorChangeHandler
}

export interface InputFileProps {
  id: string
  label: string
  image: string | undefined
  imageName: string
  onChangeImage: InputChangeHandler
  onRemoveImage: () => void
  error?: string
}

export interface FormatPickerProps {
  id: string
  label: string
  fileExtension: FileExtension
  onExtensionChange: ExtensionChangeHandler
}

export interface ErrorCorrectionPickerProps {
  id: string
  label: string
  level: ErrorCorrectionLevel
  onLevelChange: ErrorCorrectionLevelChangeHandler
  hint?: string
}

export interface SectionProps {
  number?: string
  title: string
  children: ReactNode
}

export interface QrLabelProps {
  content: string
  width: number
  height: number
  children: ReactNode
}
