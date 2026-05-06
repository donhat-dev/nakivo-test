import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  ChartLineUp,
  CheckCircle,
  ClockCounterClockwise,
  Command,
  Database,
  FileText,
  Gauge,
  LockKey,
  ShieldCheck,
  TrendUp,
  UsersThree,
  Warning,
  XCircle,
} from '@phosphor-icons/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Scenario = 'ready' | 'loading' | 'empty' | 'error'

type Deal = {
  account: string
  owner: string
  stage: string
  value: string
  risk: string
}

type WorkItem = {
  title: string
  note: string
  icon: ReactNode
  className: string
}

const queryClient = new QueryClient()

const navItems = [
  ['Pipeline', '#pipeline'],
  ['Coverage', '#coverage'],
  ['Renewals', '#renewals'],
  ['Close', '#close'],
]

const partnerNames = [
  'Aster North Systems',
  'Kairo Vault Services',
  'Rivenstone Backup',
  'Marlow Data Office',
  'Vossline Storage',
  'Cedar Ledger Group',
  'Lattice Bay MSP',
  'Norvik Recovery Desk',
]

const deals: Deal[] = [
  {
    account: 'Helion Works',
    owner: 'Mira Calder',
    stage: 'Quote review',
    value: '$184.7k',
    risk: 'Margin drift',
  },
  {
    account: 'Oslo Circuit',
    owner: 'Tavian Roe',
    stage: 'Renewal proof',
    value: '$71.4k',
    risk: 'Data gap',
  },
  {
    account: 'Ferroline Health',
    owner: 'Elian Vos',
    stage: 'Partner action',
    value: '$236.2k',
    risk: 'Access hold',
  },
]

const workItems: WorkItem[] = [
  {
    title: 'Scoped account rail',
    note: 'Partner, customer, quote, and invoice boundaries stay visible before every action.',
    icon: <ShieldCheck size={28} weight="duotone" />,
    className: 'lg:col-span-7',
  },
  {
    title: 'Renewal pressure map',
    note: 'Aging deals, proof gaps, and margin movement collect into one work queue.',
    icon: <Gauge size={28} weight="duotone" />,
    className: 'lg:col-span-5',
  },
  {
    title: 'Quote desk state',
    note: 'Draft, blocked, approved, and sent states render with the same surface grammar.',
    icon: <FileText size={28} weight="duotone" />,
    className: 'lg:col-span-4',
  },
  {
    title: 'Customer ledger',
    note: 'Reseller-owned customers read as business records instead of internal IDs.',
    icon: <UsersThree size={28} weight="duotone" />,
    className: 'lg:col-span-4',
  },
  {
    title: 'Sync evidence',
    note: 'Failed API work returns inline recovery detail close to the affected record.',
    icon: <Database size={28} weight="duotone" />,
    className: 'lg:col-span-4',
  },
  {
    title: 'Approval runway',
    note: 'The next commercial step stays attached to its reseller owner and customer scope.',
    icon: <Briefcase size={28} weight="duotone" />,
    className: 'lg:col-span-8',
  },
  {
    title: 'Health pulse',
    note: 'Quiet live signals show which accounts need reseller attention today.',
    icon: <ChartLineUp size={28} weight="duotone" />,
    className: 'lg:col-span-4',
  },
]

const workflow = [
  {
    cue: 'Access',
    title: 'Resolve the acting partner',
    body: 'The portal reads the signed-in user, confirms reseller membership, and builds a scoped domain before records appear.',
    details: ['Reseller flag checked', 'Portal group verified', 'Customer domain assembled'],
  },
  {
    cue: 'Route',
    title: 'Prioritize commercial work',
    body: 'Quotes, renewal proof, and overdue customer activity are grouped by what the reseller can act on next.',
    details: ['Renewal proof requested', 'Quote evidence attached', 'Invoice view prepared'],
  },
  {
    cue: 'State',
    title: 'Return visible state',
    body: 'Every request resolves into loading, empty, error, or complete states without hiding operational uncertainty.',
    details: ['Inline error copy', 'Empty queue guidance', 'Audit-safe completion'],
  },
]

const revealText =
  'The partner portal should feel like a controlled workspace: one account context, one visible queue, and one calm path from reseller signal to revenue action.'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PortalPage />
    </QueryClientProvider>
  )
}

