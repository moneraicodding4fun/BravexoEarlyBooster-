import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { registerToaster, type ToastItem } from '@/lib/toast'
import { cn } from '@/lib/utils'

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const ACCENT = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-sky-400',
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    return registerToaster((t) => {
      setItems((prev) => [...prev.slice(-3), t])
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id))
      }, 4200)
    })
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(380px,calc(100vw-2.5rem))] flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {items.map((t) => {
          const Icon = ICONS[t.variant]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-[#0c1411]/95 p-3.5 pr-9 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-[3px]',
                  t.variant === 'success' && 'bg-emerald-400',
                  t.variant === 'error' && 'bg-rose-400',
                  t.variant === 'info' && 'bg-sky-400',
                )}
              />
              <Icon className={cn('mt-0.5 h-4.5 w-4.5 h-5 w-5 shrink-0', ACCENT[t.variant])} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{t.description}</p>}
              </div>
              <button
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="absolute right-2 top-2 rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
