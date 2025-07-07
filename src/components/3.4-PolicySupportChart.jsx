import { useState, useRef } from 'react'
import { usePolicyData } from '../hooks/usePolicyData'
import { WAVE_LABELS } from '../constants'
import { useEnhancedChart } from './base/EnhancedChart'
import '../styles/components/Chart-Dumbbell.css'

function PolicySupportChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentPolicyType, setPolicyType] = useState("Government Investment")
  const { data: policyData, loading, error } = usePolicyData()
  const svgRef = useRef()
  const waveControlsRef = useRef()

  const policyTypes = ["Government Investment", "Cooling Centers"]
  const politicalParties = ['Overall', 'Democrat', 'Independent', 'Republican']

  useEnhancedChart({
    svgRef,
    data: policyData,
    currentWave,
    currentCategory: currentPolicyType,
    xDomain: [-10, 15],
    title: 'Heat Episode Impact on Policy Support',
    subtitle: 'Percentage point difference from control group by political affiliation',
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
      <div className="policy-type-controls">
        {policyTypes.map(policy => (
          <button
            key={policy}
            className={`policy-type-toggle ${currentPolicyType === policy ? 'active' : ''}`}
            onClick={() => setPolicyType(policy)}
          >
            {policy}
          </button>
        ))}
      </div>

      <div className="chart-container" style={{ position: 'relative' }}>
        <svg ref={svgRef}></svg>
        <div ref={waveControlsRef} className="wave-controls embedded">
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
  )
}

export default PolicySupportChart