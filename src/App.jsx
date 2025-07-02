import { useState } from 'react'
import Header from './components/Header'
import Controls from './components/Controls'
import Legend from './components/Legend'
import StudyOverview from './components/1-StudyOverview'
import Methodology from './components/2-Methodology'
import KeyFindings from './components/3-KeyFindings'
import { useKnowledgeData } from './hooks/useKnowledgeData'
import Banner from './components/Banner'
import './styles/global/App.css'

function App() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentView, setCurrentView] = useState('combined')
  const [selectedConditions, setSelectedConditions] = useState(['control', 'treatment', 'handoff'])
  const { data, loading, error } = useKnowledgeData()

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>

  return (
    <div className="report-container">
      <Banner />
      <div className="main-title-section">
        <div className="main-title-container">
          <h1>
            The Impact of Heat Wave Storytelling on Climate Beliefs and Health Risk Perceptions
          </h1>
        </div>
      </div>
      <div className="container">
        <StudyOverview />
        <Methodology />
        <KeyFindings />
      </div>
    </div>
  )
}

export default App