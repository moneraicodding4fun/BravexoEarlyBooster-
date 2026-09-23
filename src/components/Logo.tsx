import { Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_24px_rgba(16,185,129,0.45)]',
        className,
      )}
    >
      <Rocket className="h-[18px] w-[18px] -rotate-45 text-[#04150d]" strokeWidth={2.5} />
    </span>
  )
}

export function LogoWordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-tight text-white">
          Bravexo
          <span className="ml-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            EarlyBooster
          </span>
        </span>
        {sub && <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{sub}</span>}
      </span>
    </span>
  )
}
