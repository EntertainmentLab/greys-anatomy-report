import React, { useRef, useState } from 'react'
import { useEnhancedChart } from './base/EnhancedChart'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'

function AMEChartDumbbellSimple() {
  const svgRef = useRef()
  const waveControlsRef = useRef()
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")

  // Transform AME data to format expected by EnhancedChart
  const transformedData = React.useMemo(() => {
    if (!ameData || !Array.isArray(ameData) || ameData.length === 0) return []

    const waveData = ameData.filter(item => item.wave === currentWave)
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

    // Add treatment and handoff effects (raw effect sizes)
    waveData.forEach(item => {
      let condition = null
      const contrast = item.contrast?.trim()
      
      if (contrast === "Treatment vs. Control" || (contrast?.includes("Treatment vs") && contrast?.includes("Control"))) {
        condition = 'treatment'
      } else if (contrast === "Handoff vs. Control" || (contrast?.includes("Handoff vs") && contrast?.includes("Control"))) {
        condition = 'handoff'
      }

      if (condition && outcomeMapping[item.outcome]) {
        result.push({
          condition: condition,
          category: outcomeMapping[item.outcome],
          mean: item.estimate, // Raw effect size
          se: item.std_error,
          n: 100, // placeholder
          wave: currentWave === "Immediate" ? 2 : 3,
          political_party: 'Overall'
        })
      }
    })

    return result
  }, [ameData, currentWave])

  // Calculate dynamic x-axis domain from all data (both waves)
  const xDomain = React.useMemo(() => {
    if (!ameData || !Array.isArray(ameData) || ameData.length === 0) return [-0.1, 0.1];

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

    // Get all effect sizes from both waves
    const allEstimates = [];
    
    ameData.forEach(item => {
      const contrast = item.contrast?.trim()
      if ((contrast === "Treatment vs. Control" || (contrast?.includes("Treatment vs") && contrast?.includes("Control"))) ||
          (contrast === "Handoff vs. Control" || (contrast?.includes("Handoff vs") && contrast?.includes("Control")))) {
        if (outcomeMapping[item.outcome]) {
          allEstimates.push(item.estimate);
        }
      }
    });

    if (allEstimates.length === 0) return [-0.1, 0.1];

    const minEstimate = Math.min(...allEstimates);
    const maxEstimate = Math.max(...allEstimates);
    const range = maxEstimate - minEstimate;
    const padding = Math.max(range * 0.15, 0.05); // 15% padding or minimum 0.05
    
    return [
      Math.min(minEstimate - padding, 0 - padding * 0.5),
      maxEstimate + padding
    ];
  }, [ameData]);

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

  useEnhancedChart({
    svgRef,
    data: transformedData,
    currentWave: currentWave === "Immediate" ? 2 : 3,
    currentPoliticalParty: 'Overall',
    currentCategory: 'all',
    xDomain: xDomain, // Use calculated domain
    title: "Key Findings: Treatment Effects",
    subtitle: `Effect sizes showing change from control condition (0)`,
    xAxisLabel: "Standardized Treatment Effect",
    chartType: 'ame-effects',
    yAxisItems,
    waveControlsRef,
    plotRawValues: true // Use raw effect sizes, don't calculate differences
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>
  
  if (transformedData.length === 0) {
    return <div>No data available for chart</div>
  }

  return (
    <div className="chart-container-wrapper">
      <div className="dumbbell-chart-container">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="800"
          className="dumbbell-chart-svg"
        />
        
        {/* Wave Controls */}
        <div ref={waveControlsRef} className="wave-controls-container simple-chart">
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
      </div>
    </div>
  )
}

export default AMEChartDumbbellSimple