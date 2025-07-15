import { useState } from 'react'
import { useImpactsData } from '../../hooks/useImpactsData'
import { SYSTEM_IMPACT_ISSUES, SYSTEM_RESPONSE_CATEGORIES, WAVE_LABELS } from '../../constants'
import LikertChart from '../base/LikertChart'
// CSS imported via main.css

const CONDITIONS = ["Control", "Heat Wave", "Heat Wave + Handoff"]

const SYSTEM_ITEMS = SYSTEM_IMPACT_ISSUES.map(issue => ({
  label: issue,
  value: issue,
  dataKey: 'impact_issue'
}))

function SystemImpactsChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { impactsData, loading, error } = useImpactsData()

  if (loading) return <div className="loading">Loading system impacts data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!impactsData || impactsData.length === 0) return <div className="loading">No system impacts data available...</div>

  return (
    <div className="system-impacts-container">
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
        data={impactsData}
        categories={SYSTEM_RESPONSE_CATEGORIES}
        items={SYSTEM_ITEMS}
        conditions={CONDITIONS}
        title="Perceived Threat of Heat Waves on Hospital Systems"
        subtitle='"How concerned are you that severe heat waves in your local area could result in the following impacts."'
        currentWave={currentWave}
        waveLabels={WAVE_LABELS}
        className="chart-container"
      />
    </div>
  )
}

export default SystemImpactsChart

