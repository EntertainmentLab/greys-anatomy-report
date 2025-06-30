import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useClimateTemporalData } from '../hooks/useClimateTemporalData'
import { COLOR_MAP } from '../constants'
import './3.5-ClimateTemporalChart.css'

// Define conditions with your color scheme
const CLIMATE_CONDITIONS = [
  { name: "Control", color: COLOR_MAP.control },
  { name: "Heatwave", color: COLOR_MAP.treatment },
  { name: "Heatwave + Handoff", color: COLOR_MAP.handoff }
]

function ClimateTemporalChart() {
  const { climateTemporalData, loading, error } = useClimateTemporalData()
  const svgRef = useRef()

  useEffect(() => {
    if (!climateTemporalData || climateTemporalData.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 80, right: 60, bottom: 120, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Climate Change Temporal Proximity")

    // Add subtitle with line breaks
    const subtitleText = '"In about how many years from now do you expect climate change to have a significant impact on your daily life?"'
    
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(subtitleText)

    // Create scales
    const xScale = d3.scalePoint()
      .domain([1, 2, 3, 4, 5]) // 5 time points
      .range([0, width])
      .padding(0.1)

    // Calculate y-domain with some padding
    const allMeans = climateTemporalData.map(d => d.mean)
    const yMin = Math.min(...allMeans) - 0.5
    const yMax = Math.max(...allMeans) + 0.5

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0])

    // Add axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          const timeLabels = {
            1: "Baseline\n(7 Days Before)",
            2: "Immediately\nAfter Viewing",
            3: "5 Days",
            4: "10 Days",
            5: "15 Days\nLater"
          }
          return timeLabels[d] || d
        }))

    // Style x-axis text
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("text-anchor", "middle")
      .each(function(d) {
        const text = d3.select(this)
        const lines = text.text().split('\n')
        text.text('')
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? '0.8em' : '1em')
            .text(line)
        })
      })

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))

    // Style y-axis
    yAxis.selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "Roboto Condensed, sans-serif")

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Number of Years")

    // Group data by condition
    const dataByCondition = {}
    climateTemporalData.forEach(d => {
      if (!dataByCondition[d.condition]) {
        dataByCondition[d.condition] = []
      }
      dataByCondition[d.condition].push(d)
    })

    // Sort each condition's data by wave
    Object.keys(dataByCondition).forEach(condition => {
      dataByCondition[condition].sort((a, b) => a.wave - b.wave)
    })

    // Create line generator (straight lines)
    const line = d3.line()
      .x(d => xScale(d.xPosition))
      .y(d => yScale(d.mean))
      .curve(d3.curveLinear) // Changed to linear for straight lines

    // Prepare data with x positions
    const prepareDataForLine = (conditionData) => {
      const lineData = []
      
      conditionData.forEach(d => {
        if (d.wave === 1) {
          lineData.push({ ...d, xPosition: 1 })
        } else if (d.wave === 2) {
          lineData.push({ ...d, xPosition: 2 })
        } else if (d.wave === 3) {
          lineData.push({ ...d, xPosition: 5 })
        }
      })
      
      return lineData.sort((a, b) => a.xPosition - b.xPosition)
    }

    // Draw lines for each condition
    CLIMATE_CONDITIONS.forEach(conditionInfo => {
      const conditionData = dataByCondition[conditionInfo.name]
      if (!conditionData || conditionData.length === 0) return

      const lineData = prepareDataForLine(conditionData)

      // Draw line
      g.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", conditionInfo.color)
        .attr("stroke-width", 3)
        .attr("d", line)

      // Draw points only for actual data points
      g.selectAll(`.point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("class", `point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .attr("cx", d => xScale(d.xPosition))
        .attr("cy", d => yScale(d.mean))
        .attr("r", 4)
        .attr("fill", conditionInfo.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          // Tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0)

          tooltip.transition()
            .duration(200)
            .style("opacity", .9)
          
          tooltip.html(`<strong>${d.condition}</strong><br/>
                       Wave ${d.wave}: ${d.mean.toFixed(2)} years<br/>
                       (±${d.se.toFixed(2)} SE)`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove()
        })
    })

    // Add legend at the bottom (centered)
    const legendWidth = CLIMATE_CONDITIONS.length * 150
    const legendStartX = (width + margin.left + margin.right - legendWidth) / 2
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendStartX}, ${height + margin.top + 60})`)

    const legendItems = legend.selectAll(".legend-item")
      .data(CLIMATE_CONDITIONS)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 150}, 0)`)

    // Legend lines
    legendItems.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3)

    // Legend circles
    legendItems.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)

    // Legend text
    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(d => d.name)



  }, [climateTemporalData])

  if (loading) return <div className="loading">Loading climate temporal data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!climateTemporalData || climateTemporalData.length === 0) return <div className="loading">No climate temporal data available...</div>

  return (
    <div className="climate-temporal-container">
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default ClimateTemporalChart