import React from 'react'
import BaseAMEChart from '../base/BaseAMEChart'

function AMEChart3() {
  const outcomeMapping = {
    "Climate Change Personal Impact": "Personal Impact of Climate Change",
    "Climate Change Support for Action": "Climate Change - Support for Action"
  }

  const dataOutcomes = [
    "Climate Change Personal Impact",
    "Climate Change Support for Action"
  ]

  return (
    <BaseAMEChart
      outcomeMapping={outcomeMapping}
      dataOutcomes={dataOutcomes}
      title="Climate Change Impact and Action Support"
      subtitle="Comparing Heat Wave Episode and Multiplatform Group to Control"
      className="ame-chart-3"
    />
  )
}

export default AMEChart3