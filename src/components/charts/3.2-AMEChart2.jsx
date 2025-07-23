import React from 'react'
import BaseAMEChart from '../base/BaseAMEChart'

function AMEChart2() {
  const outcomeMapping = {
    "Heat and Policy Support": "Heat and Policy Support",
    "Healthcare Worker Responsibility": "Perceived Responsibility of Healthcare Workers"
  }

  const dataOutcomes = [
    "Heat and Policy Support",
    "Healthcare Worker Responsibility"
  ]

  return (
    <BaseAMEChart
      outcomeMapping={outcomeMapping}
      dataOutcomes={dataOutcomes}
      title="Policy Support and Healthcare Worker Responsibility"
      subtitle="Comparing Heat Wave Episode and Multiplatform Group to Control"
      className="ame-chart-2"
    />
  )
}

export default AMEChart2