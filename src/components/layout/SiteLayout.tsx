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
      <main className="relative mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}

