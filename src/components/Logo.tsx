import { Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500', className)}>
      <Rocket className="h-4 w-4 -rotate-45 text-zinc-950" strokeWidth={2.5} />
    </span>
  )
}

export function LogoWordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Bravexo
          <span className="ml-1.5 font-normal text-zinc-400">EarlyBooster</span>
        </span>
        {sub && <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{sub}</span>}
      </span>
    </span>
  )
}
