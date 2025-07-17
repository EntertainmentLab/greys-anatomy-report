import React, { useState } from 'react'
import { useAMEData } from '../../hooks/useAMEData'
import { WAVE_LABELS } from '../../constants'
// CSS imported via main.css

function AMEChart() {
  const { ameData, loading, error } = useAMEData()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [currentWave, setCurrentWave] = useState("Immediate")

  const getEffectSize = (estimate, sig, pValue) => {
    if (!sig || pValue >= 0.05) return "No clear change"
    const absEstimate = Math.abs(estimate)
    if (absEstimate < 0.1) return "Small increase"
    if (absEstimate <= 0.3) return "Moderate increase"
    return "Large increase"
  }

  const processDataForVisualization = (rawData, contrastType) => {
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

    const dataOutcomes = [
      "Heatwave Likelihood of Exposure",
      "Heatwave Threat Severity",
      "Heatwave Threat Health Impact",
      "Heatwave Impact Knowledge",
      "Heat and Policy Support",
      "Healthcare Worker Responsibility",
      "Climate Change Personal Impact",
      "Climate Change Support for Action"
    ]

    return dataOutcomes.map(dataOutcome => {
      const outcomeData = rawData.filter(item => item.outcome === dataOutcome && item.contrast === contrastType)
      const treatment = outcomeData.length > 0 ? {
        contrast: outcomeData[0].contrast,
        estimate: outcomeData[0].estimate,
        sig: outcomeData[0].sig_fdr,
        ci_lower: outcomeData[0].ci_lower,
        ci_upper: outcomeData[0].ci_upper,
        p_value_fdr: outcomeData[0].p_value_fdr,
        n: outcomeData[0].n,
        std_error: outcomeData[0].std_error,
        effect: getEffectSize(outcomeData[0].estimate, outcomeData[0].sig_fdr, outcomeData[0].p_value_fdr)
      } : null

      return {
        outcome: outcomeMapping[dataOutcome],
        treatment
      }
    }).filter(item => item.treatment) // Remove items without data
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>

  // Filter for selected wave and process data
  const waveData = ameData.filter(item => item.wave === currentWave)
  const treatmentData = processDataForVisualization(waveData, "Heat Wave Episode Only vs. Control")
  const handoffData = processDataForVisualization(waveData, "Multiplatform vs. Heat Wave Episode Only")

  const maxValue = 0.7
  
  const getBarWidth = (estimate) => {
    return Math.abs(estimate) / maxValue * 70 // Increased since no negative values
  }

  const getBarColor = (estimate, sig, effect) => {
    if (!sig || effect === "No clear change") return '#d1d5db' // gray for non-significant
    
    if (estimate > 0) {
      if (effect === "Small increase") return '#86efac' // light green
      if (effect === "Moderate increase") return '#22c55e' // medium green
      return '#16a34a' // dark green for large
    } else {
      if (effect === "Small increase") return '#fca5a5' // light red
      if (effect === "Moderate increase") return '#ef4444' // medium red
      return '#dc2626' // dark red for large
    }
  }

  const formatTooltip = (treatment, outcome) => {
    const pValue = treatment.p_value_fdr === 0 ? '<0.001' : treatment.p_value_fdr;
    return `
      Contrast: ${treatment.contrast}
      Estimate: ${treatment.estimate}
      P-value (FDR): ${pValue}
      95% CI: [${treatment.ci_lower}, ${treatment.ci_upper}]
      N: ${treatment.n}
      Significance: ${treatment.sig || 'Not significant'}
    `
  }

  const getCategoryTooltip = (outcome) => {
    const categoryDescriptions = {
      "Perceived Likelihood of Heat Wave Exposure": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Perceived Heat Wave Threat Severity": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Perceived Threat of Heat Waves on Health": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Knowledge of the Impact of Heat Waves": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Heat and Policy Support": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Perceived Responsibility of Healthcare Workers": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Personal Impact of Climate Change": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Climate Change - Support for Action": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]"
    }
    return categoryDescriptions[outcome] || "No description available";
  }

  const renderChart = (data, title, subtitle) => (
    <div className="ame-chart">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-subtitle">{subtitle}</p>
      
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
      
      <div className="compact-chart">
        {/* Treatment Effect Header */}
        <div className="compact-row" style={{ marginBottom: '0', borderBottom: 'none', background: 'transparent' }}>
          <div></div>
          <div></div>
          <div className="treatment-effect-header">
            Effect Size
            <span 
              className="info-button"
              onMouseEnter={() => setHoveredItem('effect-size-info')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              ⓘ
              {hoveredItem === 'effect-size-info' && (
                <div className="info-tooltip">
                  <div><strong>Effect Size Mapping:</strong></div>
                  <div>• Small: {'<'}0.1 standard deviations</div>
                  <div>• Moderate: 0.1-0.3 standard deviations</div>
                  <div>• Large: {'>'}0.3 standard deviations</div>
                  <div>• No clear change: p-value ≥ 0.05</div>
                </div>
              )}
            </span>
          </div>
        </div>
        
        {data.map((outcome, idx) => (
          <div key={idx} className="compact-row">
            <div 
              className="outcome-label"
              onMouseEnter={() => setHoveredItem(`category-${outcome.outcome}-${title}`)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {outcome.outcome}
              {hoveredItem === `category-${outcome.outcome}-${title}` && (
                <div className="category-tooltip">
                  {getCategoryTooltip(outcome.outcome)}
                </div>
              )}
            </div>
            <div className="bar-container">
              <div className="zero-line"></div>
              <div 
                className="effect-bar"
                style={{
                  width: `${getBarWidth(outcome.treatment.estimate)}%`,
                  backgroundColor: getBarColor(outcome.treatment.estimate, outcome.treatment.sig, outcome.treatment.effect),
                  marginLeft: outcome.treatment.estimate < 0 ? `${20 - getBarWidth(outcome.treatment.estimate)}%` : '20%'
                }}
                onMouseEnter={() => setHoveredItem(`${outcome.outcome}-${title}`)}
                onMouseLeave={() => setHoveredItem(null)}
              ></div>
              
              {/* Confidence interval error bars */}
              <div 
                className="confidence-interval"
                style={{
                  left: `${Math.max(0, Math.min(100, 20 + (outcome.treatment.ci_lower / maxValue * 70)))}%`,
                  width: `${Math.max(0, Math.min(80, ((outcome.treatment.ci_upper - outcome.treatment.ci_lower) / maxValue * 70)))}%`
                }}
              ></div>
              
              {/* Tooltip */}
              {hoveredItem === `${outcome.outcome}-${title}` && (
                <div className="tooltip">
                  <pre>{formatTooltip(outcome.treatment, outcome.outcome)}</pre>
                </div>
              )}
            </div>
            <div className="effect-description">
              <span className="effect-icon">
                {outcome.treatment.effect.includes('increase') ? '▲' : '—'}
              </span>
              <span className="effect-text">{outcome.treatment.effect}</span>
            </div>
          </div>
        ))}
        
        {/* X-axis with tick marks */}
        <div className="x-axis-container">
          <div></div>
          <div className="x-axis-ticks">
            {[-0.2, 0, 0.2, 0.4, 0.6, 0.8].map(value => (
              <div key={value}>
                <div 
                  className={value === 0 ? "x-axis-zero-line" : "x-axis-tick"}
                  style={{ left: `${20 + (value / maxValue * 70)}%` }}
                />
                <div 
                  className="x-axis-tick-label"
                  style={{ left: `${20 + (value / maxValue * 70)}%` }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div></div>
        </div>
        
        <div className="x-axis-container">
          <div></div>
          <div className="x-axis-label">Standardized Treatment Effect</div>
          <div></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="ame-charts-container">
      {renderChart(treatmentData, "Impacts of the Heat Wave Episode on Key Measures", "Change relative to the control episode (0)")}
      {renderChart(handoffData, "The Additional Boost of Social Media Content", "Change relative to heat wave episode-only (0)")}
    </div>
  )
}

export default AMEChart
