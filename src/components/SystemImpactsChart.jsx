import { useState } from 'react'
import { useSystemImpactsData } from '../hooks/useSystemImpactsData'
import { SYSTEM_IMPACTS, IMPACT_CATEGORIES, WAVE_LABELS } from '../constants'
import LikertChart from './base/LikertChart'
import './SystemImpactsChart.css'

const CONDITIONS = ["Control", "Heat Wave", "Heat Wave + Handoff"]

const SYSTEM_ITEMS = SYSTEM_IMPACTS.map(impact => ({
  label: impact,
  value: impact,
  dataKey: 'system_impact'
}))

function SystemImpactsChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { systemImpactsData, loading, error } = useSystemImpactsData()

  if (loading) return <div className="loading">Loading system impacts data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!systemImpactsData || systemImpactsData.length === 0) return <div className="loading">No system impacts data available...</div>

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
        data={systemImpactsData}
        categories={IMPACT_CATEGORIES}
        items={SYSTEM_ITEMS}
        conditions={CONDITIONS}
        title="Perceived System Impacts of Heat Waves"
        subtitle='"How much do you think heatwaves would impact the following systems in your community?"'
        currentWave={currentWave}
        waveLabels={WAVE_LABELS}
        className="chart-container"
      />
    </div>
  )
}

export default SystemImpactsChart
