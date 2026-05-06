import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Sidebar } from './Sidebar'

export function PageShell() {
  const contentRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useGSAP(
    () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 16, filter: 'blur(5px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.52,
          ease: 'power3.out',
          clearProps: 'opacity,transform,filter,willChange',
        },
      )
    },
    { dependencies: [location.key] },
  )

  return (
    <div className="relative flex min-h-[100dvh] overflow-x-hidden bg-signal-paper text-signal-ink md:h-[100dvh] md:overflow-hidden">
      <div className="signal-noise pointer-events-none fixed inset-0" />
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-auto md:h-[100dvh]">
        <div ref={contentRef} className="mx-auto max-w-[1400px] p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
