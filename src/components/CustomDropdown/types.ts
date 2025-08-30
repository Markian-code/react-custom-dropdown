import type React from 'react'

export type RenderItemProps<T> = {
  item: T
  index: number
  active: boolean
  selected: boolean
}

export type CustomDropdownProps<T> = {
  items: T[]
  value: T | null
  onChange: (val: T) => void
  placeholder?: string
  getLabel?: (item: T) => string
  renderItem?: (p: RenderItemProps<T>) => React.ReactNode
  renderSelected?: (value: T | null) => React.ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  searchFn?: (query: string, items: T[]) => Promise<T[]> | T[]
  disabled?: boolean
  closeOnSelect?: boolean
  className?: string
  dropdownClassName?: string
}
