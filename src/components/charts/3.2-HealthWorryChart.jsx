import { useState, useRef } from 'react'
import { useThreatData } from '../../hooks/useThreatData'
import { HEALTH_ISSUES, RESPONSE_CATEGORIES, WAVE_LABELS } from '../../constants'
import LikertChart from '../base/LikertChart'
import UnifiedChartContainer from '../base/UnifiedChartContainer'
import { useChartDownload } from '../../hooks/useChartDownload'

const CONDITIONS = ["Control", "Heat Wave", "Multiplatform Group"]

const HEALTH_ITEMS = HEALTH_ISSUES.map(issue => ({
  label: issue,
  value: issue,
  dataKey: 'health_issue'
}))

function HealthWorryChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { threatData, loading, error } = useThreatData()
  const svgRef = useRef() // Add svgRef for consistency
  const { chartRef, generateFilename } = useChartDownload('health-worry')

  if (loading) return <div className="loading">Loading health worry data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!threatData || threatData.length === 0) return <div className="loading">No threat data available...</div>

  return (
    <UnifiedChartContainer
      chartRef={chartRef}
      svgRef={svgRef}
      filename={generateFilename({ wave: currentWave })}
      showWaveControls={true}
      currentWave={currentWave}
      onWaveChange={setCurrentWave}
      availableWaves={[2, 3]}
      className="health-worry-chart"
    >
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
    </UnifiedChartContainer>
  )
}

export default HealthWorryChart