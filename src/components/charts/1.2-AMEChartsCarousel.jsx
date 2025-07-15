import React, { useState } from 'react'
import AMEChart1 from './3.1-AMEChart1'
import AMEChart2 from './3.2-AMEChart2'
import AMEChart3 from './3.3-AMEChart3'
// CSS imported via main.css

const AMEChartsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const charts = [
    {
      title: 'Heat Wave Perception & Knowledge',
      component: AMEChart1,
    },
    {
      title: 'Policy Support & Healthcare Responsibility',
      component: AMEChart2,
    },
    {
      title: 'Climate Change Impact & Action Support',
      component: AMEChart3,
    }
  ]

  const nextChart = () => {
    setActiveIndex((prev) => (prev + 1) % charts.length)
  }

  const prevChart = () => {
    setActiveIndex((prev) => (prev - 1 + charts.length) % charts.length)
  }

  const CurrentChart = charts[activeIndex].component

  return (
    <div className="ame-carousel-container">
      <div className="carousel-header">
        <div className="chart-info">
          <h3 className="carousel-title">{charts[activeIndex].title}</h3>
          <div className="chart-nav">
            <button 
              className="nav-btn" 
              onClick={prevChart}
              disabled={activeIndex === 0}
              aria-label="Previous chart"
            >
              ← Prev
            </button>
            <span className="chart-counter">{activeIndex + 1} of {charts.length}</span>
            <button 
              className="nav-btn" 
              onClick={nextChart}
              disabled={activeIndex === charts.length - 1}
              aria-label="Next chart"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <CurrentChart />
      </div>
    </div>
  )
}

export default AMEChartsCarousel