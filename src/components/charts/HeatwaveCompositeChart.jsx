import { useRef } from 'react'
import { useHeatwaveCompositeData } from '../../hooks/useHeatwaveCompositeData'
import { COLOR_MAP } from '../../constants'
import { useTemporalChart } from '../base/TemporalChart'
// CSS imported via main.css

// Define conditions with your color scheme
const HEATWAVE_CONDITIONS = [
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

function HeatwaveCompositeChart() {
  const { heatwaveCompositeData, loading, error } = useHeatwaveCompositeData()
  const svgRef = useRef()

  // Debug logs
  console.log("Heatwave composite data available:", heatwaveCompositeData?.length || 0);

  useTemporalChart({
    svgRef,
    data: heatwaveCompositeData,
    title: "HeatWave Composite Score",
    subtitle: "Average of perceived likelihood of heat wave exposure, threat severity, health impact, and knowledge",
    yAxisLabel: "Composite Score",
    conditions: HEATWAVE_CONDITIONS,
    waveMapping: WAVE_MAPPING,
    // Remove yDomain to let the component calculate it automatically
  })

  if (loading) return <div className="loading">Loading heatwave composite data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!heatwaveCompositeData || heatwaveCompositeData.length === 0) {
    return <div className="loading">No heatwave composite data available...</div>
  }

  return (
    <div className="heatwave-composite-container">
      {/* Remove both political party and wave controls - this chart shows temporal progression */}
      
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default HeatwaveCompositeChart