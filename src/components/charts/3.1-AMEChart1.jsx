import React from 'react'
import BaseAMEChart from '../base/BaseAMEChart'

function AMEChart1() {
  const outcomeMapping = {
    "Heatwave Likelihood of Exposure": "Perceived Likelihood of Heat Wave Exposure",
    "Heatwave Threat Severity": "Perceived Heat Wave Threat Severity",
    "Heatwave Threat Health Impact": "Perceived Threat of Heat Waves on Health",
    "Heatwave Impact Knowledge": "Knowledge of the Impact of Heat Waves"
  }

  const dataOutcomes = [
    "Heatwave Likelihood of Exposure",
    "Heatwave Threat Severity",
    "Heatwave Threat Health Impact",
    "Heatwave Impact Knowledge"
  ]

  return (
    <BaseAMEChart
      outcomeMapping={outcomeMapping}
      dataOutcomes={dataOutcomes}
      title="Heat Wave Perception and Knowledge"
      subtitle="Comparing Heat Wave Episode and Multiplatform Group to Control"
      className="ame-chart-1"
    />
  )
}

export default AMEChart1