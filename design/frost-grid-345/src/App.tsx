import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  BellSimple,
  CheckCircle,
  Database,
  FileText,
  Gauge,
  MagnifyingGlass,
  ShieldCheck,
  TrendUp,
  UsersThree,
  Warning,
  XCircle,
} from '@phosphor-icons/react'

import './index.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type ModuleCard = {
  title: string
  body: string
  meta: string
  className: string
  icon: ReactNode
}

type WorkflowPanel = {
  title: string
  owner: string
  body: string
  items: string[]
}

const navItems = [
  ['Pipeline', '#pipeline'],
  ['Renewals', '#renewals'],
  ['Customers', '#customers'],
  ['Support', '#support'],
]

const partners = [
  'Northbay Secure',
  'Oslo Archive Group',
  'Kova Ridge',
  'Sable Meridian',
  'Lumen Harbor',
  'Terraline Backup',
  'Vanta Province',
  'Cobalt District',
]

const moduleCards: ModuleCard[] = [
  {
    title: 'Deal routing that keeps ownership intact',
    body: 'Reseller, customer, and quote scope are derived from the signed-in account before any operational surface renders.',
    meta: 'scope first',
    className: 'lg:col-span-7',
    icon: <ShieldCheck size={28} weight="duotone" />,
  },
  {
    title: 'Margin pressure in one command rail',
    body: 'Renewal drift, pending approvals, and support risk sit beside the work queue instead of living in separate tabs.',
    meta: '47.2% reviewed',
    className: 'lg:col-span-5',
    icon: <Gauge size={28} weight="duotone" />,
  },
  {
    title: 'Quote desk',
    body: 'Drafts, approvals, and stale opportunities surface as work, not passive reports.',
    meta: '18 open',
    className: 'lg:col-span-5',
    icon: <FileText size={28} weight="duotone" />,
  },
  {
    title: 'Partner record',
    body: 'Identity, role, and activity remain readable without exposing internal Odoo mechanics.',
    meta: 'reseller view',
    className: 'lg:col-span-3',
    icon: <UsersThree size={28} weight="duotone" />,
  },
  {
    title: 'Data sync',
    body: 'API feedback keeps failures visible, recoverable, and close to the affected record.',
    meta: '02 warnings',
    className: 'lg:col-span-4',
    icon: <Database size={28} weight="duotone" />,
  },
]

const workflowPanels: WorkflowPanel[] = [
  {
    title: 'Verify account scope',
    owner: 'Portal access',
    body: 'The portal resolves the acting partner from the session and only then asks for customer, invoice, and opportunity records.',
    items: ['Reseller flag confirmed', 'Group membership checked', 'Customer domain prepared'],
  },
  {
    title: 'Route commercial work',
    owner: 'Revenue desk',
    body: 'The surface groups quotes, renewals, and support tickets around the next action a reseller can safely take.',
    items: ['Renewal owner assigned', 'Quote evidence attached', 'Support breach marked'],
  },
  {
    title: 'Close the loop',
    owner: 'Operations',
    body: 'Each action returns a visible state: loading, empty, error, or complete, with no silent transitions.',
    items: ['Sync trace recorded', 'Invoice access checked', 'Follow-up generated'],
  },
]

const revealCopy =
  'A partner portal should behave like a precise work surface: sharp hierarchy, visible access boundaries, readable data states, and quiet motion that guides the reseller from signal to action without hiding context.'

function App() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>('.reveal-word')

      gsap.fromTo(
        '.hero-asset',
        { opacity: 0, y: 42, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
        },
      )

      gsap.to(words, {
        opacity: 1,
        y: 0,
        stagger: 0.035,
        ease: 'none',
        scrollTrigger: {
          trigger: '.reveal-copy',
          start: 'top 76%',
          end: 'bottom 44%',
          scrub: true,
        },
      })

      gsap.utils.toArray<HTMLElement>('.gsap-panel').forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0.32, y: 76, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 86%',
              end: 'top 38%',
              scrub: true,
            },
          },
        )
      })

      const media = gsap.matchMedia()

      media.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: '.desire-grid',
          start: 'top 96px',
          end: 'bottom bottom',
          pin: '.pin-copy',
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
      className="frost-shell relative min-h-[100dvh] w-full max-w-full overflow-x-hidden text-ink"
    >
      <div className="ambient-plane left-[-12vw] top-24 h-32 w-[58vw]" />
      <div className="ambient-plane right-[-16vw] top-[36rem] h-40 w-[52vw] opacity-35" />
      <Navigation />
      <Hero />
      <Interest />
      <Desire />
      <ActionFooter />
    </main>
  )
}

