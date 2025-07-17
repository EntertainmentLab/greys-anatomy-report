import React, { useState } from 'react'
import AMEChart1 from './3.1-AMEChart1'
import AMEChart2 from './3.2-AMEChart2'
import AMEChart3 from './3.3-AMEChart3'
// CSS imported via main.css

const AMEChartsCarousel = () => {
  const [activeTab, setActiveTab] = useState('chart1')

  const charts = [
    {
      id: 'chart1',
      title: 'Heat Wave Perception & Knowledge',
      component: AMEChart1,
    },
    {
      id: 'chart2',
      title: 'Policy Support & Healthcare Responsibility',
      component: AMEChart2,
    },
    {
      id: 'chart3',
      title: 'Climate Change Impact & Action Support',
      component: AMEChart3,
    }
  ]

  return (
    <div className="tab-container">
      <div className="tab-list">
        {charts.map(chart => (
          <button
            key={chart.id}
            className={`tab-button ${activeTab === chart.id ? 'active' : ''}`}
            onClick={() => setActiveTab(chart.id)}
          >
            {chart.title}
          </button>
        ))}
      </div>

      {charts.map(chart => {
        const ChartComponent = chart.component
        return (
          <div 
            key={chart.id}
            className={`tab-content ${activeTab === chart.id ? 'active' : ''}`}
          >
            <ChartComponent />
          </div>
        )
      })}
    </div>
  )
}

export default AMEChartsCarousel