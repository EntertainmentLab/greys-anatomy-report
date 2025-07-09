import React, { useRef, useState, useEffect } from 'react'
import { useEnhancedChart } from './base/EnhancedChart'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import '../styles/components/Chart-Dumbbell.css'

function AMEChartDumbbell() {
  const svgRef = useRef()
  const waveControlsRef = useRef()
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")

  // Transform AME data to format expected by EnhancedChart
  const transformedData = React.useMemo(() => {
    if (!ameData || !Array.isArray(ameData) || ameData.length === 0) return []

    console.log('AME Data available:', ameData.length, 'items')
    console.log('Current wave:', currentWave)
    
    const waveData = ameData.filter(item => item.wave === currentWave)
    console.log('Wave data filtered:', waveData.length, 'items')
    console.log('Sample wave data:', waveData.slice(0, 3))
    
    const result = []

    const outcomeMapping = {
      "Heatwave Likelihood of Exposure": "Perceived Likelihood of Heat Wave Exposure",
      "Heatwave Threat Severity": "Perceived Heat Wave Threat Severity",
      "Heatwave Threat Health Impact": "Perceived Threat of Heat Waves on Health",
      "Heatwave Impact Knowledge": "Knowledge of the Impact of Heat Waves",
      "Heat and Policy Support": "Heat and Policy Support",
      "Healthcare Worker Responsibility": "Perceived Responsibility of Healthcare Workers",
      "Climate Change Personal Impact": "Personal Impact of Climate Change",
      "Climate Change Support for Action": "Climate Change - Support for Action"
    }

    // The dumbbell chart expects actual means for each condition, not differences
    // So we need to simulate the actual values where control = 0 and treatment/handoff = effect size
    
    // Add control baseline (always 0)
    Object.keys(outcomeMapping).forEach(outcome => {
      result.push({
        condition: 'control',
        category: outcomeMapping[outcome],
        mean: 0,
        se: 0,
        n: 100, // placeholder
        wave: currentWave === "Immediate" ? 2 : 3,
        political_party: 'Overall'
      })
    })

    // Add treatment and handoff effects (these are effect sizes, so we add them to the control baseline of 0)
    waveData.forEach(item => {
      let condition = null
      let effectSize = item.estimate

      console.log('Processing item:', item.outcome, '"' + item.contrast + '"', item.estimate)

      const contrast = item.contrast?.trim()
      if (contrast === "Treatment vs. Control" || (contrast?.includes("Treatment vs") && contrast?.includes("Control"))) {
        condition = 'treatment'
      } else if (contrast === "Handoff vs. Control" || (contrast?.includes("Handoff vs") && contrast?.includes("Control"))) {
        condition = 'handoff'
      } else {
        console.log('No match for contrast:', '"' + item.contrast + '"')
      }

      if (condition && outcomeMapping[item.outcome]) {
        console.log('Adding', condition, 'data for', outcomeMapping[item.outcome])
        result.push({
          condition: condition,
          category: outcomeMapping[item.outcome],
          mean: effectSize, // This is the effect size relative to control
          se: item.std_error,
          n: 100, // placeholder
          wave: currentWave === "Immediate" ? 2 : 3,
          political_party: 'Overall'
        })
      } else {
        console.log('Skipping item - condition:', condition, 'outcome mapped:', !!outcomeMapping[item.outcome])
      }
    })

    console.log('Final transformed data for dumbbell:', result.length, 'items')
    console.log('All transformed data:', result)
    return result
  }, [ameData, currentWave])

  // Y-axis items (outcome categories)
  const yAxisItems = [
    "Perceived Likelihood of Heat Wave Exposure",
    "Perceived Heat Wave Threat Severity",
    "Perceived Threat of Heat Waves on Health",
    "Knowledge of the Impact of Heat Waves",
    "Heat and Policy Support",
    "Perceived Responsibility of Healthcare Workers",
    "Personal Impact of Climate Change",
    "Climate Change - Support for Action"
  ]

  // Use the enhanced chart hook only if we have data
  React.useEffect(() => {
    if (transformedData && transformedData.length > 0) {
      console.log('Calling useEnhancedChart with data:', transformedData.length, 'items')
    }
  }, [transformedData])

  useEnhancedChart({
    svgRef,
    data: transformedData,
    currentWave: currentWave === "Immediate" ? 2 : 3,
    currentPoliticalParty: 'Overall',
    currentCategory: 'all',
    xDomain: [-0.5, 0.5],
    title: "Key Findings: Treatment Effects",
    subtitle: `Effect sizes showing change from control condition (0) (${WAVE_LABELS[currentWave === "Immediate" ? 2 : 3]})`,
    xAxisLabel: "Standard Treatment Effect",
    chartType: 'knowledge', // Use knowledge chart type for category-based display
    yAxisItems,
    waveControlsRef
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>
  
  // Debug: Show what we're passing to the chart
  if (transformedData.length === 0) {
    return <div>No data available for chart</div>
  }

  return (
    <div className="chart-container-wrapper">
      <div className="dumbbell-chart-container">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="600"
          className="dumbbell-chart-svg"
        />
        
        {/* Wave Controls */}
        <div ref={waveControlsRef} className="wave-controls-container">
          <div className="wave-controls">
            <button 
              className={`wave-tab ${currentWave === "Immediate" ? 'active' : ''}`}
              onClick={() => setCurrentWave("Immediate")}
            >
              {WAVE_LABELS[2]}
            </button>
            <button 
              className={`wave-tab ${currentWave === "15 Days" ? 'active' : ''}`}
              onClick={() => setCurrentWave("15 Days")}
            >
              {WAVE_LABELS[3]}
            </button>
          </div>
        </div>

        {/* Y-axis labels */}
        <div className="y-axis-labels">
          {yAxisItems.map((item, index) => (
            <div 
              key={item}
              className="y-axis-label"
              style={{
                position: 'absolute',
                left: '20px',
                top: `${120 + (index * 45)}px`,
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                textAlign: 'right',
                width: '220px',
                lineHeight: '1.2'
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AMEChartDumbbell