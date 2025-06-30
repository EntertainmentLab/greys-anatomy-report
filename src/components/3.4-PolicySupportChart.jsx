import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { usePolicyData } from '../hooks/usePolicyData'
import { CONDITION_LABELS, COLOR_MAP, WAVE_LABELS } from '../constants'
import './3.4-PolicySupportChart.css'

function PolicySupportChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: policyData, loading, error } = usePolicyData()
  const svgRef = useRef()

  useEffect(() => {
    if (!policyData || policyData.length === 0) {
      console.log('No policy data available')
      return
    }

    const filteredData = policyData.filter(d => d.wave === currentWave)
    console.log('Filtered policy data for wave', currentWave, ':', filteredData)
    
    if (filteredData.length === 0) {
      console.log('No data for current wave')
      return
    }

    d3.select(svgRef.current).selectAll("*").remove()

    const margin = { top: 120, right: 40, bottom: 80, left: 150 }
    const width = 700 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const categories = [...new Set(filteredData.map(d => d.category))]
    console.log('Categories:', categories)
    
    const xScale = d3.scaleLinear()
      .domain([69, 78])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, height])
      .padding(0.3)

    // Add title
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(`Policy Support Across Conditions (${WAVE_LABELS[currentWave]})`)

    // Add subtitle
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text('Average support scores for heat-adaptive policies by experimental condition')

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "12px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Average Support (%)")

    // Add y-axis labels
    categories.forEach(category => {
      g.append("text")
        .attr("x", -10)
        .attr("y", yScale(category) + yScale.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(category)
    })

    // Add connecting lines and dots
    categories.forEach(category => {
      const categoryData = filteredData.filter(d => d.category === category)
      const controlData = categoryData.find(d => d.condition === 'control')
      const treatmentData = categoryData.find(d => d.condition === 'treatment')
      const handoffData = categoryData.find(d => d.condition === 'handoff')

      const yPos = yScale(category) + yScale.bandwidth() / 2

      // Line from control to treatment
      if (controlData && treatmentData) {
        g.append("line")
          .attr("x1", xScale(controlData.mean))
          .attr("y1", yPos)
          .attr("x2", xScale(treatmentData.mean))
          .attr("y2", yPos)
          .attr("stroke", COLOR_MAP.treatment)
          .attr("stroke-width", 2)
          .attr("opacity", 0.6)
      }

      // Line from treatment to handoff
      if (treatmentData && handoffData) {
        g.append("line")
          .attr("x1", xScale(treatmentData.mean))
          .attr("y1", yPos)
          .attr("x2", xScale(handoffData.mean))
          .attr("y2", yPos)
          .attr("stroke", COLOR_MAP.handoff)
          .attr("stroke-width", 2)
          .attr("opacity", 0.6)
      }
    })

    // Add dots
    const conditions = ['control', 'treatment', 'handoff']

    conditions.forEach(condition => {
      const conditionData = filteredData.filter(d => d.condition === condition)

      g.selectAll(`.dot-${condition}`)
        .data(conditionData)
        .enter()
        .append("circle")
        .attr("class", `dot-${condition}`)
        .attr("cx", d => xScale(d.mean))
        .attr("cy", d => yScale(d.category) + yScale.bandwidth() / 2)
        .attr("r", 6)
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 2)
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
          
          tooltip.html(`<strong>${CONDITION_LABELS[d.condition]}</strong><br/>${d.category}: ${d.mean.toFixed(1)}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove()
        })

      // Add value labels above dots with colored backgrounds and triangular pointers
      g.selectAll(`.label-${condition}`)
        .data(conditionData)
        .enter()
        .append("g")
        .attr("class", `label-${condition}`)
        .each(function(d) {
          const group = d3.select(this)
          const xPos = xScale(d.mean)
          const yPos = yScale(d.category) + yScale.bandwidth() / 2 - 15
          
          // Add background rectangle
          group.append("rect")
            .attr("x", xPos - 10)
            .attr("y", yPos - 8)
            .attr("width", 20)
            .attr("height", 14)
            .attr("fill", COLOR_MAP[condition])
            .attr("rx", 3)
            .attr("ry", 3)
          
          // Add triangle pointer
          group.append("path")
            .attr("d", `M${xPos - 3},${yPos + 6} L${xPos + 3},${yPos + 6} L${xPos},${yPos + 10} Z`)
            .attr("fill", COLOR_MAP[condition])
          
          // Add white text
          group.append("text")
            .attr("x", xPos)
            .attr("y", yPos)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", "8px")
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-family", "Roboto Condensed, sans-serif")
            .text(Math.round(d.mean))
        })
    })

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + width / 2 - (conditions.length * 120) / 2}, ${height + margin.top + 50})`)

    conditions.forEach((condition, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 120}, 0)`)

      legendItem.append("circle")
        .attr("r", 6)
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 2)

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .style("font-size", "11px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(CONDITION_LABELS[condition])
    })

  }, [policyData, currentWave])

  if (loading) return <div className="loading">Loading policy support data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!policyData || policyData.length === 0) {
    return <div className="loading">No policy support data available...</div>
  }

  return (
    <div className="policy-support-container">
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

export default PolicySupportChart
