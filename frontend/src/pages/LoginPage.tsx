import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import { Pulse } from '@phosphor-icons/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { login } from '../api/auth'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { hasAuthSession } from '../lib/auth-session'

const schema = z.object({
  login: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof schema>

export function LoginPage() {
  const pageRef = useRef<HTMLElement>(null)
  const isAuthenticated = hasAuthSession()

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<Element>('.reveal', pageRef.current ?? document.body)
      gsap.fromTo(
        reveals,
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.82,
          ease: 'power3.out',
          stagger: 0.14,
          clearProps: 'opacity,transform,filter,willChange',
        },
      )
    },
    { scope: pageRef },
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: LoginForm) => login(data),
    onSuccess: (session) => {
      localStorage.setItem('nakivo_session', session.session_id)
      localStorage.setItem('nakivo_user_name', session.name ?? '')
      // Full page navigation to the authenticated portal route so the
      // backend can inject a proper __ODOO_SESSION__ for the new session.
      window.location.replace('/my/reseller-portal')
    },
  })

  const apiError = error ? (error as Error).message || 'Login failed. Check your credentials and try again.' : null

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <section ref={pageRef} className="relative min-h-[100dvh] overflow-hidden px-4 py-5 md:px-8">
      <div className="signal-noise pointer-events-none fixed inset-0" />
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[1400px] flex-col">
        <header className="bezel reveal">
          <div className="bezel-core flex items-center px-4 py-3">
            <span className="flex items-center gap-3 text-sm font-bold tracking-[-0.02em]">
              <span className="grid size-8 place-items-center bg-signal-blue text-white">
                <Pulse size={17} weight="bold" />
              </span>
              Nakivo Portal
            </span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[0.95fr_1.05fr] md:py-14">
          <div className="reveal min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-blue">Partner access</p>
            <h1 className="mt-6 max-w-[760px] text-[clamp(2.6rem,6vw,5.8rem)] font-bold leading-[0.9] tracking-[-0.07em]">
              Sign into a scoped reseller workspace.
            </h1>
            <p className="mt-7 max-w-[620px] text-lg leading-8 text-signal-muted">
              Opportunities, orders, invoices, and customers — all scoped to your reseller account.
            </p>
          </div>

          <div className="reveal bezel">
            <div className="bezel-core p-6 md:p-9">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signal-green">Secure sign in</p>
                <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] md:text-5xl">Access console</h2>
              </div>

              <form onSubmit={handleSubmit((data) => mutate(data))} className="mt-10 space-y-5" noValidate>
                <FormField
                  id="login"
                  label="Work email"
                  type="email"
                  placeholder="reseller@example.com"
                  autoComplete="email"
                  error={errors.login?.message}
                  hint="Use the address assigned to your reseller portal account."
                  {...register('login')}
                />
                <FormField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />

                {apiError && <p className="text-sm font-semibold text-red-600">{apiError}</p>}

                <Button type="submit" tone="primary" arrow disabled={isPending} className="w-full">
                  {isPending ? 'Signing in...' : 'Continue to workspace'}
                </Button>
              </form>

              <p className="mt-8 text-xs text-signal-muted">
                Demo:{' '}
                <span className="font-semibold text-signal-ink">reseller@demo.com</span>
                {' / '}
                <span className="font-semibold text-signal-ink">demo1234</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
