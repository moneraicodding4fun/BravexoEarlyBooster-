/**
 * Bravexo toast bus — lightweight, framework-free pub/sub consumed by the
 * framer-motion powered <Toaster /> component. Every CRUD operation in the
 * app surfaces feedback through here.
 */

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type Listener = (t: ToastItem) => void

let listener: Listener | null = null
let queue: ToastItem[] = []
let counter = 0

export function registerToaster(fn: Listener) {
  listener = fn
  const pending = queue
  queue = []
  pending.forEach((t) => fn(t))
  return () => {
    if (listener === fn) listener = null
  }
}

export function toast(t: { title: string; description?: string; variant?: ToastVariant }) {
  const item: ToastItem = { id: ++counter, variant: 'success', ...t }
  if (listener) listener(item)
  else queue.push(item)
}
