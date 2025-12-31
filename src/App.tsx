import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/common/ScrollToTop'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import DetailPage from './pages/DetailPage'
import ComparePage from './pages/ComparePage'
import SimulatorPage from './pages/SimulatorPage'
import CalendarPage from './pages/CalendarPage'
import PhasePage from './pages/PhasePage'
import PhaseDetailPage from './pages/PhaseDetailPage'
import CorrelationPage from './pages/CorrelationPage'
import ThemePage from './pages/ThemePage'

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/etf/:id" element={<DetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/phase" element={<PhasePage />} />
        <Route path="/phase/detail" element={<PhaseDetailPage />} />
        <Route path="/correlation" element={<CorrelationPage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/theme/:themeId" element={<ThemePage />} />
      </Routes>
    </Layout>
  )
}

export default App

