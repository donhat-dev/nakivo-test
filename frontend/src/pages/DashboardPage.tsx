import { useRef } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  ChartLine,
  Lightning,
  Receipt,
  ShoppingBag,
  TrendUp,
  Users,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getDashboard } from '../api/portal'
import type { Tone } from '../components/ui/Badge'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { StatePanel } from '../components/ui/StatePanel'
import { useCountUp } from '../hooks/useCountUp'

interface StatCardProps {
  icon: Icon
  label: string
  value: number
  caption: string
  maxValue: number
  href: string
  delay?: number
}

function StatCard({ icon: Icon, label, value, caption, maxValue, href, delay = 0 }: StatCardProps) {
  const numRef = useCountUp(value, delay)
  const level = maxValue > 0 ? Math.max(12, Math.round((value / maxValue) * 100)) : 12

  return (
    <Link to={href} className="block">
      <Card innerClass="group relative flex min-h-40 flex-col justify-between overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-signal-wash">
          <div
            className="h-full bg-signal-blue transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${level}%` }}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center border border-signal-line bg-signal-wash transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-signal-blue group-hover:bg-white">
            <Icon
              size={23}
              weight="light"
              className="text-signal-blue transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
            />
          </span>
          <span className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-signal-green">
            <span className="size-1.5 bg-signal-green" />
            Live
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal-muted">{label}</p>
          <p
            ref={numRef as RefObject<HTMLParagraphElement>}
            className="text-[clamp(2.25rem,4vw,4.75rem)] font-bold leading-none tracking-[-0.07em] tabular-nums text-signal-ink"
          >
            {value}
          </p>
          <p className="text-sm text-signal-muted">{caption}</p>
        </div>
      </Card>
    </Link>
  )
}

function stageTone(stageName: string): Tone {
  const s = stageName.toLowerCase()
  if (s.includes('won') || s.includes('closed won')) return 'green'
  if (s.includes('lost') || s.includes('closed lost')) return 'error'
  if (s.includes('qualif')) return 'blue'
  if (s.includes('propos') || s.includes('offer') || s.includes('negotiat')) return 'warning'
  return 'default'
}

function paymentTone(state: string): Tone {
  if (state === 'paid' || state === 'in_payment') return 'green'
  if (state === 'partial') return 'warning'
  if (state === 'not_paid') return 'error'
  return 'default'
}

function formatDeadline(date: string | null): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const isOverdue = d < now
  return (isOverdue ? '⚠ ' : '') + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function currency(amount: number, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount)
}

function probabilityLabel(value: number) {
  return `${Math.round(value)}%`
}

