import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { BrandLockup } from '../brand/Brand'
import { LinkButton } from '../ui/LinkButton'

type NavItem = { to: string; label: string }

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [locked])
}

export function NavBar() {
  const [open, setOpen] = useState(false)
  useLockBodyScroll(open)

  const nav: NavItem[] = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/paper-ballots', label: 'Why Paper Ballots' },
      { to: '/action', label: 'Action Toolkit' },
      { to: '/request-help', label: 'Request Help' },
      { to: '/about', label: 'About & Support' },
    ],
    [],
  )

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-patriot-navy text-patriot-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <a
            className="font-semibold tracking-wide hover:underline"
            href="https://patriotsinaction.com/"
            target="_blank"
            rel="noreferrer"
          >
            Join the Patriots in Action community
          </a>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a className="hover:underline" href="mailto:info@patriotsinaction.com">
              info@patriotsinaction.com
            </a>
            <a className="hover:underline" href="tel:+18667561776">
              866-756-1776
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-b border-patriot-border bg-patriot-bg/95 backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-patriot-red via-patriot-blue to-patriot-navy" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandLockup />

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition after:absolute after:inset-x-3 after:-bottom-1 after:h-[2px] after:origin-left after:rounded-full after:bg-patriot-red after:transition-transform after:duration-300 after:content-[\'\']',
                    isActive
                      ? 'text-patriot-navy after:scale-x-100'
                      : 'text-patriot-navy/80 after:scale-x-0 hover:text-patriot-navy hover:after:scale-x-100',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LinkButton to="/paper-ballots#take-action" variant="outline" size="sm">
              Take action
            </LinkButton>
            <LinkButton to="/action#pledge" variant="primary" size="sm">
              Join the pledge <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-patriot-border bg-patriot-bg text-patriot-navy shadow-[0_10px_30px_rgba(27,38,115,0.10)] hover:border-patriot-blue/55 hover:bg-patriot-bgSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patriot-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-patriot-bg lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-[min(420px,92vw)] border-l border-patriot-border bg-patriot-bg backdrop-blur"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-patriot-border px-4 py-3">
                <Link to="/" className="inline-flex items-center gap-3" onClick={() => setOpen(false)}>
                  <span className="font-display text-lg tracking-wide text-patriot-navy">
                    Patriots For Paper
                  </span>
                </Link>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-patriot-border bg-patriot-bg text-patriot-navy hover:border-patriot-blue/55 hover:bg-patriot-bgSoft"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 px-2 py-3">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-4 py-3 text-base font-semibold tracking-wide',
                        isActive
                          ? 'bg-patriot-bgSoft text-patriot-navy'
                          : 'text-patriot-navy/85 hover:bg-patriot-bgSoft',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto border-t border-patriot-border p-4">
                <div className="grid grid-cols-1 gap-2">
                  <LinkButton to="/paper-ballots#take-action" variant="outline" onClick={() => setOpen(false)}>
                    Take action
                  </LinkButton>
                  <LinkButton to="/action#pledge" variant="primary" onClick={() => setOpen(false)}>
                    Join the pledge <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
                <p className="mt-3 text-xs text-patriot-muted">
                  Paper ballots. Public counts. Real audits.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

