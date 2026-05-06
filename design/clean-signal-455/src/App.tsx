import { useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import {
  ArrowUpRight,
  BellRinging,
  Buildings,
  Check,
  Command,
  Database,
  Eye,
  EyeSlash,
  Fingerprint,
  Key,
  ListChecks,
  LockKey,
  Pulse,
  ShieldCheck,
  SidebarSimple,
  Sparkle,
  Warning,
} from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type SignalRow = {
  account: string
  region: string
  state: string
  score: string
}

type PanelState = 'ready' | 'loading' | 'empty' | 'error'
type LoginStatus = 'idle' | 'error' | 'verified'

const signalRows: SignalRow[] = [
  { account: 'Vantage North', region: 'Chicago', state: 'Renewal ready', score: '84.7' },
  { account: 'HelioGrid LATAM', region: 'Austin', state: 'Quote drift', score: '61.3' },
  { account: 'Mirae Systems', region: 'Seattle', state: 'Live sync', score: '92.4' },
  { account: 'Tandem Vault', region: 'Toronto', state: 'Margin review', score: '47.2' },
]

const accordionItems = [
  {
    title: 'Partner health',
    copy: 'Live account signal shows stale contacts, license exposure, and renewal gaps before the pipeline slips.',
    image: 'https://picsum.photos/seed/partner-health-console/1200/900',
  },
  {
    title: 'Deal routing',
    copy: 'Ownership, reseller role, and region signal decide the correct action path without trusting frontend scope.',
    image: 'https://picsum.photos/seed/deal-routing-grid/1200/900',
  },
  {
    title: 'Margin guard',
    copy: 'Quotes surface margin compression and payment risk as operational signal, not decorative dashboard color.',
    image: 'https://picsum.photos/seed/margin-guard-ledger/1200/900',
  },
]

const marquee = ['ACTIVE RESELLERS', 'LIVE RENEWALS', 'HEALTHY SYNC', 'QUOTE CONTROL', 'SCOPE LOCKED']

function App() {
  const root = useRef<HTMLDivElement>(null)
  const pinned = useRef<HTMLElement>(null)
  const scrub = useRef<HTMLElement>(null)
  const isLogin = window.location.pathname === '/login'

  const { data = signalRows } = useQuery({
    queryKey: ['signalRows'],
    queryFn: async () => signalRows,
  })

  useGSAP(
    () => {
      gsap.to('.reveal', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      })

      if (pinned.current) {
        ScrollTrigger.create({
          trigger: pinned.current,
          start: 'top 12%',
          end: 'bottom 85%',
          pin: '.pin-title',
          pinSpacing: false,
        })

        gsap.utils.toArray<HTMLElement>('.scale-card').forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.3, scale: 0.88, y: 70 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              ease: 'power3.out',
              immediateRender: false,
              scrollTrigger: {
                trigger: card,
                start: 'top 82%',
                end: 'top 34%',
                scrub: 0.8,
              },
            },
          )
        })
      }

      if (scrub.current) {
        gsap.to('.signal-word', {
          opacity: 1,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrub.current,
            start: 'top 74%',
            end: 'bottom 42%',
            scrub: 0.7,
          },
        })
      }
    },
    { scope: root },
  )

  return (
    <main ref={root} className="relative w-full max-w-full overflow-x-hidden text-signal-ink">
      <div className="signal-noise pointer-events-none fixed inset-0" />
      {isLogin ? (
        <LoginPage />
      ) : (
        <>
          <Navigation />
          <Hero />
          <SignalMarquee />
          <InterestBento rows={data} />
          <HorizontalAccordions />
          <PinnedSignalSection refNode={pinned} />
          <ScrubbedPromise refNode={scrub} />
          <ActionFooter />
        </>
      )}
    </main>
  )
}

