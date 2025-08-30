import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import useOutsideClick from '../../utils/useOutsideClick'
import type { CustomDropdownProps } from './types'
import s from './CustomDropdown.module.css'

const OPEN_EVENT = '__custom_dropdown_open__'

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

function useDebounced<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function CustomDropdown<T>(props: CustomDropdownProps<T>) {
  const {
    items,
    value,
    onChange,
    placeholder = 'Оберіть ваше місто',
    getLabel = (i: any) => String(i),
    renderItem,
    renderSelected,
    searchable = true,
    searchPlaceholder = 'Пошук...',
    searchFn,
    disabled = false,
    closeOnSelect = true,
    className,
    dropdownClassName,
  } = props

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<T[]>(items)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const debouncedQuery = useDebounced(query)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const rootRef = useOutsideClick<HTMLDivElement>(() => setOpen(false)) 
  const searchRef = useRef<HTMLInputElement | null>(null)
  const suppressFocusOpen = useRef(false) 
  const id = useId()
  
  useEffect(() => {
    function listen(e: Event) {
      const detail = (e as CustomEvent<{ id: string }>).detail
      if (detail?.id !== id) setOpen(false)
    }
    document.addEventListener(OPEN_EVENT, listen as EventListener)
    return () => document.removeEventListener(OPEN_EVENT, listen as EventListener)
  }, [id])
 
  useEffect(() => setResults(items), [items])

  // пошук (sync/async)
  useEffect(() => {
    let alive = true
    async function run() {
      if (!searchable) return setResults(items)
      const q = debouncedQuery.trim()
      if (!q) return setResults(items)
      try {
        setLoading(true)
        const res = searchFn
          ? await Promise.resolve(searchFn(q, items))
          : items.filter((it) => getLabel(it).toLowerCase().includes(q.toLowerCase()))
        if (alive) setResults(res)
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => { alive = false }
  }, [debouncedQuery, items, searchable, searchFn, getLabel])

  const openDropdown = () => {
    if (disabled) return
    setOpen(prev => {
      const next = !prev
      if (next) {
        document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id } }))
        setQuery('')
        setActiveIndex(-1)
        setResults(items)
        // автофокус у пошук
        setTimeout(() => searchRef.current?.focus(), 0)
      }
      return next
    })
  }
  
  function closeAndFocusButton() {
    suppressFocusOpen.current = true
    setOpen(false)    
    setTimeout(() => buttonRef.current?.focus(), 0)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openDropdown()
      }
      return
    }
    const max = results.length - 1
    if (e.key === 'Escape') {
      e.preventDefault()
      closeAndFocusButton() 
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i >= max ? 0 : i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? max : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) doSelect(results[activeIndex])
    }
  }

  function doSelect(item: T) {
    onChange(item)
    if (closeOnSelect) {
      closeAndFocusButton()  
    } else {
      buttonRef.current?.focus()
    }
  }

  const selectedLabel = useMemo(
    () => (value == null ? placeholder : getLabel(value)),
    [value, getLabel, placeholder]
  )

  return (
    <div
      ref={rootRef}
      className={cx(s.root, className)}
      onKeyDown={onKeyDown}
      onBlurCapture={(e) => {
        // закриття при втраті фокусу (Tab) якщо фокус пішов за межі компонента
        const next = e.relatedTarget as Node | null
        if (next && rootRef.current?.contains(next)) return
        setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={openDropdown}
        onFocus={(e) => {
          // не відкривати, якщо фокус поставили програмно (після Esc/вибору)
          if (suppressFocusOpen.current) {
            suppressFocusOpen.current = false
            return
          }
          // відкривати по фокусу лише для клавіатури (Tab)
          if (e.currentTarget.matches(':focus-visible')) openDropdown()
        }}
        className={cx(s.button, disabled && s.buttonDisabled)}
      >
        <span className={value == null ? s.placeholder : undefined}>
          {renderSelected ? renderSelected(value) : selectedLabel}
        </span>
        <span className={s.chevron}>▾</span>
      </button>

      {open && (
        <div
          className={cx(s.panel, dropdownClassName)}
          role="listbox"
          id={id}
          tabIndex={-1}
        >
          {searchable && (
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={s.searchInput}
              />
            </div>
          )}

          <div className={s.list} data-testid="dropdown-list">
            {loading && <div className={s.status}>Loading…</div>}
            {!loading && results.length === 0 && (
              <div className={s.status}>Нічого не знайдено</div>
            )}
            {!loading && results.map((item, idx) => {
              const label = getLabel(item)
              const isSelected = value != null && getLabel(value) === label
              const isActive = idx === activeIndex
              return (
                <div
                  key={label + idx}
                  role="option"
                  aria-selected={isSelected}
                  className={cx(s.item, isActive && s.itemActive, isSelected && s.itemSelected)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => doSelect(item)}
                >
                  {renderItem
                    ? renderItem({ item, index: idx, active: isActive, selected: isSelected })
                    : <span>{label}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
