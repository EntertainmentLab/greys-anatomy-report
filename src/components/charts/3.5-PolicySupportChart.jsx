import { useState, useRef } from 'react'
import { usePolicyData } from '../../hooks/usePolicyData'
import { useUnifiedDumbbellChart } from '../base/useUnifiedDumbbellChart'
import UnifiedChartContainer from '../base/UnifiedChartContainer'
import { useChartDownload } from '../../hooks/useChartDownload'
import { normalizeChartData } from '../../utils/chartDataUtils'

function PolicySupportChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: policyData, loading, error } = usePolicyData()
  const svgRef = useRef()
  const previousWaveData = useRef(null)
  const previousWave = useRef(2)
  const { chartRef, generateFilename } = useChartDownload('policy-support')

  const politicalParties = ['Overall', 'Democrat', 'Independent', 'Republican']
  const processedData = normalizeChartData(policyData)

  // Handle wave change with previous data storage
  const handleWaveChange = (newWave) => {
    if (newWave === currentWave) return
    
    // Store current wave data before changing
    if (policyData && policyData.length > 0) {
      previousWaveData.current = normalizeChartData(policyData.filter(item => item.wave === currentWave))
    }
    
    previousWave.current = currentWave
    setCurrentWave(newWave)
  }

  useUnifiedDumbbellChart({
    svgRef,
    data: processedData,
    currentWave,
    previousData: previousWaveData.current,
    groupBy: 'political_party', // Group by political party instead of category
    categoryFilter: "Policy Support Average", // Filter to specific category
    title: 'Heat Episode Impact on Policy Support',
    subtitle: 'Average of government investment and cooling center support by political affiliation',
    xAxisLabel: 'Difference from Control (percentage points)',
    yAxisItems: politicalParties,
    xDomain: [-4, 10], // Set specific range from -4 to +10
    calculateDifferences: true
  })

  if (loading) return <div className="loading">Loading policy support data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!policyData || policyData.length === 0) {
    return <div className="loading">No policy support data available...</div>
  }

  return (
    <UnifiedChartContainer
      chartRef={chartRef}
      svgRef={svgRef}
      filename={generateFilename({ wave: currentWave })}
      showWaveControls={true}
      currentWave={currentWave}
      onWaveChange={handleWaveChange}
      availableWaves={[2, 3]}
      className="policy-support-chart"
    />
  )
}

export default PolicySupportChart