function Navigation() {
  const [open, setOpen] = useState(false)
  const navItems = ['Console', 'Signal', 'Routing', 'Access']

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-4 pt-5">
        <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between border border-white/80 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-44px_rgba(16,24,39,0.8)] backdrop-blur-2xl">
          <a href="#" className="flex items-center gap-3 text-sm font-bold tracking-[-0.02em]">
            <span className="grid size-8 place-items-center bg-signal-blue text-white">
              <Pulse size={17} weight="bold" />
            </span>
            SignalOps
          </a>
          <div className="hidden items-center gap-8 text-[13px] font-semibold text-signal-muted md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-signal-ink">
                {item}
              </a>
            ))}
            <a href="/login" className="bg-signal-ink px-4 py-2 text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
              Sign in
            </a>
          </div>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="relative size-10 border border-signal-line bg-signal-wash transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
          >
            <span className={`absolute left-2.5 top-[15px] h-0.5 w-5 bg-signal-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-1 rotate-45' : ''}`} />
            <span className={`absolute left-2.5 top-[23px] h-0.5 w-5 bg-signal-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? '-translate-y-1 -rotate-45' : ''}`} />
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-20 bg-white/88 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto flex min-h-[100dvh] max-w-[1120px] flex-col justify-end px-6 pb-16 pt-32">
          {navItems.map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className={`border-t border-signal-line py-6 text-[clamp(2.8rem,9vw,6.8rem)] font-bold leading-none tracking-[-0.06em] text-signal-ink transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: `${100 + index * 70}ms` }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

function Hero() {
  return (
    <section id="console" className="relative min-h-[100dvh] overflow-hidden px-4 pb-24 pt-36 md:px-8 md:pb-32">
      <div className="mx-auto grid w-full max-w-[1400px] min-w-0 items-end gap-12 md:grid-cols-[1.18fr_0.82fr]">
        <div className="reveal min-w-0">
          <p className="mb-8 max-w-[640px] text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">
            clean-signal-455
          </p>
          <h1 className="max-w-full text-[clamp(2.72rem,12vw,6.2rem)] font-bold leading-[0.88] tracking-[-0.07em] [text-wrap:balance] md:max-w-[1040px] md:text-[clamp(3.1rem,7vw,6.2rem)]">
            Partner revenue with live{' '}
            <span
              aria-hidden="true"
              className="mx-2 inline-block h-[0.55em] w-[1.4em] translate-y-[0.08em] bg-cover bg-center align-baseline grayscale contrast-125"
              style={{ backgroundImage: 'url(https://picsum.photos/seed/live-signal-ledger/420/180)' }}
            />
            account signal.
          </h1>
          <p className="mt-8 w-full max-w-[720px] text-lg leading-8 text-signal-muted">
            A sharp reseller command surface for pipeline coverage, renewal health, account ownership,
            and scope-safe actions. Blue carries the primary flow. Green confirms live, healthy state.
          </p>
          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <MagneticButton href="#signal" tone="primary">
              Inspect signal
            </MagneticButton>
            <MagneticButton href="#access" tone="secondary">
              Review access
            </MagneticButton>
          </div>
        </div>

        <div className="reveal bezel group min-w-0 md:translate-y-14">
          <div className="bezel-core overflow-hidden">
            <div className="relative aspect-[4/5] min-h-[520px] bg-signal-ink">
              <img
                src="https://picsum.photos/seed/clean-signal-command/1200/1500"
                alt="Abstract operations console with high contrast signal lines"
                className="size-full object-cover opacity-80 grayscale contrast-125 transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,39,0.06),rgba(16,24,39,0.74))]" />
              <div className="absolute inset-x-5 bottom-5 border border-white/16 bg-white/9 p-5 text-white backdrop-blur-xl">
                <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/68">
                  <span>Live sync</span>
                  <span className="flex items-center gap-2 text-[#21B799]">
                    <span className="size-2 bg-[#21B799]" />
                    healthy
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {['scope', 'renewal', 'margin'].map((item) => (
                    <div key={item} className="border border-white/14 p-3">
                      <p className="text-white/55">{item}</p>
                      <p className="mt-3 text-xl font-bold">OK</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MagneticButton({ children, href, tone }: { children: string; href: string; tone: 'primary' | 'secondary' }) {
  const primary = tone === 'primary'

  return (
    <a
      href={href}
      className={`group inline-flex w-full items-center justify-between gap-5 px-5 py-3 text-sm font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] sm:w-auto ${
        primary
          ? 'bg-signal-blue text-white shadow-[0_24px_60px_-36px_rgba(0,76,255,0.72)]'
          : 'border border-signal-line bg-white text-signal-ink'
      }`}
    >
      <span>{children}</span>
      <span
        className={`grid size-8 place-items-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${
          primary ? 'bg-white/16' : 'bg-signal-wash'
        }`}
      >
        <ArrowUpRight size={16} weight="bold" />
      </span>
    </a>
  )
}

function SignalMarquee() {
  const items = useMemo(() => [...marquee, ...marquee, ...marquee, ...marquee], [])

  return (
    <section className="max-w-full overflow-hidden border-y border-signal-line bg-white py-4">
      <div className="signal-marquee flex w-max max-w-none items-center gap-10 whitespace-nowrap text-sm font-bold uppercase tracking-[0.18em] text-signal-muted">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            {item}
            <span className="size-2 bg-signal-green" />
          </span>
        ))}
      </div>
    </section>
  )
}

function InterestBento({ rows }: { rows: SignalRow[] }) {
  return (
    <section id="signal" className="px-4 py-28 md:px-8 md:py-44">
      <div className="mx-auto max-w-[1400px]">
        <div className="reveal mb-16 max-w-[900px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-green">Signal density</p>
          <h2 className="mt-5 text-[clamp(2.6rem,5.2vw,5.6rem)] font-bold leading-[0.92] tracking-[-0.065em]">
            Operational data, cut into exact action surfaces.
          </h2>
        </div>

        <div className="grid-flow-dense grid auto-rows-[250px] grid-cols-1 gap-4 md:grid-cols-12">
          <div className="reveal bezel md:col-span-7 md:row-span-2">
            <div className="bezel-core scanline flex h-full flex-col justify-between overflow-hidden p-6 md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal-blue">Reseller pulse</p>
                  <h3 className="mt-4 max-w-[520px] text-3xl font-bold tracking-[-0.04em] md:text-5xl">
                    Accounts ordered by health signal.
                  </h3>
                </div>
                <Database size={30} weight="light" className="text-signal-blue" />
              </div>
              <div className="mt-10 divide-y divide-signal-line">
                {rows.map((row) => (
                  <div key={row.account} className="grid grid-cols-[1fr_auto] gap-4 py-4 md:grid-cols-[1.1fr_0.7fr_0.8fr_auto]">
                    <span className="font-semibold">{row.account}</span>
                    <span className="hidden text-signal-muted md:inline">{row.region}</span>
                    <span className="hidden text-signal-muted md:inline">{row.state}</span>
                    <span className="font-bold tabular-nums text-signal-blue">{row.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PanelStates />

          <div className="reveal bezel md:col-span-3">
            <div className="bezel-core flex h-full flex-col justify-between p-6">
              <ShieldCheck size={30} weight="light" className="text-signal-green" />
              <div>
                <p className="text-5xl font-bold tracking-[-0.06em]">312</p>
                <p className="mt-2 text-sm text-signal-muted">Partner-scoped actions resolved from session identity.</p>
              </div>
            </div>
          </div>

          <div className="reveal bezel md:col-span-2">
            <div className="bezel-core flex h-full flex-col justify-between bg-signal-ink p-6 text-white">
              <BellRinging size={28} weight="light" className="text-signal-green" />
              <p className="text-sm leading-6 text-white/70">Five renewals moved to live review in the last 18 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PanelStates() {
  const [state, setState] = useState<PanelState>('ready')
  const states: PanelState[] = ['ready', 'loading', 'empty', 'error']

  return (
    <div className="reveal bezel md:col-span-5">
      <div className="bezel-core flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal-green">Command state</p>
            <p className="mt-2 text-sm text-signal-muted">Every state is designed, not defaulted.</p>
          </div>
          <Command size={30} weight="light" className="text-signal-blue" />
        </div>
        <div className="my-6 grid grid-cols-4 gap-2">
          {states.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setState(item)}
              className={`px-2 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                state === item ? 'bg-signal-blue text-white' : 'bg-signal-wash text-signal-muted hover:text-signal-ink'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <StatePreview state={state} />
      </div>
    </div>
  )
}