export function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const statsGridRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  // Stagger entrance for the 4 stat cards once data loads
  useGSAP(
    () => {
      if (!statsGridRef.current || !data) return
      const cards = gsap.utils.toArray<Element>(':scope > *', statsGridRef.current)
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.09,
          delay: 0.05,
          clearProps: 'filter',
        },
      )
    },
    { scope: statsGridRef, dependencies: [!!data] },
  )

  // ScrollTrigger batch reveal for table sections
  useGSAP(
    () => {
      if (!pageRef.current || !data) return
      const sections = gsap.utils.toArray<Element>('section', pageRef.current)
      ScrollTrigger.batch(sections, {
        start: 'top 88%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.08 },
          )
        },
      })
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    },
    { scope: pageRef, dependencies: [!!data] },
  )

  if (isLoading) return <StatePanel state="loading" />
  if (isError) return <StatePanel state="error" onRetry={refetch} />

  const { data: d, meta } = data!
  const counts = meta.counts
  const pipelineRevenue = d.opportunities.reduce((total, opp) => total + opp.expected_revenue, 0)
  const avgProbability =
    d.opportunities.length > 0
      ? d.opportunities.reduce((total, opp) => total + opp.probability, 0) / d.opportunities.length
      : 0
  const maxCount = Math.max(
    counts.opportunities,
    counts.sales_orders,
    counts.invoices,
    counts.customers,
    1,
  )
  const strongestOpportunity = [...d.opportunities].sort(
    (a, b) => b.expected_revenue - a.expected_revenue,
  )[0]

  const stats: StatCardProps[] = [
    {
      icon: ChartLine,
      label: 'Opportunities',
      value: counts.opportunities,
      caption: `${currency(pipelineRevenue)} exposed`,
      maxValue: maxCount,
      href: '/opportunities',
      delay: 0.08,
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      value: counts.sales_orders,
      caption: `${counts.quotations} quotations queued`,
      maxValue: maxCount,
      href: '/orders',
      delay: 0.17,
    },
    {
      icon: Receipt,
      label: 'Invoices',
      value: counts.invoices,
      caption: `${d.invoices.length} recent records`,
      maxValue: maxCount,
      href: '/invoices',
      delay: 0.26,
    },
    {
      icon: Users,
      label: 'Customers',
      value: counts.customers,
      caption: `${d.customers.length} shown in this view`,
      maxValue: maxCount,
      href: '/customers',
      delay: 0.35,
    },
  ]

  return (
    <div ref={pageRef} className="page-enter space-y-7">
      <section className="dashboard-hero overflow-hidden border border-signal-line bg-white">
        <div className="grid gap-8 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8 lg:p-10">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 border border-signal-line bg-signal-wash px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">
              <Lightning size={14} weight="bold" />
              Partner command
            </p>
            <h1 className="mt-5 max-w-4xl text-[clamp(2rem,4vw,4.25rem)] font-bold leading-[0.96] tracking-[-0.07em] text-signal-ink">
              Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-signal-muted">
              Monitor active reseller motion across pipeline, orders, invoices, and customer
              coverage from one focused operating surface.
            </p>
          </div>

          <div className="border-t border-signal-line pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="grid grid-cols-2 gap-px border border-signal-line bg-signal-line">
              <div className="bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-signal-muted">
                  Revenue exposure
                </p>
                <p className="mt-3 text-2xl font-bold tracking-[-0.05em] tabular-nums">
                  {currency(pipelineRevenue)}
                </p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-signal-muted">
                  Avg probability
                </p>
                <p className="mt-3 text-2xl font-bold tracking-[-0.05em] tabular-nums">
                  {probabilityLabel(avgProbability)}
                </p>
              </div>
              <div className="col-span-2 bg-signal-wash p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-signal-muted">
                      Highest open opportunity
                    </p>
                    <p className="mt-2 line-clamp-1 font-bold">
                      {strongestOpportunity?.name ?? 'No opportunity selected'}
                    </p>
                  </div>
                  <ArrowUpRight size={20} weight="bold" className="flex-none text-signal-blue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div ref={statsGridRef} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent opportunities */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal-blue">
              Pipeline focus
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.05em]">Recent opportunities</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-signal-muted">
            <span className="border border-signal-line bg-white px-3 py-2">
              {d.opportunities.length} visible
            </span>
            <span className="border border-signal-line bg-white px-3 py-2">
              Limit {meta.limit}
            </span>
            <Link
              to="/opportunities"
              className="flex items-center gap-1.5 border border-signal-blue bg-signal-blue/5 px-3 py-2 text-signal-blue transition-colors hover:bg-signal-blue hover:text-white"
            >
              View all <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
        {d.opportunities.length === 0 ? (
          <StatePanel state="empty" message="No opportunities yet" />
        ) : (
          <Card innerClass="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Name', 'Customer', 'Stage', 'Deadline', 'Revenue', 'Probability'].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-signal-muted"
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-signal-line">
                  {d.opportunities.map((opp) => (
                    <tr key={opp.id} className="transition-colors hover:bg-signal-wash">
                      <td className="px-5 py-4 font-semibold">{opp.name}</td>
                      <td className="px-5 py-4 text-signal-muted">{opp.partner_name}</td>
                      <td className="px-5 py-4">
                        <Badge label={opp.stage_name} tone={stageTone(opp.stage_name)} />
                      </td>
                      <td className="px-5 py-4 tabular-nums text-signal-muted">
                        {formatDeadline(opp.date_deadline)}
                      </td>
                      <td className="px-5 py-4 font-bold tabular-nums text-signal-blue">
                        {currency(opp.expected_revenue)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 bg-signal-wash">
                            <div
                              className="h-full bg-signal-green"
                              style={{ width: `${Math.max(0, Math.min(100, opp.probability))}%` }}
                            />
                          </div>
                          <span className="w-8 tabular-nums text-signal-muted">
                            {opp.probability}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Recent invoices */}
      {d.invoices.length > 0 && (
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal-blue">
                <TrendUp size={12} weight="bold" className="mr-1 inline-block" />
                Billing activity
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.05em]">Recent invoices</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-signal-muted">
              <span className="border border-signal-line bg-white px-3 py-2">
                {d.invoices.length} records
              </span>
              <Link
                to="/invoices"
                className="flex items-center gap-1.5 border border-signal-blue bg-signal-blue/5 px-3 py-2 text-signal-blue transition-colors hover:bg-signal-blue hover:text-white"
              >
                View all <ArrowRight size={12} weight="bold" />
              </Link>
            </div>
          </div>
          <Card innerClass="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Reference', 'Customer', 'Date', 'Amount', 'Payment'].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.1em] text-signal-muted"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-signal-line">
                  {d.invoices.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-signal-wash">
                      <td className="px-5 py-4 font-semibold">{inv.name}</td>
                      <td className="px-5 py-4 text-signal-muted">{inv.partner_name}</td>
                      <td className="px-5 py-4 tabular-nums text-signal-muted">
                        {inv.invoice_date
                          ? new Date(inv.invoice_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 font-bold tabular-nums">
                        {currency(inv.amount_total, inv.currency_name)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={inv.payment_state} tone={paymentTone(inv.payment_state)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}
