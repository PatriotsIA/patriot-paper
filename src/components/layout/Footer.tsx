import { NavLink } from 'react-router-dom'
import { BrandMark } from '../brand/Brand'
import { cn } from '../../lib/cn'
import { CONTACT_EMAIL } from '../../config/contact'

export function Footer() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-semibold text-patriot-white/80 transition hover:text-patriot-white',
      isActive && 'text-patriot-white',
    )

  return (
    <footer className="relative bg-patriot-navy text-patriot-white">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-patriot-red" />
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-10 w-10" />
              <div>
                <div className="font-display text-3xl font-semibold tracking-tight">Patriots For Paper</div>
                <div className="text-sm text-patriot-white/70">
                  Return elections to auditable paper ballots.
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-patriot-white/75">
              A citizen education and action project focused on paper ballots, transparent public
              counts, and routine audits—so elections can be verified by ordinary people.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-patriot-white/70">
              Pages
            </div>
            <div className="mt-3 grid gap-2">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/paper-ballots" className={linkClass}>
                Why Paper Ballots
              </NavLink>
              <NavLink to="/action" className={linkClass}>
                Action Toolkit
              </NavLink>
              <NavLink to="/request-help" className={linkClass}>
                Request Help
              </NavLink>
              <NavLink to="/about" className={linkClass}>
                About & Support
              </NavLink>
              <NavLink to="/privacy" className={linkClass}>
                Privacy
              </NavLink>
              <NavLink to="/terms" className={linkClass}>
                Terms
              </NavLink>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-patriot-white/70">
              Contact
            </div>
            <div className="mt-3 grid gap-2 text-sm text-patriot-white/80">
              <a className="hover:text-patriot-white" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              <a className="hover:text-patriot-white" href="https://patriotsinaction.com/" target="_blank" rel="noreferrer">
                PatriotsInAction.com
              </a>
              <a className="hover:text-patriot-white" href="https://shop.patriotsinaction.com/" target="_blank" rel="noreferrer">
                Merch Store
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-y border-white/15 py-5">
          <div className="text-xs leading-relaxed text-patriot-white/80">
            Patriots For Paper is a civic education initiative. Always verify current local and
            state election law before taking action.
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-xs text-patriot-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Patriots For Paper</div>
          <div className="font-medium tracking-wide">Paper ballots. Public counts. Real audits.</div>
        </div>
      </div>
    </footer>
  )
}

