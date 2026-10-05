import { ChangeEvent, ReactNode } from 'react'
import { FileExtension } from 'qr-code-styling'

export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void
export type SelectChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => void
export type NumberChangeHandler = (value: number) => void
export type ColorChangeHandler = (color: string) => void

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
}

export interface SelectExtensionProps {
  id: string
  label: string
  fileExtension: FileExtension
  onExtensionChange: SelectChangeHandler
}

export interface SectionProps {
  title: string
  children: ReactNode
}
