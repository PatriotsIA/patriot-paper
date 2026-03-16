import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { Footer } from './Footer'
import { ScrollProgress } from '../motion/ScrollProgress'
import { BackToTop } from '../motion/BackToTop'

export function SiteLayout() {
  return (
    <div className="page-shell">
      <ScrollProgress />
      <NavBar />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}

