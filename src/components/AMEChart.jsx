import React, { useState } from 'react'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import '../styles/AMEChart.css'

function AMEChart() {
  const { ameData, loading, error } = useAMEData()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [currentWave, setCurrentWave] = useState("Immediate")

  const getEffectSize = (estimate, sig) => {
    if (!sig) return "No clear change"
    const absEstimate = Math.abs(estimate)
    if (absEstimate <= 0.1) return "Small increase"
    if (absEstimate <= 0.3) return "Moderate increase"
    return "Large increase"
  }

  const processDataForVisualization = (rawData) => {
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
      const outcomeData = rawData.filter(item => item.outcome === dataOutcome)
      const treatments = outcomeData
        .filter(item => item.contrast !== "Handoff vs. Treatment")
        .map(item => ({
          contrast: item.contrast,
          estimate: item.estimate,
          sig: item.sig_raw,
          ci_lower: item.ci_lower,
          ci_upper: item.ci_upper,
          p_value: item.p_value,
          std_error: item.std_error,
          effect: getEffectSize(item.estimate, item.sig_raw)
        }))

      return {
        outcome: outcomeMapping[dataOutcome],
        treatments
      }
    })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>

  // Filter for selected wave and process data
  const waveData = ameData.filter(item => item.wave === currentWave)
  const data = processDataForVisualization(waveData)

  const maxValue = 0.6
  
  const getBarWidth = (estimate) => {
    return Math.abs(estimate) / maxValue * 40 // Reduced from 100% to 40%
  }

  const getBarColor = (estimate, sig, effect) => {
    if (!sig) return '#d1d5db' // gray for non-significant
    
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
    const pValue = treatment.p_value === 0 ? '<0.001' : treatment.p_value;
    return `
      Contrast: ${treatment.contrast}
      Estimate: ${treatment.estimate}
      P-value: ${pValue}
      95% CI: [${treatment.ci_lower}, ${treatment.ci_upper}]
      Significance: ${treatment.sig || 'Not significant'}
    `
  }

  return (
    <div className="ame-chart">
      <h3 className="chart-title">Impacts of the Heat Wave Episode on Key Measures</h3>
      <p className="chart-subtitle">Change relative to the control episode</p>
      
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
      
      {data.map((outcome, idx) => (
        <div key={idx} className="outcome-section">
          <h4 className="outcome-title">{outcome.outcome}</h4>
          
          {outcome.treatments.map((treatment, tidx) => (
            <div key={tidx} className="treatment-row">
              <div className="treatment-label">{treatment.contrast === 'Treatment vs. Control' ? 'Heat Wave' : treatment.contrast === 'Handoff vs. Control' ? 'Heat Wave + Handoff' : treatment.contrast}</div>
              <div className="bar-container">
                <div className="zero-line"></div>
                <div 
                  className="effect-bar"
                  style={{
                    width: `${getBarWidth(treatment.estimate)}%`,
                    backgroundColor: getBarColor(treatment.estimate, treatment.sig, treatment.effect),
                    marginLeft: treatment.estimate < 0 ? `${50 - getBarWidth(treatment.estimate)}%` : '50%'
                  }}
                  onMouseEnter={() => setHoveredItem(`${outcome.outcome}-${tidx}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                ></div>
                
                {/* Confidence interval error bars */}
                <div 
                  className="confidence-interval"
                  style={{
                    left: `${50 + (treatment.ci_lower / maxValue * 40)}%`,
                    width: `${((treatment.ci_upper - treatment.ci_lower) / maxValue * 40)}%`
                  }}
                ></div>
                
                {/* Tooltip */}
                {hoveredItem === `${outcome.outcome}-${tidx}` && (
                  <div className="tooltip">
                    <pre>{formatTooltip(treatment, outcome.outcome)}</pre>
                  </div>
                )}
              </div>
              <div className="effect-description">
                <span className="effect-icon">
                  {treatment.effect.includes('increase') ? '▲' : '—'}
                </span>
                <span className="effect-text">{treatment.effect}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default AMEChart
