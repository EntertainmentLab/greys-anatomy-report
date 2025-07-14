import React, { useState, useRef } from 'react'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import { processDataForVisualization } from '../utils/ameChartUtils'
import AMEBarChart from './base/AMEBarChart'
import SurveyItemsPopup from './SurveyItemsPopup'
import '../styles/AMEChart.css'

function AMEChart1() {
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")
  const [surveyPopupOpen, setSurveyPopupOpen] = useState(false)
  const [selectedConstruct, setSelectedConstruct] = useState('')
  const previousWaveData = useRef(null)
  const previousWave = useRef("Immediate")

  const outcomeMapping = {
    "Heatwave Likelihood of Exposure": "Perceived Likelihood of Heat Wave Exposure",
    "Heatwave Threat Severity": "Perceived Heat Wave Threat Severity",
    "Heatwave Threat Health Impact": "Perceived Threat of Heat Waves on Health",
    "Heatwave Impact Knowledge": "Knowledge of the Impact of Heat Waves"
  }

  const dataOutcomes = [
    "Heatwave Likelihood of Exposure",
    "Heatwave Threat Severity",
    "Heatwave Threat Health Impact",
    "Heatwave Impact Knowledge"
  ]

  // Process data
  const chartData = React.useMemo(() => {
    if (!ameData || ameData.length === 0) return []
    const waveData = ameData.filter(item => item.wave === currentWave)
    return processDataForVisualization(waveData, outcomeMapping, dataOutcomes)
  }, [ameData, currentWave])

  // Handle wave transition with previous data storage
  const handleWaveChange = (newWave) => {
    if (newWave === currentWave) return
    
    // Store current wave data before changing
    if (ameData && ameData.length > 0) {
      const currentWaveData = ameData.filter(item => item.wave === currentWave)
      previousWaveData.current = processDataForVisualization(currentWaveData, outcomeMapping, dataOutcomes)
    }
    
    // Change to new wave
    setCurrentWave(newWave)
  }

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
            onClick={() => handleWaveChange("Immediate")}
          >
            {WAVE_LABELS[2]}
          </button>
          <button 
            className={`wave-tab ${currentWave === "15 Days" ? 'active' : ''}`}
            onClick={() => handleWaveChange("15 Days")}
          >
            {WAVE_LABELS[3]}
          </button>
        </div>
        
        <AMEBarChart
          data={chartData}
          previousData={previousWaveData.current}
          title="Heat Wave Perception and Knowledge"
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

export default AMEChart1