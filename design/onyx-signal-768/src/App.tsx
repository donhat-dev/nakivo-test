import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import {
  Buildings,
  ChartLineUp,
  GlobeHemisphereWest,
  Handshake,
  LockKey,
  Network,
} from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Check,
  ChevronRight,
  Menu,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/shared/utils'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Metric = {
  label: string
  value: string
  delta: string
}

type Motion = {
  title: string
  copy: string
  image: string
  marker: string
}

type PartnerInsights = {
  metrics: Metric[]
  motions: Motion[]
}

const heroVisual =
  'https://picsum.photos/seed/partner-command-center/1600/1100'
const inlineVisual = 'https://picsum.photos/seed/channel-ledger/640/360'

const partnerInsights: PartnerInsights = {
  metrics: [
    { label: 'Deal rooms aligned', value: '148', delta: '+22%' },
    { label: 'Risk windows closed', value: '37', delta: '-18%' },
    { label: 'Partner touches mapped', value: '2.8k', delta: '+41%' },
  ],
  motions: [
    {
      title: 'Account heat without spreadsheet rituals',
      copy: 'Coverage, decision makers, activity decay, and quote pressure land in one readable operating picture.',
      image: 'https://picsum.photos/seed/account-heat-map/1200/900',
      marker: 'Coverage',
    },
    {
      title: 'Escalations before the revenue meeting',
      copy: 'The system surfaces stalled co-sell motions while there is still time to recover the next step.',
      image: 'https://picsum.photos/seed/channel-escalation/1200/900',
      marker: 'Signals',
    },
    {
      title: 'Programs that keep their shape',
      copy: 'Enablement, MDF, certification, and pipeline proof stay connected as partner portfolios change.',
      image: 'https://picsum.photos/seed/program-operating-system/1200/900',
      marker: 'Programs',
    },
  ],
}

const bentoCards = [
  {
    title: 'A partner cockpit that reads the full quarter.',
    description:
      'Pipeline pressure, renewal drag, and enablement gaps collapse into one operator-grade surface.',
    image: 'https://picsum.photos/seed/saas-partner-cockpit/1200/900',
    className: 'md:col-span-2 md:row-span-2',
    mode: 'hero',
  },
  {
    title: 'Renewal drift',
    description: 'Accounts trending away from committed partner plays.',
    className: '',
    mode: 'metric',
  },
  {
    title: 'Deal hygiene',
    description: 'Auto-scored notes, next steps, owners, and aging.',
    className: '',
    mode: 'signal',
  },
  {
    title: 'Enablement radar',
    description: 'Skills, certifications, and playbook adoption by region.',
    className: '',
    mode: 'radar',
  },
  {
    title: 'Margin watch',
    description: 'Discount requests compared with partner tier behavior.',
    className: '',
    mode: 'margin',
  },
]

const accordionPanels = [
  {
    title: 'Co-sell motion',
    copy: 'Mutual account plans, activity quality, and executive sponsorship move together.',
    image: 'https://picsum.photos/seed/co-sell-motion/900/1200',
  },
  {
    title: 'Partner health',
    copy: 'Program status shows momentum, not just profile completion.',
    image: 'https://picsum.photos/seed/partner-health/900/1200',
  },
  {
    title: 'Quote velocity',
    copy: 'Bottlenecks surface beside the people who can clear them.',
    image: 'https://picsum.photos/seed/quote-velocity/900/1200',
  },
  {
    title: 'Field proof',
    copy: 'Customer evidence and win themes stay attached to live opportunities.',
    image: 'https://picsum.photos/seed/field-proof/900/1200',
  },
]

const marqueeItems = [
  { icon: Buildings, label: 'Cloud marketplaces' },
  { icon: Handshake, label: 'Regional alliances' },
  { icon: Network, label: 'Distribution pods' },
  { icon: ChartLineUp, label: 'Revenue councils' },
  { icon: LockKey, label: 'Security partners' },
  { icon: GlobeHemisphereWest, label: 'Global system integrators' },
]

const revealWords =
  'Partner teams do not need another dashboard. They need a living operating surface that spots silence, protects margin, and turns every co-sell promise into visible motion.'
    .split(' ')

