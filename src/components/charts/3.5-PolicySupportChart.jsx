import { useState, useRef } from 'react'
import { usePolicyData } from '../../hooks/usePolicyData'
import { useUnifiedDumbbellChart } from '../base/useUnifiedDumbbellChart'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'
import { normalizeChartData } from '../../utils/chartDataUtils'
import { WAVE_LABELS } from '../../constants'

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

  // Function to get all available views for download all
  const getAllViews = async () => {
    return [
      { value: 2, label: WAVE_LABELS[2] },
      { value: 3, label: WAVE_LABELS[3] }
    ]
  }

  // Function to change the view programmatically for downloads
  const changeViewForDownload = async (value) => {
    setCurrentWave(value)
    // Wait for state update - same as temporal chart
    await new Promise(resolve => setTimeout(resolve, 100))
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
    <div className="unified-chart-container policy-support-chart" ref={chartRef} style={{ position: 'relative' }}>
      {/* Download Button with Download All */}
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename({ wave: currentWave })}
        position="top-right"
        enableDownloadAll={true}
        getAllViews={getAllViews}
        onViewChange={changeViewForDownload}
      />

      {/* Wave Controls */}
      <div className="wave-controls-container">
        <div className="wave-controls">
          {[2, 3].map(wave => (
            <button 
              key={wave}
              className={`wave-tab ${currentWave === wave ? 'active' : ''}`}
              onClick={() => handleWaveChange(wave)}
            >
              {WAVE_LABELS[wave]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart SVG */}
      <div className="chart-svg-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default PolicySupportChart