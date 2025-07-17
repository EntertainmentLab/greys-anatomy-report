import { useState } from 'react'
import { useThreatData } from '../../hooks/useThreatData'
import { HEALTH_ISSUES, RESPONSE_CATEGORIES, WAVE_LABELS } from '../../constants'
import LikertChart from '../base/LikertChart'
// CSS imported via main.css

const CONDITIONS = ["Control", "Heat Wave", "Multiplatform Group"]

const HEALTH_ITEMS = HEALTH_ISSUES.map(issue => ({
  label: issue,
  value: issue,
  dataKey: 'health_issue'
}))

function HealthWorryChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { threatData, loading, error } = useThreatData()

  if (loading) return <div className="loading">Loading health worry data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!threatData || threatData.length === 0) return <div className="loading">No threat data available...</div>

  return (
    <div className="health-worry-container">
      <div className="wave-controls">
        <button 
          className={`wave-tab ${currentWave === 2 ? 'active' : ''}`}
          onClick={() => setCurrentWave(2)}
        >
          {WAVE_LABELS[2]}
        </button>
        <button 
          className={`wave-tab ${currentWave === 3 ? 'active' : ''}`}
          onClick={() => setCurrentWave(3)}
        >
          {WAVE_LABELS[3]}
        </button>
      </div>
      
      <LikertChart
        data={threatData}
        categories={RESPONSE_CATEGORIES}
        items={HEALTH_ITEMS}
        conditions={CONDITIONS}
        title="Perceived Threat of Heat Waves on Health Issues"
        subtitle='"If you were experiencing a severe heat wave, how worried would you be about the following health issues harming you, your family, or people in your community?"'
        currentWave={currentWave}
        waveLabels={WAVE_LABELS}
        className="chart-container"
      />
    </div>
  )
}

export default HealthWorryChart