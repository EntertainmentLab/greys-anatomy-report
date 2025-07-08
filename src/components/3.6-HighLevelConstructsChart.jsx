import { useState, useRef, useEffect } from 'react'
import { useHighLevelConstData } from '../hooks/useHighLevelConstData'
import { WAVE_LABELS, HIGH_LEVEL_CONSTRUCTS, COLOR_MAP, CONDITION_LABELS } from '../constants'
import * as d3 from 'd3'
import '../styles/components/Chart-Dumbbell.css'

// Helper to deeply flatten a value until it's not an array
function deepUnwrap(val) {
  while (Array.isArray(val) && val.length > 0) {
    val = val[0]
  }
  return val
}

function HighLevelConstructsChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: highLevelData, loading, error } = useHighLevelConstData()
  const svgRef = useRef()

  // Calculate positioning constants
  const isMobile = window.innerWidth <= 768
  const isTablet = window.innerWidth <= 1024
  const margin = isMobile 
    ? { top: 140, right: 40, bottom: 140, left: 60 }
    : isTablet 
    ? { top: 160, right: 50, bottom: 160, left: 80 }
    : { top: 180, right: 60, bottom: 180, left: 100 }
  
  const titleY = margin.top / 3
  const subtitleY = titleY + (isMobile ? 25 : isTablet ? 30 : 35)
  const buttonY = subtitleY + (isMobile ? 35 : isTablet ? 40 : 45)

  useEffect(() => {
    if (!highLevelData || highLevelData.length === 0) return

    // Calculate global differences from ALL data (both waves) for consistent y-axis
    const globalDifferenceData = []
    
    // Calculate differences for all waves to get global min/max
    const allWaves = [2, 3]
    allWaves.forEach(wave => {
      const waveData = highLevelData.filter(d => d.wave === wave)
      
      HIGH_LEVEL_CONSTRUCTS.forEach(category => {
        const categoryData = waveData.filter(d => d.category === category)
        
        // Find control group value for this category
        const controlPoint = categoryData.find(d => d.condition === 'control')
        if (!controlPoint) return // Skip if no control data
        
        // Calculate differences for treatment and handoff
        ;['treatment', 'handoff'].forEach(condition => {
          const conditionPoint = categoryData.find(d => d.condition === condition)
          if (conditionPoint) {
            const difference = conditionPoint.mean - controlPoint.mean
            globalDifferenceData.push({ value: difference })
          }
        })
      })
    })

    // Get global min/max from all difference data (excluding control since we don't plot it)
    const globalExtent = d3.extent(globalDifferenceData, d => d.value)
    const padding = (globalExtent[1] - globalExtent[0]) * 0.1 // 10% padding
    const globalYDomain = [
      Math.min(globalExtent[0] - padding, 0), // Ensure we include zero
      globalExtent[1] + padding
    ]

    // Process data for current wave
    const filteredData = highLevelData.filter(d => d.wave === currentWave)
    
    if (filteredData.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    // Calculate differences from control group
    const calculateDifferences = (data) => {
      const differenceData = []
      
      HIGH_LEVEL_CONSTRUCTS.forEach(category => {
        const categoryData = data.filter(d => d.category === category)
        
        // Find control group value for this category
        const controlPoint = categoryData.find(d => d.condition === 'control')
        if (!controlPoint) return // Skip if no control data
        
        // Calculate differences for treatment and handoff
        ;['treatment', 'handoff'].forEach(condition => {
          const conditionPoint = categoryData.find(d => d.condition === condition)
          if (conditionPoint) {
            const difference = conditionPoint.mean - controlPoint.mean
            // Calculate standard error for difference (assuming independence)
            const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2))
            
            differenceData.push({
              category,
              condition,
              value: difference,
              se: diffSE,
              n: conditionPoint.n,
              originalMean: conditionPoint.mean,
              controlMean: controlPoint.mean
            })
          }
        })
      })
      
      return differenceData
    }

    // Transform data to show differences from control
    const differenceData = calculateDifferences(filteredData)
    
    if (differenceData.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Chart dimensions and margins
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width

    const width = Math.max(containerWidth - margin.left - margin.right, isMobile ? 400 : 600)
    const height = isMobile ? 400 : isTablet ? 450 : 500

    // Set up SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .style("max-width", `${width + margin.left + margin.right}px`)
      .style("display", "block")
      .style("margin", "0 auto")

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Position calculations already done outside useEffect

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", titleY)
      .attr("text-anchor", "middle")
      .style("font-size", isMobile ? "18px" : isTablet ? "22px" : "26px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#1f2937")
      .text("Heat Episode Impact on Climate & Health Attitudes")

    // Add subtitle
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", subtitleY)
      .attr("text-anchor", "middle")
      .style("font-size", isMobile ? "14px" : isTablet ? "16px" : "18px")
      .style("font-style", "italic")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#6b7280")
      .text("Standardized differences from control group across key climate and health attitudes")

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(HIGH_LEVEL_CONSTRUCTS)
      .range([0, width])
      .padding(0.3)

    const conditions = ['treatment', 'handoff'] // Only treatment and handoff (no control in difference data)
    const xSubScale = d3.scaleBand()
      .domain(conditions)
      .range([0, xScale.bandwidth()])
      .padding(0.1)

    // Use global y-domain for consistent scaling across waves
    const yScale = d3.scaleLinear()
      .domain(globalYDomain)
      .range([height, 0])

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", isMobile ? "12px" : isTablet ? "13px" : "14px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#374151")
      .call(wrap, xScale.bandwidth())

    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll("text")
      .style("font-size", isMobile ? "12px" : isTablet ? "13px" : "14px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#374151")

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "14px" : isTablet ? "16px" : "18px")
      .style("font-weight", "600")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#1f2937")
      .text("Standardized Change in Attitudes & Beliefs (z-score)")

    // Add zero reference line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", width)
      .attr("y2", yScale(0))
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.7)

    // Create bars
    const bars = g.selectAll(".bar-group")
      .data(HIGH_LEVEL_CONSTRUCTS)
      .enter().append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${xScale(d)},0)`)

    bars.selectAll(".bar")
      .data(category => {
        return conditions.map(condition => {
          const dataPoint = differenceData.find(d => 
            d.category === category && d.condition === condition
          )
          return {
            category,
            condition,
            value: dataPoint ? dataPoint.value : 0,
            se: dataPoint ? dataPoint.se : 0,
            n: dataPoint ? dataPoint.n : 0
          }
        })
      })
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xSubScale(d.condition))
      .attr("width", xSubScale.bandwidth())
      .attr("y", d => d.value >= 0 ? yScale(d.value) : yScale(0))
      .attr("height", d => Math.abs(yScale(d.value) - yScale(0)))
      .attr("fill", d => COLOR_MAP[d.condition])
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body").append("div")
          .attr("class", "d3-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.8)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("pointer-events", "none")

        tooltip.transition()
          .duration(200)
          .style("opacity", .9)
        
        const valueText = d.value >= 0 ? `+${d.value.toFixed(3)}` : `${d.value.toFixed(3)}`
        tooltip.html(`<strong>${CONDITION_LABELS[d.condition]}</strong><br/>${d.category}<br/>Difference from Control: ${valueText}<br/>N = ${d.n}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", function() {
        d3.selectAll(".d3-tooltip").remove()
      })

    // Value labels removed as requested

    // Add error bars
    bars.selectAll(".error-bar")
      .data(category => {
        return conditions.map(condition => {
          const dataPoint = differenceData.find(d => 
            d.category === category && d.condition === condition
          )
          return {
            category,
            condition,
            value: dataPoint ? dataPoint.value : 0,
            se: dataPoint ? dataPoint.se : 0
          }
        })
      })
      .enter().append("g")
      .attr("class", "error-bar")
      .each(function(d) {
        const errorBar = d3.select(this)
        const x = xSubScale(d.condition) + xSubScale.bandwidth() / 2
        const y = yScale(d.value)
        const errorTop = yScale(d.value + d.se)
        const errorBottom = yScale(d.value - d.se)
        
        // Vertical line
        errorBar.append("line")
          .attr("x1", x)
          .attr("y1", errorTop)
          .attr("x2", x)
          .attr("y2", errorBottom)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5)
        
        // Top cap
        errorBar.append("line")
          .attr("x1", x - 4)
          .attr("y1", errorTop)
          .attr("x2", x + 4)
          .attr("y2", errorTop)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5)
        
        // Bottom cap
        errorBar.append("line")
          .attr("x1", x - 4)
          .attr("y1", errorBottom)
          .attr("x2", x + 4)
          .attr("y2", errorBottom)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5)
      })

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left}, ${height + margin.top + (isMobile ? 60 : 80)})`)

    const legendSpacing = isMobile ? 120 : isTablet ? 140 : 160
    const legendItems = legend.selectAll(".legend-item")
      .data(conditions)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${width / 2 - (conditions.length * legendSpacing) / 2 + i * legendSpacing}, 0)`)

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => COLOR_MAP[d])
      .attr("stroke", "white")
      .attr("stroke-width", 2)

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", isMobile ? "14px" : "16px")
      .style("font-weight", "600")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("fill", "#1f2937")
      .text(d => CONDITION_LABELS[d])

    // Text wrapping function
    function wrap(text, width) {
      text.each(function() {
        const text = d3.select(this)
        const words = text.text().split(/\s+/).reverse()
        let word
        let line = []
        let lineNumber = 0
        const lineHeight = 1.1
        const y = text.attr("y")
        const dy = parseFloat(text.attr("dy"))
        let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
        
        while (word = words.pop()) {
          line.push(word)
          tspan.text(line.join(" "))
          if (tspan.node().getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(" "))
            line = [word]
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word)
          }
        }
      })
    }

  }, [highLevelData, currentWave])

  if (loading) return <div className="loading">Loading high-level constructs data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!highLevelData || highLevelData.length === 0) {
    return <div className="loading">No high-level constructs data available...</div>
  }

  return (
    <div className="chart-container-wrapper">
      <div className="chart-container" style={{ position: 'relative' }}>
        <svg ref={svgRef}></svg>
        <div className="wave-controls embedded" style={{
          position: 'absolute',
          top: `${buttonY}px`,
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <button 
            className={`wave-tab ${currentWave === 2 ? 'active' : ''}`}
            onClick={() => setCurrentWave(2)}
          >
            {WAVE_LABELS[2]}
          </button>
          <button 
            className={`wave-tab ${currentWave === 3 ? 'active' : ''}`}
            onClick={() => setCurrentWave(3)}
          >
            {WAVE_LABELS[3]}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HighLevelConstructsChart