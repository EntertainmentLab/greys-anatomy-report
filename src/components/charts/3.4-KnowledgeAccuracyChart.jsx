import { useState, useRef } from 'react'
import { useKnowledgeData } from '../../hooks/useKnowledgeData'
import { KNOWLEDGE_CATEGORIES } from '../../constants'
import { useUnifiedDumbbellChart } from '../base/useUnifiedDumbbellChart'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'
import { normalizeChartData, filterChartData } from '../../utils/chartDataUtils'
import { WAVE_LABELS } from '../../constants'

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
    <div className="unified-chart-container knowledge-accuracy-chart" ref={chartRef} style={{ position: 'relative' }}>
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

export default KnowledgeAccuracyChart