function Navigation() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/78 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 lg:grid-cols-[1fr_auto_1fr] lg:px-6">
        <a href="#top" className="font-mono text-sm font-semibold tracking-[-0.03em]">
          frost-grid-345
        </a>
        <nav className="hidden border border-line bg-white/80 lg:block">
          <ul className="flex">
            {navItems.map(([item, href]) => (
              <li key={item}>
                <a
                  href={href}
                  className="block border-r border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite transition-colors last:border-r-0 hover:bg-blue-wash hover:text-ink active:-translate-y-px"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="justify-self-end">
          <a
            href="#action"
            className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-white transition-transform hover:bg-blue-command hover:text-ink active:-translate-y-px"
          >
            Review access
            <ArrowRight size={15} weight="bold" />
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-12 px-4 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-6 lg:py-28">
      <div className="relative">
        <div className="mb-8 h-px w-48 bg-ink" />
        <h1
          aria-label="Partner portal for governed reseller work"
          className="max-w-6xl font-sans text-[clamp(3rem,5vw,5.2rem)] font-bold leading-[0.94] tracking-[-0.045em] text-balance"
        >
          Partner portal
          <span
            aria-hidden="true"
            className="mx-3 inline-block h-[0.58em] w-[1.22em] translate-y-[0.06em] border border-line bg-cover bg-center grayscale contrast-125"
            style={{
              backgroundImage: 'url(https://picsum.photos/seed/frost-grid-ledger/320/180)',
            }}
          />
          for governed reseller work
        </h1>
        <p className="mt-8 max-w-2xl font-mono text-base leading-7 text-graphite">
          A sharp SaaS workspace for partner pipeline, renewal pressure, customer
          ownership, and support actions. White canvas, light-blue command
          states, zero radius, and visible data boundaries.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#pipeline"
            className="inline-flex items-center justify-center gap-3 border border-blue-deep bg-blue-command px-6 py-4 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-ink transition-transform hover:-translate-y-0.5 active:-translate-y-px"
          >
            Open reseller view
            <ArrowRight size={18} weight="bold" />
          </a>
          <a
            href="#renewals"
            className="inline-flex items-center justify-center border border-line bg-white px-6 py-4 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:border-blue-deep hover:bg-blue-wash active:-translate-y-px"
          >
            Review renewals
          </a>
        </div>
      </div>

      <div className="hero-asset relative border border-line bg-white shadow-panel">
        <div className="absolute -right-10 -top-8 h-24 w-72 bg-blue-command/35 blur-3xl" />
        <div className="grid border-b border-line bg-mist px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:grid-cols-3">
          <span>reseller / signed</span>
          <span className="hidden sm:block">scope / restricted</span>
          <span className="hidden text-right sm:block">latency / 184ms</span>
        </div>
        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
          <aside className="border-b border-line bg-white lg:border-b-0 lg:border-r">
            {['Overview', 'Opportunities', 'Quotes', 'Invoices', 'Support'].map((item, index) => (
              <div
                key={item}
                className={`border-b border-line px-4 py-4 font-mono text-xs uppercase tracking-[0.05em] ${
                  index === 1 ? 'border-l-4 border-l-blue-deep bg-blue-wash text-ink' : 'text-graphite'
                }`}
              >
                {item}
              </div>
            ))}
          </aside>
          <div className="portal-hairline p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <div className="border border-line bg-white p-5">
                <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-graphite">
                      Opportunity control
                    </p>
                    <h2 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.04em]">
                      $842.6k
                    </h2>
                  </div>
                  <TrendUp size={28} weight="duotone" className="text-blue-deep" />
                </div>
                <div className="space-y-3">
                  {['Legal review', 'Partner quote', 'Support exception'].map((item, index) => (
                    <div key={item} className="grid grid-cols-[1fr_auto] border border-line bg-mist p-3">
                      <span className="font-mono text-xs text-graphite">{item}</span>
                      <span className="font-mono text-xs font-semibold text-ink">
                        {['14h', '3d', '28m'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-line bg-white">
                <img
                  src="https://picsum.photos/seed/partner-portal-ops/720/900"
                  alt="Abstract monochrome operations image"
                  className="h-full min-h-72 w-full object-cover grayscale contrast-125 opacity-85 mix-blend-luminosity"
                />
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
    <section id="pipeline" className="mx-auto max-w-[1400px] px-4 py-28 md:py-40 lg:px-6">
      <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <h2 className="max-w-xl font-sans text-4xl font-semibold leading-none tracking-[-0.045em] md:text-6xl">
            Built around the work partners repeat every day.
          </h2>
        </div>
        <div className="reveal-copy text-2xl leading-snug tracking-[-0.035em] text-graphite md:text-4xl">
          {revealCopy.split(' ').map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="reveal-word inline-block translate-y-3 pr-[0.32em] opacity-15"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-20 grid grid-flow-dense grid-cols-1 border-l border-t border-line lg:grid-cols-12">
        {moduleCards.map((card) => (
          <article
            key={card.title}
            className={`${card.className} group min-h-72 border-b border-r border-line bg-white p-6 transition-colors hover:bg-blue-wash md:p-8`}
          >
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-6">
                <div className="text-blue-deep transition-transform duration-700 ease-out group-hover:scale-110">
                  {card.icon}
                </div>
                <span className="border border-line bg-mist px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] text-graphite">
                  {card.meta}
                </span>
              </div>
              <div>
                <h3 className="max-w-xl font-sans text-2xl font-semibold leading-tight tracking-[-0.035em] md:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-4 max-w-[54ch] font-mono text-sm leading-6 text-graphite">
                  {card.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <StateStrip />
      <AccordionBand />
      <PartnerMarquee />
    </section>
  )
}

function StateStrip() {
  return (
    <div id="customers" className="mt-16 grid border border-line bg-white lg:grid-cols-[0.9fr_1.1fr_1fr]">
      <div className="border-b border-line p-6 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.06em] text-graphite">
          <MagnifyingGlass size={18} weight="bold" />
          Loading state
        </div>
        <div className="space-y-3">
          <div className="h-4 w-4/5 animate-bluePulse bg-blue-command/60" />
          <div className="h-4 w-3/5 animate-bluePulse bg-blue-command/40 [animation-delay:180ms]" />
          <div className="h-4 w-5/6 animate-bluePulse bg-blue-command/30 [animation-delay:360ms]" />
        </div>
      </div>
      <div className="border-b border-line p-6 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.06em] text-graphite">
          <CheckCircle size={18} weight="bold" />
          Empty state
        </div>
        <p className="max-w-md font-mono text-sm leading-6 text-graphite">
          No partner claims are waiting. Invite a reseller, assign a customer, or
          return to the pipeline.
        </p>
      </div>
      <div id="renewals" className="p-6">
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.06em] text-graphite">
          <XCircle size={18} weight="bold" />
          Error state
        </div>
        <div className="border border-blue-deep bg-blue-wash p-4 font-mono text-sm leading-6 text-ink">
          Invoice INV-48291 is outside this reseller scope. Recheck customer
          ownership before retrying.
        </div>
      </div>
    </div>
  )
}

function AccordionBand() {
  const lanes = [
    ['Access', 'Partner role, group membership, and customer ownership are visible before data loads.'],
    ['Pipeline', 'Commercial work is ordered by stale quotes, high-value renewals, and missing evidence.'],
    ['Support', 'Escalations stay close to the affected customer and opportunity record.'],
    ['Finance', 'Invoices render only after reseller-scoped domains resolve successfully.'],
  ]

  return (
    <div id="support" className="mt-20">
      <div className="grid border border-line bg-white md:grid-cols-4">
        {lanes.map(([title, body]) => (
          <article
            key={title}
            className="group min-h-72 border-b border-line p-6 transition-[flex,background-color] duration-700 ease-out hover:bg-blue-wash md:border-b-0 md:border-r md:last:border-r-0"
          >
            <div className="flex h-full flex-col justify-between">
              <h3 className="font-sans text-3xl font-semibold tracking-[-0.04em]">{title}</h3>
              <p className="max-h-0 overflow-hidden font-mono text-sm leading-6 text-graphite opacity-0 transition-all duration-700 group-hover:max-h-48 group-hover:opacity-100 md:max-h-none md:opacity-100">
                {body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function PartnerMarquee() {
  const row = [...partners, ...partners]

  return (
    <div className="marquee-mask mt-16 overflow-hidden border-y border-line bg-white py-5">
      <div className="flex w-max animate-marquee gap-10">
        {row.map((partner, index) => (
          <span
            key={`${partner}-${index}`}
            className="flex items-center gap-3 font-mono text-sm uppercase tracking-[0.08em] text-graphite"
          >
            <span className="h-2 w-8 bg-blue-command" />
            {partner}
          </span>
        ))}
      </div>
    </div>
  )
}

function Desire() {
  return (
    <section className="desire-grid mx-auto grid max-w-[1400px] gap-14 px-4 py-28 md:py-44 lg:grid-cols-[0.82fr_1.18fr] lg:px-6">
      <div className="pin-copy self-start">
        <div className="border-l-4 border-blue-deep pl-6">
          <h2 className="max-w-lg font-sans text-4xl font-semibold leading-none tracking-[-0.045em] md:text-6xl">
            From access check to accountable action.
          </h2>
          <p className="mt-6 max-w-md font-mono text-sm leading-6 text-graphite">
            The motion is intentionally quiet: pinned context on the left, work
            packets moving on the right, and copy revealing as the user scans.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {workflowPanels.map((panel, index) => (
          <article key={panel.title} className="gsap-panel border border-line bg-white p-6 shadow-panel md:p-8">
            <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-deep">
                  {panel.owner}
                </p>
                <h3 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.04em]">
                  {panel.title}
                </h3>
              </div>
              <span className="font-mono text-5xl font-semibold tracking-[-0.08em] text-blue-command">
                0{index + 1}
              </span>
            </div>
            <p className="max-w-2xl font-mono text-sm leading-6 text-graphite">{panel.body}</p>
            <div className="mt-8 grid gap-3">
              {panel.items.map((item) => (
                <div key={item} className="grid grid-cols-[auto_1fr] items-center gap-3 border border-line bg-mist p-3">
                  <CheckCircle size={18} weight="bold" className="text-blue-deep" />
                  <span className="font-mono text-sm text-ink">{item}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ActionFooter() {
  return (
    <footer id="action" className="border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-20 md:py-28 lg:grid-cols-[1fr_420px] lg:px-6">
        <div>
          <div className="mb-8 h-px w-56 bg-blue-command" />
          <h2 className="max-w-4xl font-sans text-4xl font-semibold leading-none tracking-[-0.045em] md:text-6xl">
            Prototype the reseller portal without touching production Odoo.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-6 text-white/70">
            This demo stays inside `design/`, uses mock data, and explores the
            future interface language before any Owl, QWeb, controller, or model
            contract changes are made.
          </p>
        </div>
        <form className="border border-white/18 bg-white/6 p-5 backdrop-blur-md">
          <label className="block font-mono text-xs uppercase tracking-[0.08em] text-white/70" htmlFor="portal-note">
            Portal note
          </label>
          <input
            id="portal-note"
            className="mt-3 h-12 w-full border border-white/18 bg-white px-3 font-mono text-sm text-ink"
            defaultValue="Review quote desk and access states"
          />
          <p className="mt-2 font-mono text-xs leading-5 text-white/55">
            Helper text: keep this demo static unless the concept is productized.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center gap-3 border border-blue-command bg-blue-command px-5 py-4 font-mono text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-transform hover:-translate-y-0.5 active:-translate-y-px"
          >
            Mark concept ready
            <BellSimple size={18} weight="bold" />
          </button>
          <div className="mt-5 flex items-start gap-3 border border-blue-command/50 bg-blue-command/12 p-3 font-mono text-xs leading-5 text-white/70">
            <Warning size={18} weight="bold" className="mt-0.5 shrink-0 text-blue-command" />
            Productization requires a separate pass through API, security, and
            portal integration rules.
          </div>
        </form>
      </div>
    </footer>
  )
}

export default App
