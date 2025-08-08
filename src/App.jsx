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
import ScrollytellingApp from './components/ScrollytellingApp'
import { formatGreysAnatomyInDOM } from './utils/textFormatting'
// Import emergency scroll fix for debugging
import './utils/emergencyScrollFix'
import './styles/global/App.css'

function App() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentView, setCurrentView] = useState('combined')
  const [selectedConditions, setSelectedConditions] = useState(['control', 'treatment', 'handoff'])
  const [isFullReportExpanded, setIsFullReportExpanded] = useState(false)
  const [expandAllDetails, setExpandAllDetails] = useState(false)
  const [isScrollyMode, setIsScrollyMode] = useState(false)
  const { data, loading, error } = useKnowledgeData()

  // Check URL hash on mount and when it changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      if (hash === '#fullexpand') {
        setIsFullReportExpanded(true)
        setExpandAllDetails(true)
      } else if (hash === '#scrolly') {
        setIsScrollyMode(true)
      }
    }

    // Check on mount
    checkHash()

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Format Grey's Anatomy text after component renders and whenever content changes
  useEffect(() => {
    formatGreysAnatomyInDOM()
  }, [isFullReportExpanded, data]) // Re-run when report expands/collapses or data changes

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>

  // Render scrollytelling version if active
  if (isScrollyMode) {
    return <ScrollytellingApp />
  }

  return (
    <div className="app-wrapper">
      <PleaseRotatePrompt />
      {isFullReportExpanded && <TableOfContents />}
      
      {/* Scrolly Mode Toggle Button - TEMPORARILY HIDDEN */}
      {/* <button 
        className="scrolly-toggle-btn"
        onClick={() => window.location.hash = '#scrolly'}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        ✨ Try Scrolly Version
      </button> */}
      
      <div className="report-container">
        <Banner />
        <div className="main-title-section">
          <div className="main-title-container">
            <h1 className="main-title">
              Primetime in a Warming World:
            </h1>
            <h2 className="main-subtitle">
              Can Medical Dramas Prepare Us for Extreme Heat?
            </h2>
            <div className="title-divider"></div>
          </div>
        </div>
        <div className="container">
          <StudyOverview />
          <FullReportCollapse 
            onToggle={setIsFullReportExpanded}
            forceExpanded={expandAllDetails}
          >
            <Methodology expandAllDetails={expandAllDetails} />
            <KeyFindings />
          </FullReportCollapse>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App