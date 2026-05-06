import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/portal'
import type { SalesOrder } from '../types/api'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { StatePanel } from '../components/ui/StatePanel'

type BadgeTone = 'default' | 'blue' | 'green' | 'warning'

const STATE_TONE: Record<string, BadgeTone> = {
  draft: 'default',
  sent: 'blue',
  sale: 'green',
  done: 'green',
  cancel: 'warning',
}

function currency(amount: number, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount)
}

function OrderRow({ order }: { order: SalesOrder }) {
  return (
    <tr className="transition-colors hover:bg-signal-wash">
      <td className="px-4 py-3 font-semibold">{order.name}</td>
      <td className="px-4 py-3 text-signal-muted">{order.partner_name}</td>
      <td className="px-4 py-3 tabular-nums text-signal-muted">{order.date_order?.slice(0, 10)}</td>
      <td className="px-4 py-3 font-bold tabular-nums text-signal-blue">
        {currency(order.amount_total, order.currency_name)}
      </td>
      <td className="px-4 py-3">
        <Badge label={order.state} tone={STATE_TONE[order.state] ?? 'default'} />
      </td>
    </tr>
  )
}

export function OrdersPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const orders = data ? [...data.data.quotations, ...data.data.sales_orders] : []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">
          Commerce
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Orders</h1>
      </div>

      {isLoading && <StatePanel state="loading" />}
      {isError && <StatePanel state="error" onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {orders.length === 0 ? (
            <StatePanel state="empty" message="No orders found for your account." />
          ) : (
            <Card innerClass="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Reference', 'Customer', 'Date', 'Amount', 'Status'].map((col) => (
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
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
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
