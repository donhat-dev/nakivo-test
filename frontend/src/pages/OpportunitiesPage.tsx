import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { MagnifyingGlass, Trash, X } from '@phosphor-icons/react'
import {
  createOpportunity,
  deleteOpportunity,
  getDashboard,
  getOpportunities,
} from '../api/portal'
import type { Customer } from '../types/api'
import type { Tone } from '../components/ui/Badge'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { StatePanel } from '../components/ui/StatePanel'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  partner_id: z.number().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  expected_revenue: z.preprocess(
    (v) => (v === '' || (typeof v === 'number' && isNaN(v)) ? undefined : v),
    z.number({ invalid_type_error: 'Enter a number' }).min(0).optional(),
  ),
  description: z.string().max(5000).optional(),
})
type CreateForm = z.infer<typeof createSchema>

function currency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function stageTone(stageName: string): Tone {
  const s = stageName.toLowerCase()
  if (s.includes('won') || s.includes('closed won')) return 'green'
  if (s.includes('lost') || s.includes('closed lost')) return 'error'
  if (s.includes('qualif')) return 'blue'
  if (s.includes('propos') || s.includes('offer') || s.includes('negotiat')) return 'warning'
  return 'default'
}

// ---------------------------------------------------------------------------
// Customer combobox
// ---------------------------------------------------------------------------

interface CustomerComboboxProps {
  customers: Customer[]
  selected: Customer | null
  onSelect: (customer: Customer | null) => void
}

function CustomerCombobox({ customers, selected, onSelect }: CustomerComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered =
    query.length === 0
      ? customers
      : customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSelect(c: Customer) {
    onSelect(c)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <p className="block text-sm font-bold text-signal-ink">Customer (optional)</p>

      {selected ? (
        <div className="mt-2 flex items-center justify-between border border-signal-line bg-white px-4 py-3 text-sm">
          <span className="font-semibold text-signal-ink">{selected.name}</span>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="ml-3 flex-none text-signal-muted transition-colors hover:text-signal-ink"
            aria-label="Clear customer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative mt-2">
          <MagnifyingGlass
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-signal-muted"
          />
          <input
            type="text"
            placeholder="Search customers…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="w-full border border-signal-line bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-signal-muted focus:border-signal-blue"
          />
        </div>
      )}

      {open && !selected && (
        <div className="absolute inset-x-0 top-full z-10 max-h-52 overflow-y-auto border border-t-0 border-signal-line bg-white shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-signal-muted">No customers found</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-signal-wash"
              >
                <span className="text-sm font-semibold text-signal-ink">{c.name}</span>
                {c.email && (
                  <span className="text-xs text-signal-muted">{c.email}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function OpportunitiesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => getOpportunities(),
  })

  // Dashboard data gives us the customer list (already cached from dashboard visit)
  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    enabled: createOpen,
  })
  const customers = dashData?.data.customers ?? []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) })

  const createMut = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['opportunities'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      setCreateOpen(false)
      reset()
      setSelectedCustomer(null)
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['opportunities'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null)

  function handleDelete(id: number) {
    setDeleteErrorId(null)
    deleteMut.mutate(id, {
      onError: () => setDeleteErrorId(id),
    })
  }

  function handleCustomerSelect(c: Customer | null) {
    setSelectedCustomer(c)
    setValue('partner_id', c?.id)
    setValue('email', c?.email ?? '')
    setValue('phone', c?.phone ?? '')
  }

  function handleOpenChange(open: boolean) {
    setCreateOpen(open)
    if (!open) {
      reset()
      setSelectedCustomer(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">
            Pipeline
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Opportunities</h1>
        </div>

        <Dialog.Root open={createOpen} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <Button tone="primary" arrow>
              New opportunity
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-signal-ink/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[580px] -translate-x-1/2 -translate-y-1/2 p-3 focus:outline-none">
              <div className="bezel">
                <div className="bezel-core p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold tracking-[-0.03em]">
                      New opportunity
                    </Dialog.Title>
                    <Dialog.Close className="grid size-8 place-items-center border border-signal-line text-signal-muted transition-colors hover:bg-signal-wash hover:text-signal-ink">
                      <X size={20} />
                    </Dialog.Close>
                  </div>

                  <form
                    onSubmit={handleSubmit((d) => createMut.mutate(d))}
                    className="space-y-5"
                    noValidate
                  >
                    {/* Customer selector */}
                    <CustomerCombobox
                      customers={customers}
                      selected={selectedCustomer}
                      onSelect={handleCustomerSelect}
                    />

                    {/* Contact details — always visible, auto-filled when customer selected */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        id="opp-email"
                        label="Email"
                        type="email"
                        placeholder="contact@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <FormField
                        id="opp-phone"
                        label="Phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...register('phone')}
                      />
                    </div>

                    {/* Opportunity name */}
                    <FormField
                      id="opp-name"
                      label="Opportunity name"
                      placeholder="e.g. Renewal Q3 — Vantage North"
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    {/* Revenue */}
                    <FormField
                      id="opp-revenue"
                      label="Expected revenue (USD)"
                      type="number"
                      placeholder="10000"
                      error={errors.expected_revenue?.message}
                      {...register('expected_revenue', { valueAsNumber: true })}
                    />

                    {/* Notes */}
                    <FormField
                      id="opp-desc"
                      label="Notes (optional)"
                      placeholder="Additional context…"
                      {...register('description')}
                    />

                    {createMut.isError && (
                      <p className="text-sm font-semibold text-red-600">
                        Failed to create opportunity. Please try again.
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <Dialog.Close asChild>
                        <Button type="button" tone="secondary">
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Button type="submit" tone="primary" disabled={createMut.isPending}>
                        {createMut.isPending ? 'Creating…' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {isLoading && <StatePanel state="loading" />}
      {isError && <StatePanel state="error" onRetry={refetch} />}

      {!isLoading && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <StatePanel state="empty" message="No opportunities yet — create your first one." />
          ) : (
            <Card innerClass="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Name', 'Customer', 'Stage', 'Revenue', 'Probability', ''].map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-signal-muted"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-signal-line">
                  {data.data.map((opp) => (
                    <tr key={opp.id} className="transition-colors hover:bg-signal-wash">
                      <td className="px-4 py-3 font-semibold">{opp.name}</td>
                      <td className="px-4 py-3 text-signal-muted">{opp.partner_name}</td>
                      <td className="px-4 py-3">
                        <Badge label={opp.stage_name} tone={stageTone(opp.stage_name)} />
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums text-signal-blue">
                        {currency(opp.expected_revenue)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-signal-muted">
                        {opp.probability}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(opp.id)}
                          disabled={deleteMut.isPending && deleteMut.variables === opp.id}
                          aria-label={`Delete ${opp.name}`}
                          className="grid size-8 place-items-center text-signal-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deleteMut.isPending && deleteMut.variables === opp.id ? (
                            <span className="size-4 animate-spin rounded-full border-2 border-signal-muted border-t-transparent" />
                          ) : (
                            <Trash size={16} />
                          )}
                                                {deleteErrorId === opp.id && (
                                                  <p className="mt-1 text-right text-[11px] font-semibold text-red-600">
                                                    Delete failed
                                                  </p>
                                                )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
