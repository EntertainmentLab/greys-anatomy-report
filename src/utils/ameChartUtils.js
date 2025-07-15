export const getEffectSize = (estimate, sig, pValue) => {
  if (!sig || pValue >= 0.05) return "No clear change"
  const absEstimate = Math.abs(estimate)
  if (absEstimate < 0.1) return "Small increase"
  if (absEstimate <= 0.3) return "Moderate increase"
  return "Large increase"
}

export const getBarColor = (estimate, sig, effect) => {
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

export const formatTooltip = (data, outcome) => {
  const pValue = data.p_value_fdr === 0 ? '<0.001' : data.p_value_fdr;
  return `Contrast: ${data.contrast}
Estimate: ${data.estimate}
95% CI: [${data.ci_lower}, ${data.ci_upper}]
N: ${data.n}
P-value (FDR): ${pValue}
Significance: ${data.sig || 'Not significant'}`
}

export const processDataForVisualization = (rawData, outcomeMapping, dataOutcomes) => {
  return dataOutcomes.map(dataOutcome => {
    const treatmentData = rawData.filter(item => item.outcome === dataOutcome && item.contrast === "Treatment vs. Control")
    const handoffData = rawData.filter(item => item.outcome === dataOutcome && item.contrast === "Handoff vs. Control")
    
    const treatment = treatmentData.length > 0 ? {
      contrast: treatmentData[0].contrast,
      estimate: treatmentData[0].estimate,
      sig: treatmentData[0].sig_fdr,
      ci_lower: treatmentData[0].ci_lower,
      ci_upper: treatmentData[0].ci_upper,
      p_value_fdr: treatmentData[0].p_value_fdr,
      n: treatmentData[0].n,
      std_error: treatmentData[0].std_error,
      effect: getEffectSize(treatmentData[0].estimate, treatmentData[0].sig_fdr, treatmentData[0].p_value_fdr)
    } : null

    const handoff = handoffData.length > 0 ? {
      contrast: handoffData[0].contrast,
      estimate: handoffData[0].estimate,
      sig: handoffData[0].sig_fdr,
      ci_lower: handoffData[0].ci_lower,
      ci_upper: handoffData[0].ci_upper,
      p_value_fdr: handoffData[0].p_value_fdr,
      n: handoffData[0].n,
      std_error: handoffData[0].std_error,
      effect: getEffectSize(handoffData[0].estimate, handoffData[0].sig_fdr, handoffData[0].p_value_fdr)
    } : null

    return {
      outcome: outcomeMapping[dataOutcome],
      treatment,
      handoff
    }
  }).filter(item => item.treatment || item.handoff)
}
