import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  MoreHorizontal,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Globe,
  UserCheck,
  Ban,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { loadDB, mutate, uid, nowIso, openInviteFor, inviteUrl, type ClientWorkspace, type ClientStatus } from '@/lib/mockDb'
import { useAuth } from '@/lib/auth'
import { toast } from '@/lib/toast'
import { copyToClipboard, timeAgo } from '@/lib/utils'
import { INDUSTRIES, TONES } from '@/lib/constants'

const STATUS_META: Record<ClientStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' }> = {
  active: { label: 'Active', variant: 'success' },
  onboarding: { label: 'Onboarding', variant: 'info' },
  invited: { label: 'Invited', variant: 'warning' },
  suspended: { label: 'Suspended', variant: 'muted' },
}

interface InviteForm {
  contactName: string
  email: string
  company: string
  website: string
  industry: string
  tone: string
}

const EMPTY_FORM: InviteForm = { contactName: '', email: '', company: '', website: '', industry: INDUSTRIES[0], tone: TONES[0] }

export function ClientsPage() {
  const { session } = useAuth()
  const [, forceRender] = useState(0)
  const refresh = () => forceRender((n) => n + 1)
  const db = loadDB()

  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [form, setForm] = useState<InviteForm>(EMPTY_FORM)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClientWorkspace | null>(null)
  const [sitesTarget, setSitesTarget] = useState<ClientWorkspace | null>(null)
  const [newSite, setNewSite] = useState({ platform: 'WordPress', url: '' })

  const clients = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = [...db.clients].sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
    if (!q) return rows
    return rows.filter((c) => [c.company, c.email, c.industry, c.contactName, c.website].join(' ').toLowerCase().includes(q))
  }, [db.clients, query])

  function createInvite(e: FormEvent) {
    e.preventDefault()
    const token = `bx-inv-${Math.random().toString(36).slice(2, 10)}`
    mutate((d) => {
      const client: ClientWorkspace = {
        id: uid('cli'),
        company: form.company.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        industry: form.industry,
        tone: form.tone,
        status: 'invited',
        connectedSites: [],
        createdAt: nowIso(),
        lastActivity: nowIso(),
      }
      d.clients.push(client)
      d.invites.push({
        id: uid('inv'),
        token,
        clientId: client.id,
        email: form.email.trim() || undefined,
        createdBy: session?.userId ?? 'admin',
        used: false,
        revoked: false,
        createdAt: nowIso(),
      })
    })
    setCreatedLink(inviteUrl(token))
    toast({ title: 'Client workspace created', description: `${form.company} — single-use invite link generated.`, variant: 'success' })
    refresh()
  }

  function resetInviteDialog() {
    setInviteOpen(false)
    setCreatedLink(null)
    setForm(EMPTY_FORM)
    setCopied(false)
  }

  async function copyInvite(clientId: string) {
    const invite = openInviteFor(loadDB(), clientId)
    if (!invite) {
      toast({ title: 'No open invite', description: 'Generate a fresh link from the row menu.', variant: 'info' })
      return
    }
    const ok = await copyToClipboard(inviteUrl(invite.token))
    toast(ok ? { title: 'Invite link copied', description: 'Single-use — it expires after first redemption.', variant: 'success' } : { title: 'Copy failed', variant: 'error' })
  }

  function regenerateInvite(clientId: string) {
    mutate((d) => {
      d.invites.forEach((i) => {
        if (i.clientId === clientId && !i.used) i.revoked = true
      })
      d.invites.push({
        id: uid('inv'),
        token: `bx-inv-${Math.random().toString(36).slice(2, 10)}`,
        clientId,
        createdBy: session?.userId ?? 'admin',
        used: false,
        revoked: false,
        createdAt: nowIso(),
      })
    })
    toast({ title: 'New invite link issued', description: 'Previous unused links were revoked.', variant: 'success' })
    refresh()
  }

  function setStatus(clientId: string, status: ClientStatus) {
    mutate((d) => {
      const c = d.clients.find((x) => x.id === clientId)
      if (c) {
        c.status = status
        c.lastActivity = nowIso()
      }
    })
    toast({ title: 'Workspace updated', description: `Status set to ${STATUS_META[status].label}.`, variant: 'success' })
    refresh()
  }

  function deleteClient(clientId: string) {
    const target = db.clients.find((c) => c.id === clientId)
    mutate((d) => {
      d.clients = d.clients.filter((c) => c.id !== clientId)
      d.invites = d.invites.filter((i) => i.clientId !== clientId)
      d.users = d.users.filter((u) => u.clientId !== clientId)
      d.drafts = d.drafts.filter((x) => x.clientId !== clientId)
      d.reviews = d.reviews.filter((x) => x.clientId !== clientId)
      d.deployments = d.deployments.filter((x) => x.clientId !== clientId)
    })
    setDeleteTarget(null)
    toast({ title: 'Workspace deleted', description: `${target?.company ?? 'Client'} and all its data were removed.`, variant: 'success' })
    refresh()
  }

  function addSite() {
    if (!sitesTarget || !newSite.url.trim()) return
    mutate((d) => {
      const c = d.clients.find((x) => x.id === sitesTarget.id)
      if (c) c.connectedSites.push({ id: uid('site'), platform: newSite.platform, url: newSite.url.trim(), status: 'dry-run' })
    })
    const updated = loadDB().clients.find((c) => c.id === sitesTarget.id)
    setSitesTarget(updated ?? null)
    setNewSite({ platform: 'WordPress', url: '' })
    toast({ title: 'Website connected', description: `${newSite.platform} target added in dry-run mode.`, variant: 'success' })
    refresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Client Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Onboard companies from any industry into isolated portals.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="bg-white font-semibold text-zinc-950 hover:bg-zinc-200">
          <Plus className="h-4 w-4" /> Invite User
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search company, contact, industry…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <Card className="bx-glass border-white/10 bg-transparent">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Websites</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invite</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c, i) => {
                const invite = openInviteFor(db, c.id)
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{c.company}</p>
                        <p className="text-xs text-muted-foreground">{c.contactName} · {c.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted">{c.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => setSitesTarget(c)} className="inline-flex items-center gap-1.5 text-sm text-zinc-300 transition-colors hover:text-emerald-300">
                        <Globe className="h-3.5 w-3.5" />
                        {c.connectedSites.length === 0 ? 'Connect' : `${c.connectedSites.length} connected`}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_META[c.status].variant}>{STATUS_META[c.status].label}</Badge>
                    </TableCell>
                    <TableCell>
                      {invite ? (
                        <button onClick={() => copyInvite(c.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200">
                          <Link2 className="h-3.5 w-3.5" /> Copy link
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">redeemed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(c.lastActivity)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invite && (
                            <DropdownMenuItem onClick={() => copyInvite(c.id)}>
                              <Copy /> Copy invite link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => regenerateInvite(c.id)}>
                            <RefreshCw /> {invite ? 'Regenerate link' : 'Issue new link'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {c.status !== 'active' && (
                            <DropdownMenuItem onClick={() => setStatus(c.id, 'active')}>
                              <UserCheck /> Mark active
                            </DropdownMenuItem>
                          )}
                          {c.status === 'active' && (
                            <DropdownMenuItem onClick={() => setStatus(c.id, 'suspended')}>
                              <Ban /> Suspend workspace
                            </DropdownMenuItem>
                          )}
                          {c.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => setStatus(c.id, 'onboarding')}>
                              <RefreshCw /> Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-300 focus:text-rose-200" onClick={() => setDeleteTarget(c)}>
                            <Trash2 /> Delete workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No workspaces match your search.
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------- Invite dialog ---------------- */}
      <Dialog open={inviteOpen} onOpenChange={(o) => !o && resetInviteDialog()}>
        <DialogContent className="max-w-xl">
          {createdLink ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-emerald-300" /> Invite ready
                </DialogTitle>
                <DialogDescription>
                  Send this single-use link to your client. It activates their isolated workspace and expires on first use.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Input readOnly value={createdLink} className="font-mono text-xs" />
                <Button
                  onClick={async () => {
                    const ok = await copyToClipboard(createdLink)
                    setCopied(ok)
                    toast(ok ? { title: 'Invite link copied to clipboard', variant: 'success' } : { title: 'Copy failed', variant: 'error' })
                  }}
                  variant={copied ? 'secondary' : 'default'}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={resetInviteDialog}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={createInvite}>
              <DialogHeader>
                <DialogTitle className="text-white">Invite a new client</DialogTitle>
                <DialogDescription>
                  Creates an isolated workspace and a secure, single-use onboarding link.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-company">Company *</Label>
                  <Input id="inv-company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Studio" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-contact">Contact person</Label>
                  <Input id="inv-contact" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Jane Cooper" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-email">Client email</Label>
                  <Input id="inv-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-web">Website</Label>
                  <Input id="inv-web" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://acme.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Brand tone</Label>
                  <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={resetInviteDialog}>Cancel</Button>
                <Button type="submit">
                  <Sparkles className="h-4 w-4" /> Generate workspace & invite
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete confirm ---------------- */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete {deleteTarget?.company}?</DialogTitle>
            <DialogDescription>
              This permanently removes the workspace, its users, invites, drafts and deploy history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteClient(deleteTarget.id)}>
              <Trash2 className="h-4 w-4" /> Delete workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Connected sites ---------------- */}
      <Dialog open={Boolean(sitesTarget)} onOpenChange={(o) => !o && setSitesTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Connected websites · {sitesTarget?.company}</DialogTitle>
            <DialogDescription>Targets that Bravexo Connect can deploy content to.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {sitesTarget?.connectedSites.length === 0 && <p className="text-sm text-muted-foreground">No websites connected yet.</p>}
            {sitesTarget?.connectedSites.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{s.platform}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === 'connected' ? 'success' : s.status === 'error' ? 'destructive' : 'info'}>{s.status}</Badge>
                  <button
                    onClick={() => {
                      mutate((d) => {
                        const c = d.clients.find((x) => x.id === sitesTarget.id)
                        if (c) c.connectedSites = c.connectedSites.filter((x) => x.id !== s.id)
                      })
                      setSitesTarget(loadDB().clients.find((c) => c.id === sitesTarget.id) ?? null)
                      toast({ title: 'Website disconnected', variant: 'info' })
                      refresh()
                    }}
                    className="rounded p-1 text-muted-foreground hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-[140px_1fr]">
              <Select value={newSite.platform} onValueChange={(v) => setNewSite({ ...newSite, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['WordPress', 'Webflow', 'Shopify', 'Custom / Lovable'].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="https://webhook-url…" value={newSite.url} onChange={(e) => setNewSite({ ...newSite, url: e.target.value })} />
            </div>
            <Button onClick={addSite} disabled={!newSite.url.trim()}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
