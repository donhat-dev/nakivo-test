import { useEffect, useMemo, useState } from 'react'

import './index.css'

type View = 'home' | 'portal'

type Metric = {
  label: string
  value: string
  unit: string
  status: 'nominal' | 'alert' | 'watch'
}

type Opportunity = {
  id: string
  partner: string
  region: string
  value: string
  stage: string
  risk: string
}

const metrics: Metric[] = [
  { label: 'active partners', value: '042', unit: 'nodes', status: 'nominal' },
  { label: 'open pipeline', value: '8.74', unit: 'm usd', status: 'nominal' },
  { label: 'quote breach', value: '009', unit: 'cases', status: 'alert' },
  { label: 'renewal drift', value: '017', unit: 'accounts', status: 'watch' },
]

const opportunities: Opportunity[] = [
  {
    id: 'OP-4912',
    partner: 'NORTHLINE SYSTEMS',
    region: 'EMEA-N',
    value: '$420K',
    stage: 'LEGAL',
    risk: 'LOW',
  },
  {
    id: 'OP-5027',
    partner: 'VECTORVAULT',
    region: 'AMER-W',
    value: '$1.2M',
    stage: 'QUOTE',
    risk: 'HIGH',
  },
  {
    id: 'OP-5160',
    partner: 'RADIUS CLOUD',
    region: 'APAC-S',
    value: '$285K',
    stage: 'TECH',
    risk: 'MED',
  },
  {
    id: 'OP-5331',
    partner: 'KERNEL BRIDGE',
    region: 'EMEA-C',
    value: '$760K',
    stage: 'PROC',
    risk: 'LOW',
  },
]

const sideNav = [
  'overview',
  'opportunities',
  'quotations',
  'customers',
  'invoices',
  'support queue',
]

const telemetryBars = [64, 82, 49, 91, 72, 55, 88, 43, 76, 68, 93, 51]

