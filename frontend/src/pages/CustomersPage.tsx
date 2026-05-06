import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/portal'
import type { Customer } from '../types/api'
import { Card } from '../components/ui/Card'
import { StatePanel } from '../components/ui/StatePanel'

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <tr className="transition-colors hover:bg-signal-wash">
      <td className="px-4 py-3 font-semibold">{customer.name}</td>
      <td className="px-4 py-3 text-signal-muted">{customer.email}</td>
      <td className="px-4 py-3 text-signal-muted">{customer.phone}</td>
      <td className="px-4 py-3 text-signal-muted">
        {[customer.city, customer.country_name].filter(Boolean).join(', ')}
      </td>
    </tr>
  )
}

export function CustomersPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const customers = data?.data.customers ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">
          Accounts
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Customers</h1>
      </div>

      {isLoading && <StatePanel state="loading" />}
      {isError && <StatePanel state="error" onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {customers.length === 0 ? (
            <StatePanel state="empty" message="No customers linked to your reseller account." />
          ) : (
            <Card innerClass="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-signal-line bg-signal-wash">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Location'].map((col) => (
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
                  {customers.map((c) => (
                    <CustomerRow key={c.id} customer={c} />
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
