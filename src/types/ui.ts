import { ChangeEvent, ReactNode } from 'react'
import { ErrorCorrectionLevel, FileExtension } from 'qr-code-styling'
import { QrContent, QrContentOf, QrContentType, QrFill, QrSetShapeAction, QrShapeTarget, QrShapeTypes, QrStylePreset } from './design'

export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void
export type ExtensionChangeHandler = (extension: FileExtension) => void
export type NumberChangeHandler = (value: number) => void
export type ColorChangeHandler = (color: string) => void
export type ErrorCorrectionLevelChangeHandler = (level: ErrorCorrectionLevel) => void

export type InputType = 'text' | 'email' | 'tel' | 'url'

export interface InputProps {
  id: string
  label: string
  placeholder: string
  value: string | number | undefined
  onChange: InputChangeHandler
  error?: string
  type?: InputType
}

export interface SizeFieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: NumberChangeHandler
}

export interface RangeFieldProps extends SizeFieldProps {
  step: number
  unit: string
  hint?: string
}

export interface CheckboxFieldProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export interface ColorFieldProps {
  id: string
  label: string
  color: string
  onChange: ColorChangeHandler
  hint?: string
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
  disabledExtensions?: readonly FileExtension[]
  hint?: string
}

export interface ErrorCorrectionPickerProps {
  id: string
  label: string
  level: ErrorCorrectionLevel
  onLevelChange: ErrorCorrectionLevelChangeHandler
  hint?: string
}

export interface OptionPickerItem<T extends string> {
  value: T
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface OptionPickerProps<T extends string> {
  id: string
  label: string
  value: T
  options: readonly OptionPickerItem<T>[]
  onChange: (value: T) => void
  hint?: string
  labelHidden?: boolean
}

export type ShapeIconProps = {
  [K in QrShapeTarget]: { target: K; shape: QrShapeTypes[K] }
}[QrShapeTarget]

export interface ShapePickersProps {
  shapes: QrShapeTypes
  onShapeChange: (change: QrSetShapeAction) => void
}

export interface FillFieldProps {
  id: string
  label: string
  fill: QrFill
  onChange: (fill: QrFill) => void
  hint?: string
  defaultGradientEnd?: string
}

export interface ContentTypeTabsProps {
  id: string
  value: QrContentType
  onChange: (type: QrContentType) => void
}

export interface ContentFormProps<T extends QrContentType> {
  content: QrContentOf<T>
  onChange: (content: QrContentOf<T>) => void
  error?: string
}

export interface ContentEditorProps {
  content: QrContent
  onChange: (content: QrContent) => void
  capacityError?: string
}

export interface PresetPickerProps {
  presets: readonly QrStylePreset[]
  onApply: (preset: QrStylePreset) => void
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