function cls(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function statusClass(status: Metric['status']) {
  if (status === 'alert') {
    return 'text-hazard'
  }
  if (status === 'nominal') {
    return 'text-live'
  }
  return 'text-phosphor'
}

function Shell({
  activeView,
  setActiveView,
  children,
}: {
  activeView: View
  setActiveView: (view: View) => void
  children: React.ReactNode
}) {
  return (
    <main className="terminal-shell min-h-screen w-full max-w-full overflow-x-hidden bg-crt text-phosphor">
      <div className="fixed inset-0 pointer-events-none z-50 scanlines" />
      <div className="fixed inset-0 pointer-events-none z-50 noise" />
      <header className="grid min-w-0 border-b border-grid bg-crt lg:grid-cols-[240px_1fr_300px]">
        <div className="flex h-16 items-center border-b border-grid px-4 lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="text-left font-mono text-xs font-bold uppercase tracking-[0.14em] text-phosphor"
          >
            [ RAW-TERMINAL-787 ]
          </button>
        </div>
        <nav className="flex h-16 items-center gap-1 overflow-x-auto border-b border-grid p-2 lg:border-b-0 lg:border-r">
          {(['home', 'portal'] as View[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={cls(
                'h-full min-w-32 border border-grid px-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors',
                activeView === view
                  ? 'bg-hazard text-phosphor'
                  : 'bg-crt text-dim hover:bg-phosphor hover:text-crt',
              )}
            >
              {'>'} {view === 'home' ? 'home grid' : 'portal view'}
            </button>
          ))}
        </nav>
        <div className="grid h-16 grid-cols-3 text-[10px] uppercase tracking-[0.12em]">
          <div className="flex items-center border-r border-grid px-3">
            <samp>REV 7.8.7</samp>
          </div>
          <div className="flex items-center border-r border-grid px-3 text-live">
            <samp>LINK: LIVE</samp>
          </div>
          <div className="flex items-center px-3 text-hazard">
            <samp>ALERT: 09</samp>
          </div>
        </div>
      </header>
      {children}
    </main>
  )
}

function HomePage({ onOpenPortal }: { onOpenPortal: () => void }) {
  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 border-b border-grid lg:grid-cols-[1fr_380px]">
      <section className="relative grid grid-rows-[auto_1fr_auto] border-b border-grid lg:border-b-0 lg:border-r">
        <div className="grid grid-cols-2 border-b border-grid font-mono text-[11px] uppercase tracking-[0.12em] md:grid-cols-4">
          {['unit / partner command', 'sector / reseller', 'access / gated', 'mode / telemetry'].map(
            (item) => (
              <samp key={item} className="border-r border-grid p-4 last:border-r-0">
                {item}
              </samp>
            ),
          )}
        </div>

        <div className="grid items-end gap-8 p-5 md:p-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-hazard">
              [ classified partner operating surface ]
            </p>
            <h1 className="max-w-6xl font-display text-[clamp(4.6rem,12vw,13rem)] uppercase leading-[0.82] tracking-[-0.065em] text-phosphor">
              partner control terminal
            </h1>
          </div>

          <aside className="grid border border-grid bg-[#101010] font-mono uppercase">
            <div className="border-b border-grid p-4 text-xs tracking-[0.16em]">
              mission packet
            </div>
            <dl className="grid text-[11px] tracking-[0.1em]">
              {[
                ['coverage map', '84%'],
                ['quote latency', '12h'],
                ['tier drift', '03'],
                ['margin lock', '91%'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto] items-end border-b border-grid p-4"
                >
                  <dt className="text-dim">{label}</dt>
                  <dd className="text-3xl font-bold text-phosphor">
                    <data value={value}>{value}</data>
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="grid border-t border-grid md:grid-cols-[1fr_260px_260px]">
          <div className="p-5 font-mono text-xs uppercase leading-6 tracking-[0.12em] text-dim md:p-6">
            A hard-edged reseller portal concept for account ownership, opportunity
            telemetry, quote pressure, and partner signal review. No rounded
            cards. No consumer chrome. Every box is an operational compartment.
          </div>
          <button
            type="button"
            onClick={onOpenPortal}
            className="border-t border-grid bg-hazard p-5 text-left font-mono text-sm font-bold uppercase tracking-[0.14em] text-phosphor transition-colors hover:bg-phosphor hover:text-crt md:border-l md:border-t-0"
          >
            {'>>>'} open portal view
          </button>
          <a
            href="#system-map"
            className="border-t border-grid p-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-phosphor transition-colors hover:bg-phosphor hover:text-crt md:border-l md:border-t-0"
          >
            {'///'} inspect system
          </a>
        </div>
      </section>

      <aside id="system-map" className="grid grid-rows-[auto_1fr_auto] bg-[#0F0F0F]">
        <div className="border-b border-grid p-4 font-mono text-xs uppercase tracking-[0.14em]">
          telemetry mesh
        </div>
        <div className="relative min-h-[520px] overflow-hidden border-b border-grid p-4">
          <div className="absolute inset-0 blueprint-grid opacity-70" />
          <div className="relative grid h-full grid-cols-4 gap-px bg-grid">
            {Array.from({ length: 28 }).map((_, index) => (
              <div
                key={index}
                className={cls(
                  'bg-crt p-2 font-mono text-[10px] uppercase tracking-[0.08em] text-dim',
                  index === 6 && 'col-span-2 row-span-2 border-2 border-hazard text-hazard',
                  index === 17 && 'col-span-2 text-live',
                )}
              >
                <samp>+{String(index + 1).padStart(2, '0')}</samp>
              </div>
            ))}
          </div>
        </div>
        <div className="barcode h-24 border-b border-grid" />
      </aside>
    </div>
  )
}

function PortalView() {
  const totalPipeline = useMemo(
    () =>
      opportunities
        .reduce((sum, item) => {
          const raw = item.value.replace(/[$MK]/g, '')
          return sum + Number(raw) * (item.value.endsWith('M') ? 1000 : 1)
        }, 0)
        .toFixed(0),
    [],
  )

  return (
    <div className="grid min-h-[calc(100vh-64px)] min-w-0 lg:grid-cols-[260px_1fr]">
      <aside className="min-w-0 border-b border-grid bg-[#0F0F0F] lg:border-b-0 lg:border-r">
        <div className="border-b border-grid p-4 font-mono text-xs uppercase tracking-[0.14em]">
          [ reseller node ]
        </div>
        <div className="grid grid-cols-2 border-b border-grid lg:grid-cols-1">
          {sideNav.map((item, index) => (
            <button
              key={item}
              type="button"
              className={cls(
                'border-r border-grid p-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-dim transition-colors hover:bg-phosphor hover:text-crt lg:border-r-0',
                index === 0 && 'bg-hazard text-phosphor',
              )}
            >
              <samp>{String(index + 1).padStart(2, '0')} / {item}</samp>
            </button>
          ))}
        </div>
        <div className="hidden p-4 lg:block">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
            auth matrix
          </div>
          <div className="grid grid-cols-6 gap-px bg-grid">
            {Array.from({ length: 54 }).map((_, index) => (
              <span
                key={index}
                className={cls(
                  'h-5 bg-crt',
                  index % 11 === 0 && 'bg-hazard',
                  index === 31 && 'bg-live',
                )}
              />
            ))}
          </div>
        </div>
      </aside>

      <section className="grid min-w-0 grid-rows-[auto_auto_1fr]">
        <div className="grid min-w-0 border-b border-grid xl:grid-cols-[1fr_280px]">
          <div className="min-w-0 p-5 md:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-hazard">
              {'<'} portal dashboard / sample authenticated view {'>'}
            </p>
            <h2 className="mt-4 max-w-full font-display text-[clamp(3rem,7.4vw,8rem)] uppercase leading-[0.84] tracking-[-0.06em]">
              <span className="block">channel</span>
              <span className="block">ops grid</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 border-t border-grid font-mono uppercase xl:border-l xl:border-t-0">
            <div className="border-r border-grid p-4">
              <p className="text-[10px] tracking-[0.14em] text-dim">pipeline total</p>
              <data className="mt-4 block text-4xl font-bold" value={totalPipeline}>
                ${totalPipeline}K
              </data>
            </div>
            <div className="p-4">
              <p className="text-[10px] tracking-[0.14em] text-dim">system state</p>
              <output className="mt-4 block text-4xl font-bold text-live">ARMED</output>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-grid p-px md:grid-cols-4">
          {metrics.map((metric) => (
            <section key={metric.label} className="bg-crt p-4 font-mono uppercase">
              <p className="text-[10px] tracking-[0.16em] text-dim">{metric.label}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <data
                  value={metric.value}
                  className={cls('text-5xl font-bold tracking-[-0.08em]', statusClass(metric.status))}
                >
                  {metric.value}
                </data>
                <span className="pb-2 text-[10px] tracking-[0.16em] text-dim">
                  {metric.unit}
                </span>
              </div>
            </section>
          ))}
        </div>

        <div className="grid min-w-0 gap-px bg-grid p-px xl:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 bg-crt">
            <div className="flex items-center justify-between border-b border-grid p-4 font-mono uppercase">
              <h3 className="text-xs tracking-[0.16em]">opportunity telemetry</h3>
              <samp className="text-[10px] text-hazard">sort / risk desc</samp>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse font-mono uppercase">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.14em] text-dim">
                    {['id', 'partner', 'region', 'value', 'stage', 'risk'].map((head) => (
                      <th key={head} className="border-b border-r border-grid p-3 last:border-r-0">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((item) => (
                    <tr key={item.id} className="text-xs tracking-[0.08em]">
                      <td className="border-b border-r border-grid p-3 text-hazard">{item.id}</td>
                      <td className="border-b border-r border-grid p-3">{item.partner}</td>
                      <td className="border-b border-r border-grid p-3">{item.region}</td>
                      <td className="border-b border-r border-grid p-3">{item.value}</td>
                      <td className="border-b border-r border-grid p-3">{item.stage}</td>
                      <td
                        className={cls(
                          'border-b border-grid p-3',
                          item.risk === 'HIGH' && 'bg-hazard text-phosphor',
                        )}
                      >
                        {item.risk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid min-w-0 bg-crt md:grid-cols-2 xl:grid-cols-1">
            <div className="border-b border-grid p-4">
              <div className="mb-5 flex items-center justify-between font-mono uppercase">
                <h3 className="text-xs tracking-[0.16em]">quote pressure</h3>
                <samp className="text-[10px] text-dim">unit / q-09</samp>
              </div>
              <div className="flex h-64 items-end gap-px border border-grid p-3">
                {telemetryBars.map((bar, index) => (
                  <span
                    key={`${bar}-${index}`}
                    className={cls('flex-1', index === 4 || index === 10 ? 'bg-hazard' : 'bg-phosphor')}
                    style={{ height: `${bar}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4">
              <div className="mb-5 flex items-center justify-between font-mono uppercase">
                <h3 className="text-xs tracking-[0.16em]">service queue</h3>
                <samp className="text-[10px] text-live">one live readout</samp>
              </div>
              <div className="grid gap-px bg-grid">
                {['license transfer', 'invoice dispute', 'partner onboarding', 'quote override'].map(
                  (item, index) => (
                    <article key={item} className="grid grid-cols-[56px_1fr_72px] bg-crt font-mono uppercase">
                      <samp className="border-r border-grid p-3 text-[10px] text-dim">
                        T-{index + 1}
                      </samp>
                      <p className="border-r border-grid p-3 text-xs tracking-[0.08em]">
                        {item}
                      </p>
                      <data className="p-3 text-xs text-hazard" value={index + 2}>
                        {index + 2}H
                      </data>
                    </article>
                  ),
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [view, setView] = useState<View>(() =>
    window.location.hash === '#portal' ? 'portal' : 'home',
  )

  useEffect(() => {
    const syncView = () => {
      setView(window.location.hash === '#portal' ? 'portal' : 'home')
    }

    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  const setActiveView = (nextView: View) => {
    window.location.hash = nextView === 'portal' ? 'portal' : 'home'
    setView(nextView)
  }

  return (
    <Shell activeView={view} setActiveView={setActiveView}>
      {view === 'home' ? (
        <HomePage onOpenPortal={() => setActiveView('portal')} />
      ) : (
        <PortalView />
      )}
    </Shell>
  )
}

export default App
