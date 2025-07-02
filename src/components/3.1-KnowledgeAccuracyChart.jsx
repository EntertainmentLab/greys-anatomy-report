import { useState, useRef } from 'react'
import { useKnowledgeData } from '../hooks/useKnowledgeData'
import { WAVE_LABELS } from '../constants'
import { useEnhancedChart } from './base/EnhancedChart'
import '../styles/components/Chart-Dumbbell.css'

function KnowledgeAccuracyChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const [currentPoliticalParty, setCurrentPoliticalParty] = useState('Overall')
  const { data: knowledgeData, loading, error } = useKnowledgeData()
  const svgRef = useRef()

  const politicalParties = ['Overall', 'Democrat', 'Republican', 'Independent']
  const knowledgeCategories = ['Heart Attacks', 'Organ Failure', 'Premature Labor', 'Violent Crime']

  useEnhancedChart({
    svgRef,
    data: knowledgeData,
    currentWave,
    currentPoliticalParty,
    xDomain: [20, 90],
    title: 'Knowledge Accuracy Across Conditions',
    subtitle: `Average accuracy scores for health-related knowledge questions (${currentPoliticalParty})`,
    xAxisLabel: 'Average Accuracy (%)',
    chartType: 'knowledge',
    yAxisItems: knowledgeCategories,
    dataFilter: (data) => data.filter(d => d.category !== 'Cancer'),
  })

  if (loading) return <div className="loading">Loading knowledge accuracy data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!knowledgeData || knowledgeData.length === 0) {
    return <div className="loading">No knowledge data available...</div>
  }

  return (
    <div className="chart-container-wrapper">
      <div className="political-party-controls">
        {politicalParties.map(party => (
          <button
            key={party}
            className={`political-party-toggle ${currentPoliticalParty === party ? 'active' : ''}`}
            onClick={() => setCurrentPoliticalParty(party)}
          >
            {party}
          </button>
        ))}
      </div>

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
      
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default KnowledgeAccuracyChart
