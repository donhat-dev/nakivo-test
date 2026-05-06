import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/portal'
import type { Invoice } from '../types/api'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { StatePanel } from '../components/ui/StatePanel'

type BadgeTone = 'default' | 'blue' | 'green' | 'warning' | 'error'

const PAYMENT_TONE: Record<string, BadgeTone> = {
  paid: 'green',
  in_payment: 'blue',
  partial: 'warning',
  not_paid: 'default',
  reversed: 'error',
}

function currency(amount: number, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount)
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <tr className="transition-colors hover:bg-signal-wash">
      <td className="px-4 py-3 font-semibold">{invoice.name}</td>
      <td className="px-4 py-3 text-signal-muted">{invoice.partner_name}</td>
      <td className="px-4 py-3 tabular-nums text-signal-muted">
        {invoice.invoice_date?.slice(0, 10)}
      </td>
      <td className="px-4 py-3 font-bold tabular-nums text-signal-blue">
        {currency(invoice.amount_total, invoice.currency_name)}
      </td>
      <td className="px-4 py-3">
        <Badge
          label={invoice.payment_state}
          tone={PAYMENT_TONE[invoice.payment_state] ?? 'default'}
        />
      </td>
      <td className="px-4 py-3">
        <Badge label={invoice.state} tone={invoice.state === 'posted' ? 'green' : 'default'} />
      </td>
    </tr>
  )
}

export function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const invoices = data?.data.invoices ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">
          Finance
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Invoices</h1>
      </div>

      {isLoading && <StatePanel state="loading" />}
      {isError && <StatePanel state="error" onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {invoices.length === 0 ? (
            <StatePanel state="empty" message="No invoices found for your account." />
          ) : (
            <Card innerClass="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Reference', 'Customer', 'Date', 'Amount', 'Payment', 'Status'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-signal-muted"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-signal-line">
                  {invoices.map((inv) => (
                    <InvoiceRow key={inv.id} invoice={inv} />
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
