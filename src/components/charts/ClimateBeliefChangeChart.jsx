import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useClimateBeliefChangeData } from '../../hooks/useClimateBeliefChangeData'

function ClimateBeliefChangeChart({ 
  title = "Climate Belief Changes: From 'Never' to New Perspectives",
  subtitle = "Among people who initially said climate change will never affect them",
  className = "chart-container" 
}) {
  const svgRef = useRef()
  const { climateBeliefChangeData, loading, error } = useClimateBeliefChangeData()

  useEffect(() => {
    if (!climateBeliefChangeData || climateBeliefChangeData.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Responsive dimensions
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width
    const isMobile = window.innerWidth <= 768
    const margin = isMobile 
      ? { top: 60, right: 120, bottom: 40, left: 120 }
      : { top: 80, right: 150, bottom: 60, left: 150 }
    
    const width = containerWidth - margin.left - margin.right
    const height = isMobile ? 300 : 400
    const chartHeight = height - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Color scale for responses
    const colorScale = d3.scaleOrdinal()
      .domain(["It will never affect me", "It will in the future", "It already has"])
      .range(["#d73027", "#fee08b", "#4575b4"])

    // Y scale for conditions
    const yScale = d3.scaleBand()
      .domain(climateBeliefChangeData.map(d => d.condition))
      .range([0, chartHeight])
      .padding(0.2)

    // X scale for percentages
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width])

    // Create stacked data
    const stackedData = climateBeliefChangeData.map(d => {
      let cumulative = 0
      const responses = ["It will never affect me", "It will in the future", "It already has"]
      
      return {
        condition: d.condition,
        total_n: d.total_n,
        changed_mind_pct: d.changed_mind_pct,
        segments: responses.map(response => {
          const percentage = d.percentages[response]
          const segment = {
            response,
            percentage,
            x0: cumulative,
            x1: cumulative + percentage
          }
          cumulative += percentage
          return segment
        })
      }
    })

    // Draw bars
    const bars = g.selectAll(".condition-group")
      .data(stackedData)
      .enter().append("g")
      .attr("class", "condition-group")
      .attr("transform", d => `translate(0,${yScale(d.condition)})`)

    // Draw segments
    bars.selectAll(".segment")
      .data(d => d.segments)
      .enter().append("rect")
      .attr("class", "segment")
      .attr("x", d => xScale(d.x0))
      .attr("y", 0)
      .attr("width", d => xScale(d.x1) - xScale(d.x0))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.response))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)

    // Add percentage labels on segments
    bars.selectAll(".segment-label")
      .data(d => d.segments.filter(s => s.percentage > 5)) // Only show labels for segments > 5%
      .enter().append("text")
      .attr("class", "segment-label")
      .attr("x", d => xScale(d.x0 + d.percentage / 2))
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("font-weight", "bold")
      .text(d => `${d.percentage}%`)

    // Add condition labels
    g.selectAll(".condition-label")
      .data(stackedData)
      .enter().append("text")
      .attr("class", "condition-label")
      .attr("x", -10)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", isMobile ? "12px" : "14px")
      .style("font-weight", "bold")
      .text(d => d.condition)

    // Add "changed mind" percentage on the right
    g.selectAll(".changed-mind-label")
      .data(stackedData)
      .enter().append("text")
      .attr("class", "changed-mind-label")
      .attr("x", width + 20)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", isMobile ? "12px" : "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(d => `${d.changed_mind_pct}% changed mind`)

    // Add sample size labels
    g.selectAll(".sample-size-label")
      .data(stackedData)
      .enter().append("text")
      .attr("class", "sample-size-label")
      .attr("x", width + 20)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2 + 20)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("fill", "#666")
      .text(d => `(n = ${d.total_n})`)

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width / 2 - 150}, ${chartHeight + 20})`)

    const legendData = ["It will never affect me", "It will in the future", "It already has"]
    
    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 100}, 0)`)

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScale(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", isMobile ? "10px" : "11px")
      .style("fill", "#333")
      .text(d => d)

  }, [climateBeliefChangeData])

  if (loading) return <div className="loading">Loading chart...</div>
  if (error) return <div className="error">Error loading chart: {error}</div>

  return (
    <div className={className}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-subtitle">{subtitle}</p>
      </div>
      <div className="chart-content">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default ClimateBeliefChangeChart