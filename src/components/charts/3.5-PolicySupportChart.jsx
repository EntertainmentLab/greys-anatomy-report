import { useState, useRef } from 'react'
import { usePolicyData } from '../../hooks/usePolicyData'
import { WAVE_LABELS } from '../../constants'
import { useEnhancedChart } from '../base/EnhancedChart'
// CSS imported via main.css

function PolicySupportChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: policyData, loading, error } = usePolicyData()
  const svgRef = useRef()
  const waveControlsRef = useRef()

  const politicalParties = ['Overall', 'Democrat', 'Independent', 'Republican']

  useEnhancedChart({
    svgRef,
    data: policyData,
    currentWave,
    currentCategory: "Policy Support Average", // Use the new averaged category
    xDomain: [-4, 10],
    title: 'Heat Episode Impact on Policy Support',
    subtitle: 'Average of government investment and cooling center support by political affiliation',
    xAxisLabel: 'Difference from Control (percentage points)',
    chartType: 'policy',
    yAxisItems: politicalParties,
    waveControlsRef,
  })

  if (loading) return <div className="loading">Loading policy support data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!policyData || policyData.length === 0) {
    return <div className="loading">No policy support data available...</div>
  }

  return (
    <div className="chart-container-wrapper">
      <div className="dumbbell-chart-container">
        <svg ref={svgRef} className="dumbbell-chart-svg"></svg>
        <div ref={waveControlsRef} className="wave-controls-container">
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
        </div>
      </div>
    </div>
  )
}

export default PolicySupportChart