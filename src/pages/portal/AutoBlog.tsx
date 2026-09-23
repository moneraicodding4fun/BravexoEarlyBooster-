import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Newspaper, Wand2, Loader2, Save, Rocket, Eye, Search, Tag, FileText, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth'
import { loadDB, mutate, uid, nowIso, getClient, type BlogDraft } from '@/lib/mockDb'
import { generateBlogPost } from '@/lib/aiRouter'
import { toast } from '@/lib/toast'
import { INDUSTRIES, TONES, ROUTES } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'

/** Minimal markdown-ish renderer for generated article previews. */
function ArticleBody({ body }: { body: string }) {
  const blocks = body.split('\n').filter((l) => l.trim() !== '')
  return (
    <div className="bx-prose">
      {blocks.map((line, i) => {
        const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        if (line.startsWith('### ')) return <h3 key={i} dangerouslySetInnerHTML={{ __html: bolded.slice(4) }} />
        if (line.startsWith('## ')) return <h2 key={i} dangerouslySetInnerHTML={{ __html: bolded.slice(3) }} />
        if (line.startsWith('# ')) return <h1 key={i} dangerouslySetInnerHTML={{ __html: bolded.slice(2) }} />
        if (line.startsWith('- '))
          return (
            <li key={i} className="ml-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span dangerouslySetInnerHTML={{ __html: bolded.slice(2) }} />
            </li>
          )
        return <p key={i} dangerouslySetInnerHTML={{ __html: bolded }} />
      })}
    </div>
  )
}

export function AutoBlogPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const db = loadDB()
  const client = getClient(db, session?.clientId)

  const [niche, setNiche] = useState(client?.industry ?? INDUSTRIES[0])
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState(client?.tone ?? TONES[0])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<BlogDraft | null>(null)
  const [saved, setSaved] = useState(false)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender((n) => n + 1)

  const drafts = db.drafts.filter((d) => d.clientId === client?.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  async function generate() {
    if (!topic.trim()) {
      toast({ title: 'Give the engine a topic', description: 'e.g. "Why ceramic coating beats wax".', variant: 'info' })
      return
    }
    setBusy(true)
    setSaved(false)
    try {
      const gen = await generateBlogPost(
        {
          company: client?.company ?? 'Your company',
          website: client?.website,
          niche,
          topic: topic.trim(),
          keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
          tone,
        },
        `Blog post · "${topic.trim().slice(0, 40)}"`,
      )
      setResult({
        id: uid('dft'),
        clientId: client?.id ?? '',
        niche,
        topic: topic.trim(),
        title: gen.blog.title,
        slug: gen.blog.slug,
        metaDescription: gen.blog.metaDescription,
        tags: gen.blog.tags,
        body: gen.blog.body,
        status: 'draft',
        generatedBy: `${gen.providerLabel}${gen.simulated ? '' : ` · ${gen.model}`}`,
        createdAt: nowIso(),
      })
      toast({ title: 'Article drafted', description: `Served by ${gen.providerLabel} in ${gen.latencyMs}ms.`, variant: 'success' })
    } catch {
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  function saveDraft() {
    if (!result || saved) return
    mutate((d) => {
      d.drafts.unshift(result)
    })
    setSaved(true)
    toast({ title: 'Draft saved to library', description: 'Deploy it any time from Bravexo Connect.', variant: 'success' })
    refresh()
  }

  function deleteDraft(id: string) {
    mutate((d) => {
      d.drafts = d.drafts.filter((x) => x.id !== id)
    })
    toast({ title: 'Draft deleted', variant: 'info' })
    refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Auto-Blog Engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Universal headless content engine — generates SEO articles for your niche, ready to deploy anywhere.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        {/* Generator form */}
        <Card className="bx-glass h-fit border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Newspaper className="h-4 w-4 text-emerald-300" /> New article brief
            </CardTitle>
            <CardDescription>The engine drafts title, meta tags and structured body.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Industry / niche</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic *</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder='e.g. "5 detailing myths that ruin paint"' />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kw">Keywords (comma separated)</Label>
              <Input id="kw" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="car detailing, paint protection" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={busy} className="h-11 w-full font-semibold animate-pulse-glow">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? 'Routing to free-tier AI…' : 'Generate SEO article'}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Draft preview</CardTitle>
              <CardDescription>{result ? `Generated by ${result.generatedBy}` : 'Nothing generated yet'}</CardDescription>
            </div>
            {result && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={saveDraft} disabled={saved}>
                  <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save draft'}
                </Button>
                <Button size="sm" onClick={() => saved && navigate(ROUTES.portalConnect, { state: { draftId: result.id } })} disabled={!saved}>
                  <Rocket className="h-4 w-4" /> Deploy
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {busy ? (
                <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-300" />
                  <p className="text-sm">Drafting an SEO-optimized article for “{niche}”…</p>
                </motion.div>
              ) : result ? (
                <motion.div key={result.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Tabs defaultValue="preview">
                    <TabsList>
                      <TabsTrigger value="preview"><Eye className="h-3.5 w-3.5" /> Article</TabsTrigger>
                      <TabsTrigger value="seo"><Search className="h-3.5 w-3.5" /> SEO meta</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-6">
                        <h1 className="font-display text-2xl font-bold leading-snug text-white">{result.title}</h1>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {result.tags.map((t) => (
                            <Badge key={t} variant="muted"><Tag className="h-3 w-3" /> {t}</Badge>
                          ))}
                        </div>
                        <div className="mt-6">
                          <ArticleBody body={result.body} />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="seo">
                      <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-6">
                        {/* SERP preview */}
                        <div className="rounded-lg bg-white p-4">
                          <p className="text-xs text-emerald-700">{(client?.website ?? 'https://example.com').replace(/\/$/, '')}/blog/{result.slug}</p>
                          <p className="mt-0.5 text-lg leading-snug text-blue-700">{result.title}</p>
                          <p className="mt-1 text-sm leading-snug text-zinc-600">{result.metaDescription}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meta description ({result.metaDescription.length}/158)</p>
                          <p className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-200">{result.metaDescription}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Slug</p>
                          <p className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] p-3 font-mono text-xs text-emerald-200">{result.slug}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 opacity-40" />
                  <p className="text-sm max-w-xs">Fill in the brief and hit generate — a full SEO article with meta tags lands here.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Draft library */}
      <Card className="bx-glass border-white/10 bg-transparent">
        <CardHeader>
          <CardTitle className="text-white">Draft library</CardTitle>
          <CardDescription>{drafts.length} article{drafts.length === 1 ? '' : 's'} in this workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {drafts.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{d.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.niche} · {formatDateTime(d.createdAt)} · {d.generatedBy}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.status === 'deployed' ? 'success' : 'muted'}>
                  {d.status === 'deployed' ? `deployed · ${d.deployedTo}` : 'draft'}
                </Badge>
                {d.status === 'draft' && (
                  <Button size="sm" variant="secondary" onClick={() => navigate(ROUTES.portalConnect, { state: { draftId: d.id } })}>
                    <Rocket className="h-3.5 w-3.5" /> Deploy
                  </Button>
                )}
                <button onClick={() => deleteDraft(d.id)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-rose-300" title="Delete draft">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {drafts.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No drafts yet — generate your first article above.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
