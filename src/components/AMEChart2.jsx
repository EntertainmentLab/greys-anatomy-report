import React, { useState } from 'react'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import { processDataForVisualization } from '../utils/ameChartUtils'
import AMEBarChart from './base/AMEBarChart'
import SurveyItemsPopup from './SurveyItemsPopup'
import '../styles/AMEChart.css'

function AMEChart2() {
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")
  const [surveyPopupOpen, setSurveyPopupOpen] = useState(false)
  const [selectedConstruct, setSelectedConstruct] = useState('')

  const outcomeMapping = {
    "Heat and Policy Support": "Heat and Policy Support",
    "Healthcare Worker Responsibility": "Perceived Responsibility of Healthcare Workers"
  }

  const dataOutcomes = [
    "Heat and Policy Support",
    "Healthcare Worker Responsibility"
  ]

  // Process data
  const chartData = React.useMemo(() => {
    if (!ameData || ameData.length === 0) return []
    const waveData = ameData.filter(item => item.wave === currentWave)
    return processDataForVisualization(waveData, outcomeMapping, dataOutcomes)
  }, [ameData, currentWave])

  const handleConstructClick = (outcome) => {
    setSelectedConstruct(outcome)
    setSurveyPopupOpen(true)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>

  return (
    <div className="ame-charts-container">
      <div className="ame-chart">
        <div className="wave-controls">
          <button 
            className={`wave-tab ${currentWave === "Immediate" ? 'active' : ''}`}
            onClick={() => setCurrentWave("Immediate")}
          >
            {WAVE_LABELS[2]}
          </button>
          <button 
            className={`wave-tab ${currentWave === "15 Days" ? 'active' : ''}`}
            onClick={() => setCurrentWave("15 Days")}
          >
            {WAVE_LABELS[3]}
          </button>
        </div>
        
        <AMEBarChart
          data={chartData}
          title="Policy Support and Healthcare Worker Responsibility"
          subtitle={`Comparing Heat Wave Episode and Heat Wave + Social Media to Control (${WAVE_LABELS[currentWave === "Immediate" ? 2 : 3]})`}
          maxValue={0.8}
          onOutcomeClick={handleConstructClick}
        />
      </div>
      
      <SurveyItemsPopup 
        isOpen={surveyPopupOpen}
        onClose={() => setSurveyPopupOpen(false)}
        constructName={selectedConstruct}
      />
    </div>
  )
}

export default AMEChart2