import React, { useState } from 'react'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS } from '../constants'
import '../styles/AMEChart.css'

function AMEChart3() {
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

  const processDataForVisualization = (rawData) => {
    const outcomeMapping = {
      "Climate Change Personal Impact": "Personal Impact of Climate Change",
      "Climate Change Support for Action": "Climate Change - Support for Action"
    }

    const dataOutcomes = [
      "Climate Change Personal Impact",
      "Climate Change Support for Action"
    ]

    return dataOutcomes.map(dataOutcome => {
      const treatmentData = rawData.filter(item => item.outcome === dataOutcome && item.contrast === "Treatment vs. Control")
      const handoffData = rawData.filter(item => item.outcome === dataOutcome && item.contrast === "Handoff vs. Control")
      
      const treatment = treatmentData.length > 0 ? {
        contrast: treatmentData[0].contrast,
        estimate: treatmentData[0].estimate,
        sig: treatmentData[0].sig_raw,
        ci_lower: treatmentData[0].ci_lower,
        ci_upper: treatmentData[0].ci_upper,
        p_value: treatmentData[0].p_value,
        std_error: treatmentData[0].std_error,
        effect: getEffectSize(treatmentData[0].estimate, treatmentData[0].sig_raw, treatmentData[0].p_value)
      } : null

      const handoff = handoffData.length > 0 ? {
        contrast: handoffData[0].contrast,
        estimate: handoffData[0].estimate,
        sig: handoffData[0].sig_raw,
        ci_lower: handoffData[0].ci_lower,
        ci_upper: handoffData[0].ci_upper,
        p_value: handoffData[0].p_value,
        std_error: handoffData[0].std_error,
        effect: getEffectSize(handoffData[0].estimate, handoffData[0].sig_raw, handoffData[0].p_value)
      } : null

      return {
        outcome: outcomeMapping[dataOutcome],
        treatment,
        handoff
      }
    }).filter(item => item.treatment || item.handoff)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>

  const waveData = ameData.filter(item => item.wave === currentWave)
  const chartData = processDataForVisualization(waveData)

  const maxValue = 0.7
  
  const getBarWidth = (estimate) => {
    return Math.abs(estimate) / maxValue * 60
  }

  const getBarColor = (estimate, sig, effect) => {
    if (!sig || effect === "No clear change") return '#d1d5db'
    
    if (estimate > 0) {
      if (effect === "Small increase") return '#86efac'
      if (effect === "Moderate increase") return '#22c55e'
      return '#16a34a'
    } else {
      if (effect === "Small increase") return '#fca5a5'
      if (effect === "Moderate increase") return '#ef4444'
      return '#dc2626'
    }
  }

  const formatTooltip = (data, outcome) => {
    const pValue = data.p_value === 0 ? '<0.001' : data.p_value;
    return `
      Contrast: ${data.contrast}
      Estimate: ${data.estimate}
      P-value: ${pValue}
      95% CI: [${data.ci_lower}, ${data.ci_upper}]
      Significance: ${data.sig || 'Not significant'}
    `
  }

  const getCategoryTooltip = (outcome) => {
    const categoryDescriptions = {
      "Personal Impact of Climate Change": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]",
      "Climate Change - Support for Action": "Subconstructs: [PLACEHOLDER - Edit this text to list the subconstructs that make up this category]"
    }
    return categoryDescriptions[outcome] || "No description available";
  }

  return (
    <div className="ame-charts-container">
      <div className="ame-chart">
        <h3 className="chart-title">Climate Change Impact and Action Support</h3>
        <p className="chart-subtitle">Comparing Heat Wave Episode and Heat Wave + Social Media to Control</p>
        
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
        
        <div className="compact-chart dual-comparison">
          {/* Treatment Effect Header */}
          <div className="dual-bar" style={{ marginBottom: '0', minHeight: 'auto', background: 'transparent' }}>
            <div></div>
            <div className="dual-treatment-effect-header">
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
          
          {chartData.map((outcome, idx) => (
            <div key={idx} className="compact-row dual-bar">
              <div 
                className="outcome-label"
                onMouseEnter={() => setHoveredItem(`category-${outcome.outcome}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {outcome.outcome}
                {hoveredItem === `category-${outcome.outcome}` && (
                  <div className="category-tooltip">
                    {getCategoryTooltip(outcome.outcome)}
                  </div>
                )}
              </div>
              
              <div className="dual-bar-container">
                
                {/* Treatment bar */}
                {outcome.treatment && (
                  <div className="bar-row">
                    <div className="bar-label">Heat Wave Episode</div>
                    <div className="bar-wrapper">
                      <div className="zero-line"></div>
                      <div 
                        className="effect-bar"
                        style={{
                          width: `${getBarWidth(outcome.treatment.estimate)}%`,
                          backgroundColor: getBarColor(outcome.treatment.estimate, outcome.treatment.sig, outcome.treatment.effect),
                          marginLeft: outcome.treatment.estimate < 0 ? `${20 - getBarWidth(outcome.treatment.estimate)}%` : '20%'
                        }}
                        onMouseEnter={() => setHoveredItem(`${outcome.outcome}-treatment`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      ></div>
                      
                      <div 
                        className="confidence-interval"
                        style={{
                          left: `${Math.max(0, Math.min(100, 20 + (outcome.treatment.ci_lower / maxValue * 60)))}%`,
                          width: `${Math.max(0, Math.min(80, ((outcome.treatment.ci_upper - outcome.treatment.ci_lower) / maxValue * 60)))}%`
                        }}
                      ></div>
                      
                      {hoveredItem === `${outcome.outcome}-treatment` && (
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
                )}
                
                {/* Handoff bar */}
                {outcome.handoff && (
                  <div className="bar-row">
                    <div className="bar-label">Heat Wave + Social Media</div>
                    <div className="bar-wrapper">
                      <div className="zero-line"></div>
                      <div 
                        className="effect-bar"
                        style={{
                          width: `${getBarWidth(outcome.handoff.estimate)}%`,
                          backgroundColor: getBarColor(outcome.handoff.estimate, outcome.handoff.sig, outcome.handoff.effect),
                          marginLeft: outcome.handoff.estimate < 0 ? `${20 - getBarWidth(outcome.handoff.estimate)}%` : '20%'
                        }}
                        onMouseEnter={() => setHoveredItem(`${outcome.outcome}-handoff`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      ></div>
                      
                      <div 
                        className="confidence-interval"
                        style={{
                          left: `${Math.max(0, Math.min(100, 20 + (outcome.handoff.ci_lower / maxValue * 60)))}%`,
                          width: `${Math.max(0, Math.min(80, ((outcome.handoff.ci_upper - outcome.handoff.ci_lower) / maxValue * 60)))}%`
                        }}
                      ></div>
                      
                      {hoveredItem === `${outcome.outcome}-handoff` && (
                        <div className="tooltip">
                          <pre>{formatTooltip(outcome.handoff, outcome.outcome)}</pre>
                        </div>
                      )}
                    </div>
                    <div className="effect-description">
                      <span className="effect-icon">
                        {outcome.handoff.effect.includes('increase') ? '▲' : '—'}
                      </span>
                      <span className="effect-text">{outcome.handoff.effect}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* X-axis with tick marks */}
          <div className="dual-bar-x-axis">
            <div></div>
            <div className="x-axis-ticks">
              {[-0.2, 0, 0.2, 0.4, 0.6, 0.8].map(value => (
                <div key={value}>
                  <div 
                    className={value === 0 ? "x-axis-zero-line" : "x-axis-tick"}
                    style={{ left: `${20 + (value / maxValue * 60)}%` }}
                  />
                  <div 
                    className="x-axis-tick-label"
                    style={{ left: `${20 + (value / maxValue * 60)}%` }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="dual-bar-x-axis">
            <div></div>
            <div className="x-axis-label">Standard Treatment Effect</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AMEChart3