function StatePreview({ state }: { state: PanelState }) {
  if (state === 'loading') {
    return (
      <div className="space-y-3">
        {[92, 78, 58].map((width) => (
          <div key={width} className="h-4 overflow-hidden bg-signal-wash">
            <div className="h-full animate-pulse bg-gradient-to-r from-signal-wash via-white to-signal-wash" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="border border-dashed border-signal-line bg-signal-wash p-5">
        <p className="font-bold">No partner action queued</p>
        <p className="mt-2 text-sm text-signal-muted">Connect a reseller account or import current renewal scope.</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-red-900">
        <div className="flex items-center gap-3 font-bold">
          <Warning size={20} weight="bold" />
          Scope check failed
        </div>
        <p className="mt-2 text-sm">The requested account is outside the current reseller boundary.</p>
      </div>
    )
  }

  return (
    <div className="border border-signal-line bg-white p-5">
      <div className="flex items-center gap-3 font-bold text-signal-ink">
        <Check size={20} weight="bold" className="text-signal-green" />
        Live account signal is healthy
      </div>
      <p className="mt-2 text-sm text-signal-muted">Three quotes, two renewals, and one invoice are ready for action.</p>
    </div>
  )
}

function HorizontalAccordions() {
  return (
    <section id="routing" className="px-4 py-28 md:px-8 md:py-44">
      <div className="mx-auto max-w-[1400px]">
        <div className="reveal mb-14 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <h2 className="text-[clamp(2.4rem,5vw,5.2rem)] font-bold leading-[0.92] tracking-[-0.065em]">
            Signal-first routing for partner work.
          </h2>
          <p className="max-w-[620px] text-lg leading-8 text-signal-muted md:pt-4">
            The green accent never decorates. It confirms live state, validated identity, healthy sync,
            and tasks that can move without ambiguity.
          </p>
        </div>
        <div className="reveal flex min-h-[520px] flex-col gap-4 md:flex-row">
          {accordionItems.map((item, index) => (
            <article
              key={item.title}
              className="group bezel min-h-[340px] flex-1 transition-[flex] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:flex-[1.8]"
            >
              <div className="bezel-core relative h-full overflow-hidden">
                <img
                  src={item.image}
                  alt={`${item.title} operational surface`}
                  className="absolute inset-0 size-full object-cover grayscale contrast-125 transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,39,0.14),rgba(16,24,39,0.86))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#21B799]">0{index + 1}</span>
                  <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em]">{item.title}</h3>
                  <p className="mt-4 max-w-[460px] text-sm leading-6 text-white/72">{item.copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PinnedSignalSection({ refNode }: { refNode: RefObject<HTMLElement | null> }) {
  const cards = [
    {
      icon: SidebarSimple,
      title: 'Session-owned scope',
      copy: 'Reseller identity comes from the authenticated user, not from a frontend payload.',
    },
    {
      icon: ListChecks,
      title: 'Restrictive read path',
      copy: 'Domains narrow the account set before privileged reads or portal-visible actions.',
    },
    {
      icon: Sparkle,
      title: 'Healthy-state language',
      copy: 'Green marks validated, synced, available, and ready. Blue marks the primary action path.',
    },
  ]

  return (
    <section ref={refNode} id="access" className="px-4 py-28 md:px-8 md:py-48">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[0.72fr_1fr]">
        <div className="pin-title h-max">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">Access logic</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,5.2rem)] font-bold leading-[0.92] tracking-[-0.065em]">
            The interface never asks the user to prove ownership.
          </h2>
        </div>
        <div className="space-y-6">
          {cards.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="scale-card bezel">
              <div className="bezel-core grid gap-10 p-7 md:grid-cols-[auto_1fr] md:p-10">
                <div className="grid size-16 place-items-center bg-signal-blue text-white">
                  <Icon size={30} weight="light" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-4 max-w-[620px] text-lg leading-8 text-signal-muted">{copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ScrubbedPromise({ refNode }: { refNode: RefObject<HTMLElement | null> }) {
  const words =
    'Clean signal means every surface has a job. Navigation confirms location. Blue moves work forward. Green confirms trusted state. Borders separate logic. Motion reveals priority without hiding the data.'

  return (
    <section ref={refNode} className="px-4 py-28 md:px-8 md:py-44">
      <div className="mx-auto max-w-[1180px]">
        <p className="reveal text-[clamp(2.1rem,4.5vw,5rem)] font-bold leading-[1.02] tracking-[-0.06em]">
          {words.split(' ').map((word, index) => (
            <span key={`${word}-${index}`} className="signal-word mr-[0.22em] inline-block">
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

function ActionFooter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const hasError = submitted && !email.includes('@')

  return (
    <footer className="px-4 pb-8 md:px-8">
      <div className="mx-auto max-w-[1400px] bg-signal-ink p-6 text-white md:p-12">
        <div className="grid gap-14 md:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-green">Ready state</p>
            <h2 className="mt-5 max-w-[760px] text-[clamp(2.8rem,6vw,6rem)] font-bold leading-[0.88] tracking-[-0.07em]">
              Turn partner work into visible signal.
            </h2>
          </div>
          <form
            className="self-end"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <label htmlFor="work-email" className="block text-sm font-bold text-white">
              Work email
            </label>
            <input
              id="work-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ops.lead@partner.example"
              className="mt-2 w-full border border-white/16 bg-white/8 px-4 py-4 text-white outline-none transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-white/36 focus:border-signal-green"
              aria-describedby="work-email-helper work-email-error"
              aria-invalid={hasError}
            />
            <p id="work-email-helper" className="mt-2 text-sm text-white/56">
              Use a business inbox tied to partner operations.
            </p>
            {hasError ? (
              <p id="work-email-error" className="mt-3 text-sm font-semibold text-red-200">
                Enter a valid email address before requesting access.
              </p>
            ) : null}
            <button
              type="submit"
              className="group mt-6 inline-flex w-full items-center justify-between bg-signal-green px-5 py-3 font-bold text-signal-ink transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              Request signal review
              <span className="grid size-8 place-items-center bg-signal-ink/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                <ArrowUpRight size={16} weight="bold" />
              </span>
            </button>
          </form>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-5 border-t border-white/12 pt-6 text-sm text-white/56 md:flex-row">
          <span>SignalOps Partner Cloud</span>
          <span>Scope, renewal, margin, and access signal in one command surface.</span>
        </div>
      </div>
    </footer>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('ops@vantage.example')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [status, setStatus] = useState<LoginStatus>('idle')

  const emailError = status === 'error' && !email.includes('@')
  const passwordError = status === 'error' && password.length < 10
  const canVerify = !emailError && !passwordError && status === 'verified'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = email.includes('@') && password.length >= 10
    setStatus(valid ? 'verified' : 'error')
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden px-4 py-5 md:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[1400px] flex-col">
        <header className="reveal flex items-center justify-between border border-white/80 bg-white/78 px-4 py-3 shadow-[0_18px_60px_-44px_rgba(16,24,39,0.8)] backdrop-blur-2xl">
          <a href="/" className="flex items-center gap-3 text-sm font-bold tracking-[-0.02em]">
            <span className="grid size-8 place-items-center bg-signal-blue text-white">
              <Pulse size={17} weight="bold" />
            </span>
            SignalOps
          </a>
          <a
            href="/"
            className="border border-signal-line bg-white px-4 py-2 text-sm font-bold text-signal-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            Back to console
          </a>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[0.92fr_1.08fr] md:py-16">
          <div className="reveal min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">Partner access</p>
            <h1 className="mt-6 max-w-[780px] text-[clamp(3rem,7vw,6.4rem)] font-bold leading-[0.88] tracking-[-0.07em] [text-wrap:balance]">
              Sign into a scoped reseller workspace.
            </h1>
            <p className="mt-7 max-w-[620px] text-lg leading-8 text-signal-muted">
              The login surface keeps credential entry quiet and exact. Blue advances authentication.
              Green appears only when the session, device, and reseller boundary are verified.
            </p>

            <div className="mt-10 grid max-w-[680px] gap-3 sm:grid-cols-3">
              {[
                ['Session source', 'request user'],
                ['Device posture', rememberDevice ? 'remembered' : 'single use'],
                ['Scope lock', canVerify ? 'verified' : 'pending'],
              ].map(([label, value]) => (
                <div key={label} className="border border-signal-line bg-white/78 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal-muted">{label}</p>
                  <p className={`mt-4 text-lg font-bold ${value === 'verified' ? 'text-signal-green' : 'text-signal-ink'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal bezel">
            <div className="bezel-core grid min-h-[680px] overflow-hidden md:grid-cols-[0.95fr_1.05fr]">
              <aside className="relative hidden overflow-hidden bg-signal-ink p-8 text-white md:block">
                <img
                  src="https://picsum.photos/seed/secure-reseller-access/1100/1500"
                  alt="Monochrome secure access terminal"
                  className="absolute inset-0 size-full object-cover opacity-44 grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,39,0.24),rgba(16,24,39,0.92))]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="grid size-14 place-items-center bg-white/10 text-signal-green">
                    <Fingerprint size={30} weight="light" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal-green">Access signal</p>
                    <h2 className="mt-4 max-w-[360px] text-4xl font-bold leading-[0.94] tracking-[-0.055em]">
                      Verify the person. Resolve the partner. Then open the work.
                    </h2>
                    <div className="mt-8 divide-y divide-white/12 border border-white/14 bg-white/7">
                      {[
                        ['Identity', 'operator credential'],
                        ['Boundary', 'reseller partner'],
                        ['Audit', 'device and time'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                          <span className="text-white/58">{label}</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex flex-col justify-between p-6 md:p-9">
                <div>
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal-green">Secure sign in</p>
                      <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] md:text-5xl">Access console</h2>
                    </div>
                    <div className="grid size-12 place-items-center bg-signal-blue text-white">
                      <LockKey size={25} weight="light" />
                    </div>
                  </div>

                  <form className="mt-10 space-y-5" noValidate onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="block text-sm font-bold">
                        Work email
                      </label>
                      <div className="relative">
                        <Buildings size={20} weight="light" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-signal-muted" />
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          aria-invalid={emailError}
                          aria-describedby="login-email-helper login-email-error"
                          className="w-full border border-signal-line bg-white py-4 pl-12 pr-4 outline-none transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-signal-blue"
                        />
                      </div>
                      <p id="login-email-helper" className="text-sm text-signal-muted">
                        Use the address assigned to your reseller portal account.
                      </p>
                      {emailError ? (
                        <p id="login-email-error" className="text-sm font-semibold text-red-600">
                          Enter a valid work email.
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="login-password" className="block text-sm font-bold">
                        Password
                      </label>
                      <div className="relative">
                        <Key size={20} weight="light" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-signal-muted" />
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Minimum 10 characters"
                          aria-invalid={passwordError}
                          aria-describedby="login-password-helper login-password-error"
                          className="w-full border border-signal-line bg-white py-4 pl-12 pr-14 outline-none transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-signal-muted/62 focus:border-signal-blue"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-signal-wash text-signal-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95]"
                        >
                          {showPassword ? <EyeSlash size={20} weight="light" /> : <Eye size={20} weight="light" />}
                        </button>
                      </div>
                      <p id="login-password-helper" className="text-sm text-signal-muted">
                        Password is validated locally for this static interface demo.
                      </p>
                      {passwordError ? (
                        <p id="login-password-error" className="text-sm font-semibold text-red-600">
                          Password must contain at least 10 characters.
                        </p>
                      ) : null}
                    </div>

                    <label className="flex items-center justify-between gap-4 border border-signal-line bg-signal-wash p-4">
                      <span>
                        <span className="block text-sm font-bold">Remember this device</span>
                        <span className="mt-1 block text-sm text-signal-muted">Keep the signal warm for repeated operations.</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(event) => setRememberDevice(event.target.checked)}
                        className="size-5 accent-signal-blue"
                      />
                    </label>

                    {status === 'verified' ? (
                      <div className="flex items-start gap-3 border border-signal-green/30 bg-signal-green/10 p-4 text-signal-ink">
                        <Check size={20} weight="bold" className="mt-0.5 shrink-0 text-signal-green" />
                        <p className="text-sm leading-6">
                          Session verified. The reseller workspace can open with a scoped account boundary.
                        </p>
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      className="group inline-flex w-full items-center justify-between bg-signal-blue px-5 py-3 font-bold text-white shadow-[0_24px_60px_-36px_rgba(0,76,255,0.72)] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                    >
                      Continue to workspace
                      <span className="grid size-8 place-items-center bg-white/16 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                        <ArrowUpRight size={16} weight="bold" />
                      </span>
                    </button>
                  </form>
                </div>

                <div className="mt-10 grid gap-3 border-t border-signal-line pt-6 text-sm text-signal-muted sm:grid-cols-2">
                  <a href="/" className="font-bold text-signal-ink transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-signal-blue">
                    Forgot password
                  </a>
                  <a href="/" className="font-bold text-signal-ink transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-signal-blue sm:text-right">
                    Request reseller access
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default App
