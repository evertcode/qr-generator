import { ChangeEvent, ReactNode } from 'react'
import { FileExtension } from 'qr-code-styling'

export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void
export type SelectChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => void

export interface InputProps {
  id: string
  label: string
  placeholder: string
  value: string | number | undefined
  onChange: InputChangeHandler
}

export interface InputFileProps {
  id: string
  label: string
  onChangeImage: InputChangeHandler
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
