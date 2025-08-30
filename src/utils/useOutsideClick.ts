import { useEffect, useRef } from 'react'


export default function useOutsideClick<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [handler])

  return ref
}
