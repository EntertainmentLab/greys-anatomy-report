import { useState } from 'react'
import Header from './components/Header'
import Controls from './components/Controls'
import Legend from './components/Legend'
import StudyOverview from './components/StudyOverview'
import Methodology from './components/Methodology'
import KeyFindings from './components/KeyFindings'
import { useKnowledgeData } from './hooks/useKnowledgeData'
import './App.css'

function App() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentView, setCurrentView] = useState('combined')
  const [selectedConditions, setSelectedConditions] = useState(['control', 'treatment', 'handoff'])
  const [isEditMode, setIsEditMode] = useState(false)
  const { data, loading, error } = useKnowledgeData()

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>

  return (
    <div className="report-container">
      <Header isEditMode={isEditMode} />
      
      <div className="edit-controls">
        <button 
          className={`edit-btn ${isEditMode ? 'active' : ''}`}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? 'Exit Edit' : 'Edit Text'}
        </button>
      </div>
      
      <div className="report-content">
        <StudyOverview isEditMode={isEditMode} />
        <Methodology isEditMode={isEditMode} />
        <KeyFindings isEditMode={isEditMode} />
      </div>
    </div>
  )
}

export default App