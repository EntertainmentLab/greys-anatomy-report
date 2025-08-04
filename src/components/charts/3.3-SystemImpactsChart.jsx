import { useState, useRef } from 'react'
import { useImpactsData } from '../../hooks/useImpactsData'
import { SYSTEM_IMPACT_ISSUES, SYSTEM_RESPONSE_CATEGORIES, WAVE_LABELS } from '../../constants'
import LikertChart from '../base/LikertChart'
import UnifiedChartContainer from '../base/UnifiedChartContainer'
import { useChartDownload } from '../../hooks/useChartDownload'

const CONDITIONS = ["Control", "Heat Wave", "Multiplatform Group"]

const SYSTEM_ITEMS = SYSTEM_IMPACT_ISSUES.map(issue => ({
  label: issue,
  value: issue,
  dataKey: 'impact_issue'
}))

function SystemImpactsChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { impactsData, loading, error } = useImpactsData()
  const svgRef = useRef() // Add svgRef for consistency
  const { chartRef, generateFilename } = useChartDownload('system-impacts')

  if (loading) return <div className="loading">Loading system impacts data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!impactsData || impactsData.length === 0) return <div className="loading">No system impacts data available...</div>

  return (
    <UnifiedChartContainer
      chartRef={chartRef}
      svgRef={svgRef}
      filename={generateFilename({ wave: currentWave })}
      showWaveControls={true}
      currentWave={currentWave}
      onWaveChange={setCurrentWave}
      availableWaves={[2, 3]}
      className="system-impacts-chart"
    >
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
    </UnifiedChartContainer>
  )
}

export default SystemImpactsChart

