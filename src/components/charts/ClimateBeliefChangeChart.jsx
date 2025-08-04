import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useClimateBeliefChangeData } from '../../hooks/useClimateBeliefChangeData'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'

function ClimateBeliefChangeChart({ 
  title = "Climate Belief Changes: From 'Never' to New Perspectives",
  subtitle = "Among people who initially said climate change will never affect them",
  className = "chart-container" 
}) {
  const svgRef = useRef()
  const { climateBeliefChangeData, loading, error } = useClimateBeliefChangeData()
  const { chartRef, generateFilename } = useChartDownload('climate-belief-change')

  useEffect(() => {
    if (!climateBeliefChangeData || climateBeliefChangeData.length === 0) {
      return
    }


    // Add a small delay to ensure container has rendered
    const timer = setTimeout(() => {
      renderChart()
    }, 100)

    return () => clearTimeout(timer)
  }, [climateBeliefChangeData])

  const renderChart = () => {
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Responsive dimensions
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width
    const isMobile = window.innerWidth <= 768
    const margin = isMobile 
      ? { top: 40, right: 80, bottom: 80, left: 100 }
      : { top: 40, right: 120, bottom: 100, left: 120 }
    
    // Ensure minimum width
    const minWidth = isMobile ? 280 : 400
    const width = Math.max(minWidth, containerWidth - margin.left - margin.right)
    const height = isMobile ? 280 : 350
    const chartHeight = height - margin.top - margin.bottom

    // Don't render if dimensions are invalid
    if (width <= 0 || height <= 0 || chartHeight <= 0) {
      return
    }

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
      
      const result = {
        condition: d.condition,
        total_n: d.total_n,
        changed_mind_pct: d.changed_mind_pct,
        segments: responses.map(response => {
          const percentage = d.percentages[response] || 0
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
      
      return result
    })

    // Draw bars
    const bars = g.selectAll(".condition-group")
      .data(stackedData)
      .enter().append("g")
      .attr("class", "condition-group")
      .attr("transform", d => `translate(0,${yScale(d.condition)})`)


    // Draw segments
    const segments = bars.selectAll(".segment")
      .data(d => d.segments)
      .enter().append("rect")
      .attr("class", "segment")
      .attr("x", d => Math.max(0, xScale(d.x0)))
      .attr("y", 0)
      .attr("width", d => Math.max(0, xScale(d.percentage)))
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
      .attr("x", width + 10)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2 - 5)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", isMobile ? "11px" : "13px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(d => `${d.changed_mind_pct}%`)

    // Add "changed mind" text
    g.selectAll(".changed-mind-text")
      .data(stackedData)
      .enter().append("text")
      .attr("class", "changed-mind-text")
      .attr("x", width + 10)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2 + 10)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", isMobile ? "9px" : "11px")
      .style("fill", "#666")
      .text("changed mind")

    // Add sample size labels
    g.selectAll(".sample-size-label")
      .data(stackedData)
      .enter().append("text")
      .attr("class", "sample-size-label")
      .attr("x", width + 10)
      .attr("y", d => yScale(d.condition) + yScale.bandwidth() / 2 + 25)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", isMobile ? "9px" : "10px")
      .style("fill", "#999")
      .text(d => `(n = ${d.total_n})`)

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${isMobile ? 0 : width / 2 - 150}, ${chartHeight + 20})`)

    const legendData = ["It will never affect me", "It will in the future", "It already has"]
    
    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => {
        if (isMobile) {
          // Stack vertically on mobile
          return `translate(0, ${i * 20})`
        } else {
          // Horizontal on desktop
          return `translate(${i * 100}, 0)`
        }
      })

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
  }

  if (loading) return <div className="loading">Loading chart...</div>
  if (error) return <div className="error">Error loading chart: {error}</div>

  return (
    <div className={className} ref={chartRef} style={{ position: 'relative' }}>
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename()}
        position="top-right"
      />
      <div className="chart-header" style={{ marginBottom: '20px' }}>
        <h3 className="chart-title" style={{ 
          margin: '0 0 10px 0',
          fontSize: window.innerWidth <= 768 ? '16px' : '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
        <p className="chart-subtitle" style={{ 
          margin: '0',
          fontSize: window.innerWidth <= 768 ? '13px' : '14px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          {subtitle}
        </p>
      </div>
      <div className="chart-content">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default ClimateBeliefChangeChart