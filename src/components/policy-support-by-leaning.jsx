import { useState, useRef } from 'react'
import { usePolicyByLeaningData } from '../hooks/usePolicyByLeaningData'
import { WAVE_LABELS } from '../constants'
import { useEnhancedChart } from './base/EnhancedChart'
import '../styles/components/Chart-Dumbbell.css'

function PolicySupportByLeaning() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentOrientation, setCurrentOrientation] = useState(0)
  const { data: policyData, loading, error } = usePolicyByLeaningData()
  const svgRef = useRef()
  const waveControlsRef = useRef()
  // Map political orientations to slider values
  const orientationMap = {
    0: 'Left (0-2)',
    1: 'Center-Left (3-5)',
    2: 'Center-Right (6-8)',
    3: 'Right (9-10)'
  }

  // Get the current orientation label
  const currentOrientationLabel = orientationMap[currentOrientation]

  const policyCategories = ["Government Investment", "Cooling Centers"]

  useEnhancedChart({
    svgRef,
    data: policyData,
    currentWave,
    currentPoliticalParty: currentOrientationLabel,
    xDomain: [-10, 15],
    title: 'Heat Episode Impact on Policy Support by Political Orientation',
    subtitle: 'Percentage point difference from control group by political leaning',
    xAxisLabel: 'Difference from Control (percentage points)',
    chartType: 'policy',
    yAxisItems: policyCategories,
    waveControlsRef,
    dataFilter: (filteredData) => {
      // Filter by current orientation instead of category
      return filteredData.filter(d => d.pol_orientation === currentOrientationLabel)
    }
  })

  if (loading) return <div className="loading">Loading policy support by leaning data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!policyData || policyData.length === 0) {
    return <div className="loading">No policy support by leaning data available...</div>
  }

  const handleSliderChange = (event) => {
    setCurrentOrientation(parseInt(event.target.value))
  }

  return (
    <div className="chart-container-wrapper">
      <div className="orientation-controls">
        <label htmlFor="orientation-slider" className="slider-label">
          Political Orientation: <strong>{currentOrientationLabel}</strong>
        </label>
        <div className="slider-container">
          <span className="slider-label-left">Left</span>
          <input
            id="orientation-slider"
            type="range"
            min="0"
            max="3"
            value={currentOrientation}
            onChange={handleSliderChange}
            className="orientation-slider"
          />
          <span className="slider-label-right">Right</span>
        </div>
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
          <button 
            className={`wave-tab ${currentWave === 4 ? 'active' : ''}`}
            onClick={() => setCurrentWave(4)}
          >
            {WAVE_LABELS[4]}
          </button>
          <button 
            className={`wave-tab ${currentWave === 5 ? 'active' : ''}`}
            onClick={() => setCurrentWave(5)}
          >
            {WAVE_LABELS[5]}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PolicySupportByLeaning