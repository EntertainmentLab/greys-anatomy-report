import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useThreatData } from '../hooks/useThreatData'
import { HEALTH_ISSUES, RESPONSE_CATEGORIES, WAVE_LABELS } from '../constants'
import './HealthWorryChart.css'

const CONDITIONS = ["Control", "Heatwave", "Heatwave + Handoff"]

function HealthWorryChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { threatData, loading, error } = useThreatData()
  const svgRef = useRef()

  useEffect(() => {
    if (!threatData || threatData.length === 0) return

    const filteredData = threatData.filter(d => d.wave === currentWave)
    if (filteredData.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 120, right: 40, bottom: 80, left: 60 } // Reduced top margin
    const width = 700 - margin.left - margin.right // Narrower plot
    const height = 500 - margin.bottom - margin.top

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create faceted layout
    const facetWidth = width / HEALTH_ISSUES.length
    const barWidth = 25 // Slightly narrower bar width
    const barSpacing = 4 // Space between bars within each group
    const facetPadding = 20

    const yScale = d3.scaleLinear()
      .domain([-60, 60])
      .range([height - 60, -20]) // More space at bottom, less at top

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(`Perceived Threat of Heatwaves on Health Issues (${WAVE_LABELS[currentWave]})`)

    // Add wrapped subtitle
    const subtitleText = '"If you were experiencing a severe heat wave, how worried would you be about the following health issues harming you, your family, or people in your community?"'
    const words = subtitleText.split(' ')
    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
    const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')

    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(line1)

    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(line2)

    // Create bars for each response category
    RESPONSE_CATEGORIES.forEach(category => {
      const bars = []
      
      HEALTH_ISSUES.forEach((issue, issueIndex) => {
        CONDITIONS.forEach((condition, conditionIndex) => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && d.health_issue === issue
          )
          
          if (dataPoint) {
            const value = dataPoint[category.key] || 0
            let start = 0
            
            // Calculate position based on category
            if (category.key === 'very_worried') {
              start = 0
            } else if (category.key === 'extremely_worried') {
              start = dataPoint.very_worried || 0
            } else if (category.key === 'moderately_worried') {
              start = -(dataPoint.moderately_worried || 0)
            } else if (category.key === 'little_worried') {
              start = -((dataPoint.moderately_worried || 0) + (dataPoint.little_worried || 0))
            } else if (category.key === 'not_worried') {
              start = -((dataPoint.moderately_worried || 0) + (dataPoint.little_worried || 0) + (dataPoint.not_worried || 0))
            }
            
            // Calculate x position for faceted layout with spacing
            const facetStart = issueIndex * facetWidth + facetPadding
            const totalBarsWidth = CONDITIONS.length * barWidth + (CONDITIONS.length - 1) * barSpacing
            const groupStart = facetStart + (facetWidth - 2 * facetPadding - totalBarsWidth) / 2
            const xPos = groupStart + conditionIndex * (barWidth + barSpacing)
            
            bars.push({
              issue,
              condition,
              start,
              end: start + value,
              value,
              category: category.label,
              xPos,
              issueIndex,
              conditionIndex
            })
          }
        })
      })
      
      // Draw bars for this category
      if (category.key === 'extremely_worried') {
        // Top bars with rounded corners
        g.selectAll(`.bar-${category.key}`)
          .data(bars)
          .enter()
          .append("path")
          .attr("class", `bar-${category.key}`)
          .attr("d", d => {
            const x = d.xPos
            const y = yScale(Math.max(d.start, d.end))
            const width = barWidth
            const height = Math.abs(yScale(d.start) - yScale(d.end))
            const radius = 2
            
            return `M${x + radius},${y}
                    L${x + width - radius},${y}
                    Q${x + width},${y} ${x + width},${y + radius}
                    L${x + width},${y + height}
                    L${x},${y + height}
                    L${x},${y + radius}
                    Q${x},${y} ${x + radius},${y}
                    Z`
          })
          .attr("fill", category.color)
          .on("mouseover", function(event, d) {
            // Tooltip
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
            
            tooltip.html(`<strong>${d.category}</strong><br/>${d.issue} - ${d.condition}: ${d.value.toFixed(1)}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
          })
          .on("mouseout", function() {
            d3.selectAll(".d3-tooltip").remove()
          })
      } else if (category.key === 'not_worried') {
        // Bottom bars with rounded corners
        g.selectAll(`.bar-${category.key}`)
          .data(bars)
          .enter()
          .append("path")
          .attr("class", `bar-${category.key}`)
          .attr("d", d => {
            const x = d.xPos
            const y = yScale(Math.max(d.start, d.end))
            const width = barWidth
            const height = Math.abs(yScale(d.start) - yScale(d.end))
            const radius = 2
            
            return `M${x},${y}
                    L${x + width},${y}
                    L${x + width},${y + height - radius}
                    Q${x + width},${y + height} ${x + width - radius},${y + height}
                    L${x + radius},${y + height}
                    Q${x},${y + height} ${x},${y + height - radius}
                    L${x},${y}
                    Z`
          })
          .attr("fill", category.color)
          .on("mouseover", function(event, d) {
            // Tooltip
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
            
            tooltip.html(`<strong>${d.category}</strong><br/>${d.issue} - ${d.condition}: ${d.value.toFixed(1)}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
          })
          .on("mouseout", function() {
            d3.selectAll(".d3-tooltip").remove()
          })
      } else {
        // Regular rectangular bars for middle categories
        g.selectAll(`.bar-${category.key}`)
          .data(bars)
          .enter()
          .append("rect")
          .attr("class", `bar-${category.key}`)
          .attr("x", d => d.xPos)
          .attr("y", d => yScale(Math.max(d.start, d.end)))
          .attr("width", barWidth)
          .attr("height", d => Math.abs(yScale(d.start) - yScale(d.end)))
          .attr("fill", category.color)
          .attr("stroke", "none")
          .on("mouseover", function(event, d) {
            // Tooltip
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
            
            tooltip.html(`<strong>${d.category}</strong><br/>${d.issue} - ${d.condition}: ${d.value.toFixed(1)}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
          })
          .on("mouseout", function() {
            d3.selectAll(".d3-tooltip").remove()
          })
      }
    })

    // Add reference line at y=0 (between moderately and very worried) - AFTER bars so it appears on top
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "rgba(128, 128, 128, 0.6)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    // Add health issue labels (properly centered over each facet)
    HEALTH_ISSUES.forEach((issue, index) => {
      const facetStart = index * facetWidth + facetPadding
      const facetCenter = facetStart + (facetWidth - 2 * facetPadding) / 2
      
      g.append("text")
        .attr("x", facetCenter)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "12px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(issue)
    })

    // Add x-axis labels (condition names under each bar)
    HEALTH_ISSUES.forEach((issue, issueIndex) => {
      CONDITIONS.forEach((condition, conditionIndex) => {
        const facetStart = issueIndex * facetWidth + facetPadding
        const totalBarsWidth = CONDITIONS.length * barWidth + (CONDITIONS.length - 1) * barSpacing
        const groupStart = facetStart + (facetWidth - 2 * facetPadding - totalBarsWidth) / 2
        const xPos = groupStart + conditionIndex * (barWidth + barSpacing) + barWidth / 2
        
        g.append("text")
          .attr("x", xPos)
          .attr("y", height + 15)
          .attr("text-anchor", "middle")
          .attr("transform", `rotate(-45, ${xPos}, ${height + 15})`)
          .style("font-size", "9px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .text(condition)
        
        // Add percentage labels on top of bars
        const dataPoint = filteredData.find(d => 
          d.condition === condition && d.health_issue === issue
        )
        
        if (dataPoint) {
          const extremelyWorried = dataPoint.extremely_worried || 0
          const veryWorried = dataPoint.very_worried || 0
          const topValue = extremelyWorried + veryWorried
          const topPosition = extremelyWorried + veryWorried
          
          g.append("text")
            .attr("x", xPos)
            .attr("y", yScale(topPosition) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "#196bc1")
            .style("font-weight", "bold")
            .style("font-family", "Roboto Condensed, sans-serif")
            .text(`${topValue.toFixed(1)}%`)
        }
      })
    })

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height + margin.top + 50})`)

    RESPONSE_CATEGORIES.forEach((category, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 120}, 0)`)

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", category.color)

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "11px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(category.label)
    })

  }, [threatData, currentWave])

  if (loading) return <div className="loading">Loading health worry data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!threatData || threatData.length === 0) return <div className="loading">No threat data available...</div>

  return (
    <div className="health-worry-container">
      <div className="wave-controls">
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
      
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default HealthWorryChart