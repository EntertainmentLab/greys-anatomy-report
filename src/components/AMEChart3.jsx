import React, { useState } from 'react'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import { processDataForVisualization } from '../utils/ameChartUtils'
import AMEBarChart from './base/AMEBarChart'
import '../styles/AMEChart.css'

function AMEChart3() {
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")

  const outcomeMapping = {
    "Climate Change Personal Impact": "Personal Impact of Climate Change",
    "Climate Change Support for Action": "Climate Change - Support for Action"
  }

  const dataOutcomes = [
    "Climate Change Personal Impact",
    "Climate Change Support for Action"
  ]

  // Process data
  const chartData = React.useMemo(() => {
    if (!ameData || ameData.length === 0) return []
    const waveData = ameData.filter(item => item.wave === currentWave)
    return processDataForVisualization(waveData, outcomeMapping, dataOutcomes)
  }, [ameData, currentWave])

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
          title="Climate Change Impact and Action Support"
          subtitle={`Comparing Heat Wave Episode and Heat Wave + Social Media to Control (${WAVE_LABELS[currentWave === "Immediate" ? 2 : 3]})`}
          maxValue={0.8}
        />
      </div>
    </div>
  )
}

export default AMEChart3