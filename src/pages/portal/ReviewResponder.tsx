import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, Wand2, Copy, Check, RotateCcw, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { loadDB, mutate, uid, nowIso, getClient } from '@/lib/mockDb'
import { generateReviewResponse } from '@/lib/aiRouter'
import { toast } from '@/lib/toast'
import { copyToClipboard } from '@/lib/utils'
import { TONES } from '@/lib/constants'

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
          <Star className={n <= value ? 'fill-amber-400 text-amber-400 h-6 w-6' : 'text-white/20 h-6 w-6'} />
        </button>
      ))}
    </div>
  )
}

export function ReviewResponder() {
  const { session } = useAuth()
  const db = loadDB()
  const client = getClient(db, session?.clientId)

  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [customerName, setCustomerName] = useState('')
  const [tone, setTone] = useState(client?.tone ?? TONES[0])
  const [note, setNote] = useState('')

  const [busy, setBusy] = useState(false)
  const [response, setResponse] = useState('')
  const [copied, setCopied] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender((n) => n + 1)

  async function generate() {
    if (!review.trim()) {
      toast({ title: 'Paste a review first', description: 'Add the customer review you want to reply to.', variant: 'info' })
      return
    }
    setBusy(true)
    setCopied(false)
    try {
      const result = await generateReviewResponse(
        { company: client?.company ?? 'Your company', review: review.trim(), rating, tone, customerName: customerName.trim() || undefined, note: note.trim() || undefined },
        `Review response · ${client?.company ?? 'Client'}`,
      )
      setResponse(result.response)
      setProvider(`${result.providerLabel}${result.simulated ? ' (local fallback)' : ''}`)
      toast({ title: 'Response generated', description: `Served by ${result.providerLabel} in ${result.latencyMs}ms.`, variant: 'success' })
    } catch {
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    const ok = await copyToClipboard(response)
    setCopied(ok)
    toast(ok ? { title: 'Copied to clipboard', description: 'Paste it straight into your review platform.', variant: 'success' } : { title: 'Copy failed', variant: 'error' })
    window.setTimeout(() => setCopied(false), 1600)
  }

  function saveToHistory() {
    if (!response) return
    mutate((d) => {
      d.reviews.unshift({ id: uid('rev'), clientId: client?.id ?? '', rating, review: review.trim(), response, tone, createdAt: nowIso() })
    })
    toast({ title: 'Saved to history', variant: 'success' })
    refresh()
  }

  const history = db.reviews.filter((r) => r.clientId === client?.id).slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Review Responder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Paste a review, get an on-brand reply matched to {client?.company ?? 'your'} tone.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Input side */}
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-white">Customer review</CardTitle>
            <CardDescription>Set the rating and tone, then generate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review">Review text</Label>
              <Textarea id="review" rows={7} value={review} onChange={(e) => setReview(e.target.value)} placeholder="Paste the customer's review here…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cname">Customer name (optional)</Label>
                <Input id="cname" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Sarah" />
              </div>
              <div className="space-y-1.5">
                <Label>Response tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Extra context (optional)</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. offer a free top-up to make it right" />
            </div>
            <Button onClick={generate} disabled={busy} className="w-full h-11 font-semibold animate-pulse-glow">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? 'Generating…' : 'Generate response'}
            </Button>
          </CardContent>
        </Card>

        {/* Output side */}
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Generated reply</CardTitle>
              <CardDescription>{provider ? `Served by ${provider}` : 'Ready in seconds'}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => { setResponse(''); setProvider(null) }} title="Clear" className="text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={saveToHistory} disabled={!response} title="Save to history" className="text-muted-foreground">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[240px] rounded-xl border border-white/10 bg-black/20 p-4">
              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
                    <p className="text-sm">Routing to the best free-tier model…</p>
                  </motion.div>
                ) : response ? (
                  <motion.p key={response} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">
                    {response}
                  </motion.p>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
                    Your reply will appear here.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button onClick={copy} disabled={!response} className="mt-4 w-full h-11 font-semibold" variant={copied ? 'secondary' : 'default'}>
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-white">Recent replies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: h.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">{h.tone}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{h.review}</p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-200">{h.response}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
