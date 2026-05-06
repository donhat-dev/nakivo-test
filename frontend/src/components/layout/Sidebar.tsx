import { useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CaretLeft,
  CaretRight,
  ChartLine,
  Receipt,
  ShoppingBag,
  SignOut,
  SquaresFour,
  Users,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { logout } from '../../api/auth'
import { getOdooLoginUrl, getStoredUserName, isEmbeddedPortalRuntime } from '../../lib/auth-session'

interface NavItem {
  to: string
  label: string
  icon: Icon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: SquaresFour, end: true },
  { to: '/opportunities', label: 'Opportunities', icon: ChartLine },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
  { to: '/customers', label: 'Customers', icon: Users },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function Sidebar() {
  const navigate = useNavigate()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)

  const userName = getStoredUserName() || 'Reseller'
  const initials = getInitials(userName) || 'R'

  useGSAP(
    () => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
      const links = gsap.utils.toArray<Element>('nav a', sidebarRef.current)
      gsap.fromTo(
        links,
        { x: -14, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.055,
          delay: 0.18,
          clearProps: 'transform,opacity',
        },
      )
    },
    { scope: sidebarRef },
  )

  function handleToggle() {
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const isCollapsing = !collapsed
    setCollapsed(isCollapsing)

    gsap.to(sidebar, {
      width: isCollapsing ? 64 : 268,
      duration: 0.48,
      ease: 'power3.inOut',
    })

    const labels = gsap.utils.toArray<Element>('.sidebar-label', sidebar)
    if (isCollapsing) {
      gsap.to(labels, { opacity: 0, x: -8, duration: 0.22, ease: 'power2.in', stagger: 0.02 })
    } else {
      gsap.fromTo(
        labels,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out', stagger: 0.04, delay: 0.2 },
      )
    }
  }

  async function handleLogout() {
    await logout()
    if (isEmbeddedPortalRuntime()) {
      window.location.assign(getOdooLoginUrl())
      return
    }
    navigate('/login', { replace: true })
  }

  return (
    <aside
      ref={sidebarRef}
      className="hidden h-[100dvh] w-[268px] flex-none flex-col border-r border-signal-line bg-signal-paper md:flex"
      style={{ overflow: 'hidden' }}
    >
      {/* User card */}
      <div className="flex-none border-b border-signal-line">
        <div className="flex items-center gap-3 px-4 py-4">
          <span
            className="grid size-9 flex-none place-items-center bg-signal-blue text-xs font-bold tracking-wider text-white"
            aria-label={userName}
          >
            {initials}
          </span>
          <div className="sidebar-label min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold tracking-[-0.02em] text-signal-ink">
              {userName}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-signal-muted">
              Reseller
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isActive
                  ? 'border-signal-blue bg-signal-blue text-white'
                  : 'text-signal-muted hover:border-signal-line hover:bg-signal-wash hover:text-signal-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} weight={isActive ? 'bold' : 'light'} className="flex-none" />
                <span className="sidebar-label truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-none space-y-1 border-t border-signal-line p-2">
        {/* Collapse toggle */}
        <button
          onClick={handleToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-semibold text-signal-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-signal-line hover:bg-signal-wash hover:text-signal-ink"
        >
          {collapsed ? (
            <CaretRight size={18} weight="bold" className="flex-none" />
          ) : (
            <CaretLeft size={18} weight="bold" className="flex-none" />
          )}
          <span className="sidebar-label truncate">Collapse</span>
        </button>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-semibold text-signal-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-signal-line hover:bg-signal-wash hover:text-signal-ink active:scale-[0.98]"
        >
          <SignOut size={18} weight="light" className="flex-none" />
          <span className="sidebar-label truncate">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
