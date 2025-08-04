import { useRef, useState, useMemo } from 'react'
import { useHeatwaveCompositeData, useHeatwaveConstructsData } from '../../hooks/useHeatwaveCompositeData'
import { COLOR_MAP } from '../../constants'
import { useTemporalChart } from '../base/TemporalChart'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'
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
  const { heatwaveCompositeData, loading: compositeLoading, error: compositeError } = useHeatwaveCompositeData()
  const { heatwaveConstructsData, loading: constructsLoading, error: constructsError } = useHeatwaveConstructsData()
  const svgRef = useRef()
  const [selectedConstruct, setSelectedConstruct] = useState('overall')
  const { chartRef, generateFilename } = useChartDownload('heatwave-composite')

  // Get unique constructs for dropdown
  const constructOptions = useMemo(() => {
    if (!heatwaveConstructsData || heatwaveConstructsData.length === 0) return []
    
    const uniqueConstructs = [...new Set(heatwaveConstructsData.map(d => d.construct))]
    return uniqueConstructs.map(construct => {
      const item = heatwaveConstructsData.find(d => d.construct === construct)
      return {
        value: construct,
        label: item.construct_label
      }
    })
  }, [heatwaveConstructsData])

  // Filter data based on selected construct
  const displayData = useMemo(() => {
    if (selectedConstruct === 'overall') {
      return heatwaveCompositeData
    }
    return heatwaveConstructsData?.filter(d => d.construct === selectedConstruct) || []
  }, [selectedConstruct, heatwaveCompositeData, heatwaveConstructsData])

  // Get appropriate title and subtitle
  const chartConfig = useMemo(() => {
    if (selectedConstruct === 'overall') {
      return {
        title: "Impact of Heat Wave Content Over Time",
        subtitle: "Average change from baseline across heat wave measures (standardized)",
        yAxisLabel: "Change from Baseline"
      }
    }
    
    const constructInfo = constructOptions.find(c => c.value === selectedConstruct)
    return {
      title: constructInfo?.label || "Heat Wave Content Impact",
      subtitle: "Change from baseline across experimental conditions",
      yAxisLabel: "Change from Baseline"
    }
  }, [selectedConstruct, constructOptions])

  // Debug logs
  console.log("Selected construct:", selectedConstruct);
  console.log("Display data available:", displayData?.length || 0);

  useTemporalChart({
    svgRef,
    data: displayData,
    title: chartConfig.title,
    subtitle: chartConfig.subtitle,
    yAxisLabel: chartConfig.yAxisLabel,
    conditions: HEATWAVE_CONDITIONS,
    waveMapping: WAVE_MAPPING,
    tooltipUnit: "", // No unit for absolute change
    valueFormatter: (d) => d.toFixed(3), // Format to 3 decimal places
    // Remove yDomain to let the component calculate it automatically
  })

  const loading = compositeLoading || constructsLoading
  const error = compositeError || constructsError

  if (loading) return <div className="loading">Loading heatwave data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!displayData || displayData.length === 0) {
    return <div className="loading">No heatwave data available...</div>
  }

  return (
    <div className="temporal-chart-container" ref={chartRef} style={{ position: 'relative', maxWidth: '100%' }}>
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename({ category: selectedConstruct })}
        position="top-right"
      />
      {/* Dropdown menu for construct selection */}
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="construct-select">Select Measure:</label>
          <select 
            id="construct-select"
            value={selectedConstruct} 
            onChange={(e) => setSelectedConstruct(e.target.value)}
            className="construct-dropdown"
          >
            <option value="overall">Overall (Composite Score)</option>
            {constructOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
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

export default HeatwaveCompositeChart