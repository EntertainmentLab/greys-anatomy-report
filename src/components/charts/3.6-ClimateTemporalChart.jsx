import { useRef } from 'react'
import { useClimateTemporalData } from '../../hooks/useClimateTemporalData'
import { COLOR_MAP } from '../../constants'
import { useTemporalChart } from '../base/TemporalChart'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'
// CSS imported via main.css

// Define conditions with your color scheme
const CLIMATE_CONDITIONS = [
  { name: "Control", color: COLOR_MAP.control },
  { name: "Heat Wave", color: COLOR_MAP.treatment },
  { name: "Multiplatform Group", color: COLOR_MAP.handoff }
]

// Define wave mapping including intermediate time points
const WAVE_MAPPING = {
  1: "Baseline\n(7 Days Before)",
  2: "Immediately\nAfter Viewing",
  3: "15 Days\nLater"
};

function ClimateTemporalChart() {
  const { climateTemporalData, loading, error } = useClimateTemporalData()
  const svgRef = useRef()
  const { chartRef, generateFilename } = useChartDownload('climate-temporal')

  // Debug logs
  console.log("Climate data available:", climateTemporalData?.length || 0);

  useTemporalChart({
    svgRef,
    data: climateTemporalData,
    title: "Climate Change Temporal Proximity",
    subtitle: '"In about how many years from now do you expect climate change to have a significant impact on your daily life?"',
    yAxisLabel: "Number of Years",
    currentPoliticalParty: 'Overall',
    conditions: CLIMATE_CONDITIONS,
    waveMapping: WAVE_MAPPING,
    showErrorBars: false, // Remove error bars for this chart
    // Remove yDomain to let the component calculate it automatically
    // yDomain: [4, 13]
  })

  if (loading) return <div className="loading">Loading climate temporal data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!climateTemporalData || climateTemporalData.length === 0) {
    return <div className="loading">No climate temporal data available...</div>
  }

  return (
    <div className="temporal-chart-container" ref={chartRef} style={{ position: 'relative', maxWidth: '100%' }}>
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename({})}
        position="top-right"
      />
      
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

export default ClimateTemporalChart