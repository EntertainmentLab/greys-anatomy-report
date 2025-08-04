import { useState, useRef } from 'react'
import { useKnowledgeData } from '../../hooks/useKnowledgeData'
import { KNOWLEDGE_CATEGORIES } from '../../constants'
import { useUnifiedDumbbellChart } from '../base/useUnifiedDumbbellChart'
import UnifiedChartContainer from '../base/UnifiedChartContainer'
import { useChartDownload } from '../../hooks/useChartDownload'
import { normalizeChartData, filterChartData } from '../../utils/chartDataUtils'

function KnowledgeAccuracyChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: knowledgeData, loading, error } = useKnowledgeData()
  const svgRef = useRef()
  const previousWaveData = useRef(null)
  const previousWave = useRef(2)
  const { chartRef, generateFilename } = useChartDownload('knowledge-accuracy')

  // Process and filter data
  const processedData = normalizeChartData(knowledgeData)
  const filteredCategories = KNOWLEDGE_CATEGORIES.filter(category => category !== 'Cancer')

  // Handle wave change with previous data storage
  const handleWaveChange = (newWave) => {
    if (newWave === currentWave) return
    
    // Store current wave data before changing
    if (knowledgeData && knowledgeData.length > 0) {
      previousWaveData.current = normalizeChartData(knowledgeData.filter(item => item.wave === currentWave))
    }
    
    previousWave.current = currentWave
    setCurrentWave(newWave)
  }

  useUnifiedDumbbellChart({
    svgRef,
    data: processedData,
    currentWave,
    previousData: previousWaveData.current,
    groupBy: 'category', // Default grouping by category
    title: 'Heat Episode Impact on Health Knowledge',
    subtitle: 'Percentage point difference from control group by knowledge category',
    xAxisLabel: 'Difference from Control (percentage points)',
    yAxisLabel: 'Health Risks Associated with Extreme Heat',
    yAxisItems: filteredCategories,
    xDomain: null, // Let it auto-calculate the range
    calculateDifferences: true
  })

  if (loading) return <div className="loading">Loading knowledge accuracy data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!knowledgeData || knowledgeData.length === 0) {
    return <div className="loading">No knowledge data available...</div>
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
      className="knowledge-accuracy-chart"
    />
  )
}

export default KnowledgeAccuracyChart