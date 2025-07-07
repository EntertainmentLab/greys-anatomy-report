import { useState, useRef } from 'react'
import { useKnowledgeData } from '../hooks/useKnowledgeData'
import { WAVE_LABELS, KNOWLEDGE_CATEGORIES } from '../constants'
import { useEnhancedChart } from './base/EnhancedChart'
import '../styles/components/Chart-Dumbbell.css'

function KnowledgeAccuracyChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: knowledgeData, loading, error } = useKnowledgeData()
  const svgRef = useRef()
  const waveControlsRef = useRef()

  useEnhancedChart({
    svgRef,
    data: knowledgeData,
    currentWave,
    xDomain: [-5, 15],
    title: 'Heat Episode Impact on Health Knowledge',
    subtitle: `Percentage point difference from control group by knowledge category`,
    xAxisLabel: 'Difference from Control (percentage points)',
    chartType: 'knowledge',
    yAxisItems: KNOWLEDGE_CATEGORIES,
    dataFilter: (data) => data.filter(d => d.category !== 'Cancer'),
    waveControlsRef,
  })

  if (loading) return <div className="loading">Loading knowledge accuracy data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!knowledgeData || knowledgeData.length === 0) {
    return <div className="loading">No knowledge data available...</div>
  }

  return (
    <div className="chart-container-wrapper">
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

export default KnowledgeAccuracyChart