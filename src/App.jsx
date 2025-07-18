import { useState, useEffect } from 'react'
import Header from './components/ui/Header'
import Controls from './components/ui/Controls'
import Legend from './components/ui/Legend'
import StudyOverview from './components/sections/1-StudyOverview'
import Methodology from './components/sections/2-Methodology'
import KeyFindings from './components/sections/3-KeyFindings'
import FullReportCollapse from './components/ui/FullReportCollapse'
import { useKnowledgeData } from './hooks/useKnowledgeData'
import Banner from './components/ui/Banner'
import PleaseRotatePrompt from './components/ui/PleaseRotatePrompt'
import TableOfContents from './components/ui/TableOfContents'
import Footer from './components/ui/Footer'
import { formatGreysAnatomyInDOM } from './utils/textFormatting'
import './styles/global/App.css'

function App() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentView, setCurrentView] = useState('combined')
  const [selectedConditions, setSelectedConditions] = useState(['control', 'treatment', 'handoff'])
  const [isFullReportExpanded, setIsFullReportExpanded] = useState(false)
  const { data, loading, error } = useKnowledgeData()

  // Format Grey's Anatomy text after component renders and whenever content changes
  useEffect(() => {
    formatGreysAnatomyInDOM()
  }, [isFullReportExpanded, data]) // Re-run when report expands/collapses or data changes

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>

  return (
    <div className="app-wrapper">
      <PleaseRotatePrompt />
      {isFullReportExpanded && <TableOfContents />}
      <div className="report-container">
        <Banner />
        <div className="main-title-section">
          <div className="main-title-container">
            <h1 className="main-title">
              Primetime in a Warming World: Can Medical Dramas Prepare Us for Extreme Heat?
            </h1>
          </div>
        </div>
        <div className="container">
          <StudyOverview />
          <FullReportCollapse onToggle={setIsFullReportExpanded}>
            <Methodology />
            <KeyFindings />
          </FullReportCollapse>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App