async function fetchPartnerInsights() {
  return partnerInsights
}

function Navigation() {
  return (
    <header className="fixed left-0 right-0 top-5 z-50 px-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/[0.15] bg-black/[0.35] px-3 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <a
          href="#top"
          className="flex items-center gap-3 rounded-full px-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Blocks className="size-4" />
          </span>
          Partner Signal OS
        </a>
        <div className="hidden items-center gap-6 text-sm font-medium text-white/[0.72] md:flex">
          <a className="transition hover:text-white" href="#signal">
            Signal
          </a>
          <a className="transition hover:text-white" href="#motion">
            Motion
          </a>
          <a className="transition hover:text-white" href="#action">
            Action
          </a>
        </div>
        <div className="hidden md:block">
          <Button variant="outline" size="sm" asChild>
            <a href="#action">
              Open workspace
              <ArrowRight />
            </a>
          </Button>
        </div>
        <Button
          aria-label="Open navigation"
          className="md:hidden"
          size="icon"
          variant="outline"
        >
          <Menu />
        </Button>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-24 pt-32 md:pb-32 md:pt-40"
    >
      <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 max-w-6xl">
          <h1 className="max-w-6xl text-balance text-[clamp(3rem,6vw,6.75rem)] font-extrabold leading-[0.92] text-white">
            Command partner{' '}
            <span
              aria-hidden="true"
              className="mx-2 inline-block h-[0.42em] w-[1.28em] rounded-full bg-cover bg-center align-middle grayscale contrast-125"
              style={{ backgroundImage: `url(${inlineVisual})` }}
            />
            motion.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 text-white/[0.68] md:text-2xl md:leading-9">
            A modern SaaS command surface for channel teams that need proof,
            timing, leverage, and partner accountability in the same view.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#signal">
                See the signal
                <ArrowRight />
              </a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#motion">
                Watch motion
                <ShieldCheck />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[520px] lg:min-h-[680px]">
          <div className="absolute -left-8 bottom-10 right-6 top-0 overflow-hidden rounded-lg border border-white/[0.15] bg-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur">
            <img
              src={heroVisual}
              alt="Abstract partner command center"
              className="h-full w-full object-cover opacity-50 grayscale contrast-125 saturate-50 transition-transform duration-700 ease-out hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,11,9,0.24),rgba(8,11,9,0.76))]" />
            <div className="absolute inset-6 hidden grid-rows-[auto_1fr] gap-4 rounded-lg border border-white/10 bg-black/25 p-5 backdrop-blur-sm md:grid">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-sm font-semibold text-white">
                  Partner coverage
                </p>
                <div className="flex gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="size-2 rounded-full bg-secondary" />
                </div>
              </div>
              <div className="grid grid-cols-[0.8fr_1.2fr] gap-4">
                <div className="space-y-3">
                  {['Coverage', 'Renewal', 'Enablement', 'Margin'].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="rounded-md border border-white/10 bg-white/5 p-3"
                      >
                        <p className="text-xs text-white/55">{item}</p>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              index % 2 === 0 ? 'bg-primary' : 'bg-accent',
                            )}
                            style={{ width: `${64 + index * 7}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="relative overflow-hidden rounded-md border border-white/10 bg-white/5">
                  <div className="absolute inset-x-6 bottom-7 flex h-44 items-end gap-3">
                    {[56, 82, 46, 74, 92, 68, 88].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className={cn(
                          'flex-1 rounded-t-sm',
                          index % 3 === 0
                            ? 'bg-secondary'
                            : index % 2 === 0
                              ? 'bg-accent'
                              : 'bg-primary',
                        )}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-2 right-0 rounded-lg border border-primary/30 bg-background/[0.84] p-5 shadow-glow backdrop-blur-xl md:left-10 md:right-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Live partner posture
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  Revenue coverage locked
                </p>
              </div>
              <div className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                Active
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Proof', 'Timing', 'Margin'].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/[0.72]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InterestSection({ metrics }: { metrics: Metric[] }) {
  return (
    <section id="signal" className="px-4 py-32 md:py-48">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <h2 className="text-balance text-[clamp(2.8rem,5vw,5.9rem)] font-extrabold leading-[0.96] text-white">
            The operating layer between partner promise and booked revenue.
          </h2>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
            Built for the parts of channel operations that usually hide in
            meetings, mail threads, and stale CRM fields.
          </p>
        </div>

        <div className="mt-16 grid auto-rows-[260px] grid-flow-dense gap-4 md:grid-cols-4 md:auto-rows-[300px]">
          {bentoCards.map((card, index) => (
            <Card
              key={card.title}
              className={cn(
                'reveal-card group relative overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1',
                card.className,
              )}
            >
              {card.mode === 'hero' ? (
                <>
                  <img
                    src={card.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,7,0.2),rgba(7,9,7,0.9))]" />
                  <div className="relative flex h-full flex-col justify-end p-7 md:p-9">
                    <CardTitle className="max-w-xl text-4xl text-white md:text-5xl">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="mt-4 max-w-lg text-white/70">
                      {card.description}
                    </CardDescription>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-md border border-white/10 bg-black/30 p-4 backdrop-blur"
                        >
                          <p className="text-2xl font-bold text-white">
                            {metric.value}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-white/[0.58]">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-primary">
                        {index % 2 === 0 ? (
                          <BarChart3 className="size-5" />
                        ) : (
                          <ShieldCheck className="size-5" />
                        )}
                      </span>
                      <ChevronRight className="size-5 text-white/[0.35] transition-transform duration-500 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-white">
                      {card.title}
                    </CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          index % 2 === 0 ? 'bg-primary' : 'bg-secondary',
                        )}
                        style={{ width: `${56 + index * 8}%` }}
                      />
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccordionSection() {
  return (
    <section className="px-4 pb-32 md:pb-48">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-balance text-[clamp(2.4rem,4vw,4.9rem)] font-extrabold leading-none text-white">
            Four workstreams, one accountable partner motion.
          </h2>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Each slice expands into the operating context a channel leader needs
            before the weekly call.
          </p>
        </div>
        <div className="flex min-h-[620px] flex-col gap-4 md:flex-row">
          {accordionPanels.map((panel) => (
            <a
              key={panel.title}
              href="#action"
              className="group relative flex-1 overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-[flex,transform,border-color] duration-700 ease-out hover:flex-[2.6] hover:-translate-y-1 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={panel.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-64 grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,7,0.1),rgba(6,8,7,0.88))]" />
              <div className="relative flex h-full flex-col justify-end p-7">
                <h3 className="text-3xl font-bold leading-none text-white md:[writing-mode:vertical-rl] md:group-hover:[writing-mode:horizontal-tb]">
                  {panel.title}
                </h3>
                <p className="mt-5 max-w-sm text-base leading-7 text-white/0 transition-colors duration-700 group-hover:text-white/[0.72]">
                  {panel.copy}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnerMarquee() {
  const rows = [...marqueeItems, ...marqueeItems]

  return (
    <section className="overflow-hidden py-24 md:py-32">
      <div className="marquee-mask flex w-full overflow-hidden border-y border-white/10 bg-white/[0.03] py-7">
        <div className="flex min-w-max animate-marquee items-center gap-10 pr-10">
          {rows.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center gap-4 text-3xl font-bold text-white/[0.72] md:text-5xl"
              >
                <Icon className="size-9 text-primary md:size-12" weight="duotone" />
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function DesireSection({ motions }: { motions: Motion[] }) {
  return (
    <section id="motion" className="pin-stage px-4 py-32 md:py-48">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="pin-copy self-start lg:pt-20">
          <h2 className="text-balance text-[clamp(2.8rem,5vw,5.7rem)] font-extrabold leading-[0.94] text-white">
            Keep the channel honest while the market shifts.
          </h2>
          <p className="narrative-copy mt-10 max-w-xl text-2xl font-medium leading-10 text-white md:text-3xl md:leading-[1.35]">
            {revealWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="scrub-word mr-2 inline-block opacity-10"
              >
                {word}
              </span>
            ))}
          </p>
        </div>
        <div className="space-y-8 md:space-y-12">
          {motions.map((motion) => (
            <article
              key={motion.title}
              className="reveal-card group overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
            >
              <div className="overflow-hidden">
                <img
                  src={motion.image}
                  alt=""
                  className="scale-fade h-[420px] w-full scale-[0.82] object-cover opacity-60 grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105 md:h-[540px]"
                />
              </div>
              <div className="grid gap-6 p-7 md:grid-cols-[0.25fr_0.75fr] md:p-9">
                <p className="text-sm font-semibold text-primary">
                  {motion.marker}
                </p>
                <div>
                  <h3 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                    {motion.title}
                  </h3>
                  <p className="mt-4 text-lg leading-8 text-muted-foreground">
                    {motion.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActionFooter() {
  return (
    <section id="action" className="px-4 py-32 md:py-48">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-primary/25 bg-primary text-primary-foreground">
        <div className="grid gap-10 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-14 lg:p-20">
          <div>
            <h2 className="max-w-3xl text-balance text-[clamp(2.8rem,6vw,6.4rem)] font-extrabold leading-[0.9]">
              Run the partner quarter from signal, not ceremony.
            </h2>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" size="lg" asChild>
                <a href="#top">
                  Revisit concept
                  <ArrowRight />
                </a>
              </Button>
              <Button
                size="lg"
                className="bg-neutral-950 text-white hover:bg-neutral-900"
                asChild
              >
                <a href="#signal">
                  Inspect workflow
                  <Check />
                </a>
              </Button>
            </div>
          </div>
          <div className="self-end rounded-lg border border-black/10 bg-black/10 p-6">
            <p className="text-lg font-bold">Designed for modern partner ops</p>
            <ul className="mt-6 space-y-4 text-base leading-7">
              {[
                'Pipeline, programs, and proof in one surface',
                'Clear risk cues before partner reviews',
                'Motion-rich interface for executive scanning',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 size-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <footer className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-6 border-t border-white/10 pt-8 text-sm text-white/52 md:flex-row">
        <p>Partner Signal OS</p>
        <div className="flex gap-5">
          <a className="transition hover:text-white" href="#signal">
            Signal
          </a>
          <a className="transition hover:text-white" href="#motion">
            Motion
          </a>
          <a className="transition hover:text-white" href="#action">
            Action
          </a>
        </div>
      </footer>
    </section>
  )
}

function App() {
  const root = useRef<HTMLElement | null>(null)
  const { data = partnerInsights } = useQuery({
    queryKey: ['partner-insights'],
    queryFn: fetchPartnerInsights,
    staleTime: Infinity,
  })

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.reveal-card').forEach((card) => {
        gsap.from(card, {
          y: 58,
          opacity: 0.36,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        })
      })

      gsap.to('.scrub-word', {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.narrative-copy',
          start: 'top 78%',
          end: 'bottom 38%',
          scrub: true,
        },
      })

      gsap.utils.toArray<HTMLElement>('.scale-fade').forEach((image) => {
        gsap.fromTo(
          image,
          { scale: 0.82, opacity: 0.58, filter: 'brightness(0.72)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'brightness(1)',
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top 82%',
              end: 'center 46%',
              scrub: true,
            },
          },
        )

        gsap.to(image, {
          opacity: 0.22,
          filter: 'brightness(0.48)',
          ease: 'none',
          scrollTrigger: {
            trigger: image,
            start: 'center 32%',
            end: 'bottom 12%',
            scrub: true,
          },
        })
      })

      const media = gsap.matchMedia()
      media.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: '.pin-stage',
          start: 'top top',
          end: 'bottom bottom',
          pin: '.pin-copy',
          pinSpacing: false,
        })
      })

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <main
      ref={root}
      className="app-shell min-h-screen w-full max-w-full overflow-x-hidden"
    >
      <Navigation />
      <Hero />
      <InterestSection metrics={data.metrics} />
      <AccordionSection />
      <PartnerMarquee />
      <DesireSection motions={data.motions} />
      <ActionFooter />
    </main>
  )
}

export default App
