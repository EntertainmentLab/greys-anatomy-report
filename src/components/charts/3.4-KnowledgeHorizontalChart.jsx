import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useKnowledgeData } from '../../hooks/useKnowledgeData'
import { COLOR_MAP, KNOWLEDGE_CATEGORIES } from '../../constants'
import WaveToggle from '../ui/WaveToggle'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'

function KnowledgeHorizontalChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const { data: knowledgeData, loading, error } = useKnowledgeData()
  const svgRef = useRef()
  const { chartRef, generateFilename } = useChartDownload('knowledge-horizontal')

  useEffect(() => {
    if (!knowledgeData || knowledgeData.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Filter data for current wave
    const waveData = knowledgeData.filter(d => d.wave === currentWave)
    
    // Group by category and calculate averages
    const categoryData = {}
    KNOWLEDGE_CATEGORIES.forEach(category => {
      const catData = waveData.filter(d => d.category === category)
      if (catData.length === 0) return
      
      // Calculate average values for each condition
      const conditionMap = {
        'control': 'Control',
        'treatment': 'Heat Wave',
        'handoff': 'Multiplatform Group'
      }
      
      categoryData[category] = {}
      
      Object.entries(conditionMap).forEach(([dataCondition, displayCondition]) => {
        const condData = catData.filter(d => d.condition === dataCondition)
        if (condData.length > 0) {
          const avgMean = condData.reduce((sum, d) => sum + (d.mean || 0), 0) / condData.length
          const avgSe = condData.reduce((sum, d) => sum + (d.se || 0), 0) / condData.length
          categoryData[category][displayCondition] = {
            value: avgMean, // Already in percentage
            se: avgSe,
            ci_lower: avgMean - 1.96 * avgSe,
            ci_upper: avgMean + 1.96 * avgSe
          }
        }
      })
    })

    // Set up dimensions
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width || 800
    const isMobile = containerWidth <= 768
    
    const margin = {
      top: isMobile ? 80 : 100,
      right: isMobile ? 40 : 80,
      bottom: isMobile ? 80 : 100,
      left: isMobile ? 120 : 180
    }
    
    const width = Math.max(400, containerWidth * 0.9) - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", isMobile ? 25 : 30)
      .attr("text-anchor", "middle")
      .style("font-size", isMobile ? "18px" : "22px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Knowledge of Heat Wave Health Impacts")

    // Add subtitle
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", isMobile ? 50 : 55)
      .attr("text-anchor", "middle")
      .style("font-size", isMobile ? "14px" : "16px")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Percentage correct by condition")

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width])

    const categories = Object.keys(categoryData).reverse() // Reverse for top-to-bottom order
    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, height])
      .padding(0.3)

    // Add x-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 5 : 10)
        .tickFormat(d => d + "%"))

    xAxis.selectAll("text")
      .style("font-size", isMobile ? "12px" : "14px")
      .style("font-family", "Roboto Condensed, sans-serif")

    // Add x-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + (isMobile ? 50 : 60))
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "14px" : "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Percentage Correct")

    // Add y-axis (category labels)
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))

    yAxis.selectAll("text")
      .style("font-size", isMobile ? "12px" : "14px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("text-anchor", "end")
      .each(function(d) {
        const text = d3.select(this)
        // Wrap long text if needed
        if (d.length > 20 && isMobile) {
          const words = d.split(' ')
          text.text('')
          let line = ''
          let lineNumber = 0
          const lineHeight = 1.1
          const y = text.attr('y')
          const dy = parseFloat(text.attr('dy'))
          
          words.forEach(word => {
            const testLine = line + word + ' '
            if (testLine.length > 15 && line !== '') {
              text.append('tspan')
                .attr('x', -10)
                .attr('y', y)
                .attr('dy', `${lineNumber * lineHeight + dy}em`)
                .text(line)
              line = word + ' '
              lineNumber++
            } else {
              line = testLine
            }
          })
          
          text.append('tspan')
            .attr('x', -10)
            .attr('y', y)
            .attr('dy', `${lineNumber * lineHeight + dy}em`)
            .text(line)
        }
      })

    // Remove y-axis line
    yAxis.select(".domain").remove()

    // Define conditions to display
    const conditions = [
      { name: 'Control', color: COLOR_MAP.control },
      { name: 'Heat Wave', color: COLOR_MAP.treatment },
      { name: 'Multiplatform Group', color: COLOR_MAP.handoff }
    ]

    // Draw bars and error bars for each category
    categories.forEach((category, catIndex) => {
      const catGroup = g.append("g")
        .attr("class", `category-group-${catIndex}`)

      const barHeight = yScale.bandwidth() / conditions.length
      
      conditions.forEach((condition, condIndex) => {
        const data = categoryData[category][condition.name]
        if (!data) return

        // Draw error bar first (behind the bar)
        catGroup.append("line")
          .attr("x1", xScale(data.ci_lower))
          .attr("x2", xScale(data.ci_upper))
          .attr("y1", yScale(category) + barHeight * condIndex + barHeight / 2)
          .attr("y2", yScale(category) + barHeight * condIndex + barHeight / 2)
          .attr("stroke", d3.color(condition.color).darker(0.5))
          .attr("stroke-width", 2)

        // Draw error bar caps
        catGroup.append("line")
          .attr("x1", xScale(data.ci_lower))
          .attr("x2", xScale(data.ci_lower))
          .attr("y1", yScale(category) + barHeight * condIndex + barHeight / 2 - 4)
          .attr("y2", yScale(category) + barHeight * condIndex + barHeight / 2 + 4)
          .attr("stroke", d3.color(condition.color).darker(0.5))
          .attr("stroke-width", 2)

        catGroup.append("line")
          .attr("x1", xScale(data.ci_upper))
          .attr("x2", xScale(data.ci_upper))
          .attr("y1", yScale(category) + barHeight * condIndex + barHeight / 2 - 4)
          .attr("y2", yScale(category) + barHeight * condIndex + barHeight / 2 + 4)
          .attr("stroke", d3.color(condition.color).darker(0.5))
          .attr("stroke-width", 2)

        // Draw bar
        const bar = catGroup.append("rect")
          .attr("x", 0)
          .attr("y", yScale(category) + barHeight * condIndex)
          .attr("width", xScale(data.value))
          .attr("height", barHeight)
          .attr("fill", condition.color)
          .attr("opacity", 0.8)

        // Add value label at the end of the bar
        catGroup.append("text")
          .attr("x", xScale(data.value) + 5)
          .attr("y", yScale(category) + barHeight * condIndex + barHeight / 2)
          .attr("dy", "0.35em")
          .style("font-size", isMobile ? "11px" : "13px")
          .style("font-weight", "bold")
          .style("font-family", "Roboto Condensed, sans-serif")
          .text(data.value.toFixed(1))

        // Add tooltip
        bar.on("mouseover", function(event) {
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
          
          tooltip.html(`
            <strong>${condition.name}</strong><br/>
            ${category}<br/>
            Correct: ${data.value.toFixed(1)}%<br/>
            95% CI: [${data.ci_lower.toFixed(1)}%, ${data.ci_upper.toFixed(1)}%]
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove()
        })
      })
    })

    // Add legend
    const legendWidth = conditions.length * (isMobile ? 120 : 150)
    const legendStartX = (width + margin.left + margin.right - legendWidth) / 2
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendStartX}, ${height + margin.top + (isMobile ? 70 : 80)})`)

    conditions.forEach((condition, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${i * (isMobile ? 120 : 150)}, 0)`)

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", condition.color)
        .attr("opacity", 0.8)

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 7.5)
        .attr("dy", "0.35em")
        .style("font-size", isMobile ? "12px" : "14px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(condition.name)
    })

    // Add note about statistical significance
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", height + margin.top + (isMobile ? 95 : 105))
      .style("font-size", isMobile ? "10px" : "12px")
      .style("fill", "#666")
      .style("font-style", "italic")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text("Error bars show 95% confidence intervals")

  }, [knowledgeData, currentWave])

  if (loading) return <div className="loading">Loading knowledge data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  
  if (!knowledgeData || knowledgeData.length === 0) {
    return <div className="loading">No knowledge data available...</div>
  }

  return (
    <div className="unified-chart-container" ref={chartRef} style={{ position: 'relative', maxWidth: '100%', marginTop: '2rem' }}>
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename({ wave: currentWave })}
        position="top-right"
      />
      
      <WaveToggle
        currentWave={currentWave}
        onWaveChange={setCurrentWave}
        availableWaves={[2, 3]}
      />
      
      <div className="chart-svg-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default KnowledgeHorizontalChart