function PortalPage() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.hero-panel',
        { opacity: 0, y: 46, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' },
      )

      gsap.to('.word-reveal', {
        opacity: 1,
        y: 0,
        stagger: 0.035,
        ease: 'none',
        scrollTrigger: {
          trigger: '.copy-reveal',
          start: 'top 78%',
          end: 'bottom 42%',
          scrub: true,
        },
      })

      gsap.utils.toArray<HTMLElement>('.scale-fade').forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.24, scale: 0.86, y: 72 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              end: 'top 34%',
              scrub: true,
            },
          },
        )
      })

      const media = gsap.matchMedia()

      media.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: '.workflow-grid',
          start: 'top 92px',
          end: 'bottom bottom',
          pin: '.workflow-pin',
          pinSpacing: false,
        })
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <main
      ref={scope}
      className="relative min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-capsule-canvas font-sans text-capsule-ink"
    >
      <div className="mono-blur-field" />
      <div className="paper-noise" />
      <Navigation />
      <Hero />
      <Interest />
      <Reveal />
      <Desire />
      <ActionFooter />
    </main>
  )
}

function Navigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] items-center gap-4 rounded-full border border-capsule-line/80 bg-capsule-paper/72 px-4 py-3 shadow-capsule backdrop-blur-xl lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-capsule-ink text-capsule-paper">
            <Command size={17} weight="bold" />
          </span>
          Mono Capsule
        </a>
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-capsule-line bg-capsule-canvas/70 p-1">
            {navItems.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="inline-flex min-h-10 items-center rounded-full px-4 text-sm text-capsule-mute transition duration-300 hover:bg-capsule-paper hover:text-capsule-ink active:-translate-y-px"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href="#close"
          className="justify-self-end rounded-full bg-capsule-ink px-5 py-3 text-sm font-semibold text-capsule-paper transition duration-300 hover:bg-capsule-mute active:-translate-y-px"
        >
          Review queue
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-12 px-4 pb-20 pt-32 md:pt-40 lg:grid-cols-[1.36fr_0.64fr] lg:px-6"
    >
      <div className="relative z-10 max-w-[960px]">
        <p className="mb-8 max-w-xl text-base leading-7 text-capsule-mute">
          A SaaS partner portal concept for reseller-owned pipeline, renewal proof, customer scope,
          and visible recovery states.
        </p>
        <h1 className="max-w-6xl text-[clamp(2.65rem,4.9vw,4.8rem)] font-semibold leading-[0.95] tracking-tight">
          Command partner revenue through a scoped{' '}
          <span
            aria-hidden="true"
            className="mx-2 inline-block h-10 w-24 overflow-hidden rounded-full align-middle md:h-12 md:w-32"
          >
            <img
              src="https://picsum.photos/seed/partner-ledger/320/180"
              alt=""
              className="h-full w-full object-cover grayscale contrast-125"
            />
          </span>{' '}
          capsule.
        </h1>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#pipeline"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-capsule-ink px-6 py-3 text-sm font-semibold text-capsule-paper transition duration-300 hover:bg-capsule-mute active:-translate-y-px"
          >
            Open pipeline
            <ArrowRight size={16} weight="bold" />
          </a>
          <a
            href="#coverage"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-capsule-ink bg-capsule-paper px-6 py-3 text-sm font-semibold text-capsule-ink transition duration-300 hover:bg-capsule-wash active:-translate-y-px"
          >
            Check access scope
          </a>
        </div>
      </div>
      <div className="hero-panel scale-fade rounded-[2rem] border border-capsule-line bg-capsule-paper/82 p-3 shadow-capsule backdrop-blur-xl md:rounded-[2.5rem] lg:-ml-40">
        <div className="overflow-hidden rounded-[1.5rem] border border-capsule-line bg-capsule-ink text-capsule-paper md:rounded-[2rem]">
          <div className="grid gap-px bg-capsule-paper/10 lg:grid-cols-[0.72fr_1fr]">
            <aside className="bg-capsule-ink p-5 md:p-7">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-xs text-capsule-smoke">reseller scope</span>
                <LockKey size={17} weight="bold" />
              </div>
              {['Pipeline', 'Renewal desk', 'Invoices', 'Customers'].map((item, index) => (
                <div
                  key={item}
                  className="mb-2 flex items-center justify-between rounded-2xl border border-capsule-paper/10 bg-capsule-paper/[0.04] px-4 py-3 text-sm"
                >
                  <span>{item}</span>
                  <span className="font-mono text-xs text-capsule-smoke">
                    {index === 0 ? '47' : index === 1 ? '12' : index === 2 ? '31' : '86'}
                  </span>
                </div>
              ))}
            </aside>
            <div className="bg-capsule-paper p-5 text-capsule-ink md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-capsule-mute">Revenue desk</p>
                  <h2 className="text-2xl font-semibold tracking-tight">Partner queue</h2>
                </div>
                <span className="rounded-full bg-capsule-wash px-3 py-1 font-mono text-xs">
                  live
                </span>
              </div>
              <div className="portal-shell-line mb-5 h-px w-full animate-tracePulse" />
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div
                    key={deal.account}
                    className="rounded-3xl border border-capsule-line bg-capsule-canvas/70 p-4 transition duration-300 hover:-translate-y-1 hover:bg-capsule-paper"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{deal.account}</p>
                        <p className="text-sm text-capsule-mute">{deal.owner}</p>
                      </div>
                      <span className="font-mono text-sm">{deal.value}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-capsule-paper px-3 py-1 text-capsule-mute">
                        {deal.stage}
                      </span>
                      <span className="rounded-full border border-capsule-line px-3 py-1 text-capsule-mute">
                        {deal.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Interest() {
  return (
    <section id="pipeline" className="relative mx-auto max-w-[1400px] px-4 py-28 md:py-40 lg:px-6">
      <div className="mb-12 grid gap-8 lg:grid-cols-[0.78fr_1fr]">
        <h2 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
          Operational modules with no missing corners.
        </h2>
        <p className="max-w-2xl self-end text-lg leading-8 text-capsule-mute">
          The portal frames reseller work around account ownership, quote health, renewal proof,
          and recoverable data states. Each surface uses the same muted capsule rhythm.
        </p>
      </div>
      <div className="grid-flow-dense grid gap-4 lg:grid-cols-12">
        {workItems.map((item) => (
          <article
            key={item.title}
            className={`group scale-fade overflow-hidden rounded-[1.75rem] border border-capsule-line bg-capsule-paper/76 p-6 shadow-capsule backdrop-blur-lg transition duration-700 hover:-translate-y-1 hover:bg-capsule-paper active:scale-[0.99] md:p-8 ${item.className}`}
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-full bg-capsule-canvas text-capsule-ink transition duration-700 group-hover:scale-105">
                {item.icon}
              </span>
              <ArrowRight
                size={18}
                weight="bold"
                className="text-capsule-mute transition duration-700 group-hover:translate-x-1 group-hover:text-capsule-ink"
              />
            </div>
            <h3 className="max-w-2xl text-2xl font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-4 max-w-2xl leading-7 text-capsule-mute">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Reveal() {
  const words = revealText.split(' ')

  return (
    <section id="coverage" className="copy-reveal relative mx-auto max-w-[1400px] px-4 py-28 md:py-44 lg:px-6">
      <p className="max-w-6xl text-[clamp(2.15rem,4.6vw,5rem)] font-semibold leading-[1.02] tracking-tight">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="word-reveal mr-[0.22em]">
            {word}
          </span>
        ))}
      </p>
    </section>
  )
}

function Desire() {
  return (
    <section id="renewals" className="relative mx-auto max-w-[1400px] px-4 py-28 md:py-44 lg:px-6">
      <div className="workflow-grid grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
        <div className="workflow-pin self-start">
          <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
            One flow from access check to action.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-capsule-mute">
            Scroll motion keeps attention on the current step while the right rail shows how the
            partner portal resolves ownership, work priority, and response state.
          </p>
        </div>
        <div className="space-y-6">
          {workflow.map((step, index) => (
            <article
              key={step.title}
              className="group scale-fade rounded-[2rem] border border-capsule-line bg-capsule-paper/78 p-6 shadow-capsule backdrop-blur-xl md:p-8"
            >
              <div className="mb-8 h-64 overflow-hidden rounded-[1.35rem] bg-capsule-ink md:h-80">
                <img
                  src={`https://picsum.photos/seed/mono-capsule-${index}/1100/720`}
                  alt=""
                  className="h-full w-full object-cover opacity-70 grayscale contrast-125 transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-[0.8fr_1fr]">
                <div>
                  <span className="font-mono text-sm text-capsule-mute">
                    {step.cue}
                  </span>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight">{step.title}</h3>
                </div>
                <div>
                  <p className="leading-7 text-capsule-mute">{step.body}</p>
                  <div className="mt-6 grid gap-3">
                    {step.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-center gap-3 rounded-2xl border border-capsule-line bg-capsule-canvas/62 px-4 py-3 text-sm"
                      >
                        <CheckCircle size={17} weight="duotone" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <PartnerAccordion />
      <PartnerMarquee />
      <StatePanel />
    </section>
  )
}

function PartnerAccordion() {
  const slices = [
    {
      title: 'Pipeline hygiene',
      body: 'Open quotes are grouped by reseller owner and next proof request.',
      image: 'https://picsum.photos/seed/pipeline-hygiene/900/1200',
    },
    {
      title: 'Renewal coverage',
      body: 'Commercial risk stays readable without flooding the dashboard.',
      image: 'https://picsum.photos/seed/renewal-coverage/900/1200',
    },
    {
      title: 'Customer context',
      body: 'Linked customers show only records that belong to the active reseller scope.',
      image: 'https://picsum.photos/seed/customer-context/900/1200',
    },
  ]

  return (
    <div className="mt-28 scale-fade rounded-[2rem] border border-capsule-line bg-capsule-paper/72 p-3 shadow-capsule backdrop-blur-xl">
      <div className="grid gap-3 md:grid-cols-3">
        {slices.map((slice) => (
          <article
            key={slice.title}
            className="group min-h-[26rem] overflow-hidden rounded-[1.5rem] bg-capsule-ink text-capsule-paper"
          >
            <img
              src={slice.image}
              alt=""
              className="h-64 w-full object-cover opacity-62 grayscale contrast-125 transition duration-700 group-hover:scale-105 md:h-72"
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold tracking-tight">{slice.title}</h3>
              <p className="mt-4 leading-7 text-capsule-smoke">{slice.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function PartnerMarquee() {
  const doubledPartners = [...partnerNames, ...partnerNames]

  return (
    <div className="mt-20 overflow-hidden border-y border-capsule-line py-6">
      <div className="flex w-max animate-capsuleMarquee items-center gap-10">
        {doubledPartners.map((partner, index) => (
          <span
            key={`${partner}-${index}`}
            className="flex items-center gap-4 whitespace-nowrap text-2xl font-semibold tracking-tight text-capsule-mute md:text-4xl"
          >
            <span className="grid size-10 place-items-center rounded-full border border-capsule-line bg-capsule-paper">
              <TrendUp size={18} weight="bold" />
            </span>
            {partner}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatePanel() {
  const [scenario, setScenario] = useState<Scenario>('ready')
  const { data, isFetching, isError } = useQuery({
    queryKey: ['partner-queue', scenario],
    queryFn: () => loadScenario(scenario),
    retry: false,
    staleTime: 1000,
  })

  const visibleState: Scenario = isFetching ? 'loading' : isError ? 'error' : data?.state ?? 'ready'
  const items = data?.items ?? []

  return (
    <section className="mt-28 scale-fade rounded-[2rem] border border-capsule-line bg-capsule-paper/82 p-6 shadow-capsule backdrop-blur-xl md:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Request states stay visible.</h2>
          <p className="mt-5 max-w-xl leading-7 text-capsule-mute">
            The same portal surface handles loading, empty, error, and populated states so resellers
            know whether to wait, recover, or continue.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(['ready', 'loading', 'empty', 'error'] satisfies Scenario[]).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setScenario(state)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 active:-translate-y-px ${
                  scenario === state
                    ? 'border-capsule-ink bg-capsule-ink text-capsule-paper'
                    : 'border-capsule-line bg-capsule-canvas text-capsule-ink hover:bg-capsule-paper'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-capsule-line bg-capsule-canvas/70 p-4">
          {visibleState === 'loading' && <LoadingQueue />}
          {visibleState === 'error' && <ErrorQueue />}
          {visibleState === 'empty' && <EmptyQueue />}
          {visibleState === 'ready' && (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-capsule-paper px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <CalendarCheck size={20} weight="duotone" />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-capsule-mute">{item.detail}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm">{item.when}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function LoadingQueue() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl bg-capsule-paper p-4">
          <div className="h-4 w-2/5 animate-pulse rounded-full bg-capsule-wash" />
          <div className="mt-3 h-3 w-4/5 animate-pulse rounded-full bg-capsule-wash" />
          <div className="mt-3 h-3 w-3/5 animate-pulse rounded-full bg-capsule-wash" />
        </div>
      ))}
    </div>
  )
}

function EmptyQueue() {
  return (
    <div className="grid min-h-80 place-items-center rounded-2xl bg-capsule-paper p-8 text-center">
      <div>
        <ClockCounterClockwise className="mx-auto text-capsule-mute" size={42} weight="duotone" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight">No partner actions waiting</h3>
        <p className="mx-auto mt-3 max-w-sm leading-7 text-capsule-mute">
          New quote requests, renewal proof gaps, and invoice notes will appear here after sync.
        </p>
      </div>
    </div>
  )
}

function ErrorQueue() {
  return (
    <div className="rounded-2xl border border-capsule-ink bg-capsule-paper p-6">
      <div className="flex items-start gap-4">
        <XCircle size={28} weight="duotone" />
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Scope check could not finish</h3>
          <p className="mt-3 leading-7 text-capsule-mute">
            The portal kept the queue closed because reseller ownership could not be confirmed for
            this request.
          </p>
          <button
            type="button"
            className="mt-5 rounded-full bg-capsule-ink px-5 py-3 text-sm font-semibold text-capsule-paper transition duration-300 hover:bg-capsule-mute active:-translate-y-px"
          >
            Retry scope check
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionFooter() {
  const footerStats = useMemo(
    () => [
      ['47.2%', 'quotes reviewed before margin approval'],
      ['18', 'partner actions due this week'],
      ['$492.3k', 'renewal coverage under watch'],
    ],
    [],
  )

  return (
    <footer id="close" className="relative mx-auto max-w-[1400px] px-4 py-28 md:py-40 lg:px-6">
      <div className="rounded-[2.25rem] bg-capsule-ink p-6 text-capsule-paper shadow-capsule md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <h2 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
              Give resellers a narrower, calmer path to revenue.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-capsule-smoke">
              The capsule keeps the portal product-like: clear ownership, visible state, careful
              hierarchy, and light motion that supports the work.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#top"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-capsule-paper px-6 py-3 text-sm font-semibold text-capsule-ink transition duration-300 hover:bg-capsule-wash active:-translate-y-px"
              >
                Back to start
                <ArrowRight size={16} weight="bold" />
              </a>
              <a
                href="#pipeline"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-capsule-paper/24 px-6 py-3 text-sm font-semibold text-capsule-paper transition duration-300 hover:bg-capsule-paper/10 active:-translate-y-px"
              >
                Inspect modules
              </a>
            </div>
          </div>
          <div className="grid content-end gap-4">
            {footerStats.map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-capsule-paper/12 bg-capsule-paper/[0.04] p-5">
                <p className="font-mono text-3xl">{value}</p>
                <p className="mt-2 text-capsule-smoke">{label}</p>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-3xl border border-capsule-paper/12 bg-capsule-paper/[0.04] p-5">
              <Warning size={24} weight="duotone" />
              <span className="text-capsule-smoke">Risk copy stays visible before a destructive action.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

async function loadScenario(scenario: Scenario) {
  await new Promise((resolve) => window.setTimeout(resolve, scenario === 'loading' ? 900 : 260))

  if (scenario === 'error') {
    throw new Error('Scope check failed')
  }

  if (scenario === 'empty') {
    return { state: 'empty' as const, items: [] }
  }

  return {
    state: 'ready' as const,
    items: [
      {
        title: 'Approve renewal proof',
        detail: 'Helion Works needs signed storage evidence',
        when: '09:40',
      },
      {
        title: 'Review quote margin',
        detail: 'Oslo Circuit moved below approval threshold',
        when: '11:15',
      },
      {
        title: 'Confirm customer link',
        detail: 'Ferroline Health has a pending reseller mapping',
        when: '14:20',
      },
    ],
  }
}

export default App
