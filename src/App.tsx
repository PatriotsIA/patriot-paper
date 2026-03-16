import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { HomePage } from './pages/HomePage'
import { WhyPaperPage } from './pages/WhyPaperPage'
import { ActionToolkitPage } from './pages/ActionToolkitPage'
import { RequestHelpPage } from './pages/RequestHelpPage'
import { AboutPage } from './pages/AboutPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/paper-ballots" element={<WhyPaperPage />} />
        <Route path="/action" element={<ActionToolkitPage />} />
        <Route path="/request-help" element={<RequestHelpPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
