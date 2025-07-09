import React, { useRef, useState, useEffect } from 'react'
import * as d3 from 'd3'
import { useAMEData } from '../hooks/useAMEData'
import { WAVE_LABELS, COLOR_MAP, getEffectSize } from '../constants'

function AMEChartDumbbellSimple() {
  const svgRef = useRef()
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState("Immediate")

  const outcomeMapping = {
    "Heatwave Likelihood of Exposure": "Perceived Likelihood of Heat Wave Exposure",
    "Heatwave Threat Severity": "Perceived Heat Wave Threat Severity", 
    "Heatwave Threat Health Impact": "Perceived Threat of Heat Waves on Health",
    "Heatwave Impact Knowledge": "Knowledge of the Impact of Heat Waves",
    "Heat and Policy Support": "Heat and Policy Support",
    "Healthcare Worker Responsibility": "Perceived Responsibility of Healthcare Workers",
    "Climate Change Personal Impact": "Personal Impact of Climate Change",
    "Climate Change Support for Action": "Climate Change - Support for Action"
  }

  const yAxisItems = [
    "Perceived Likelihood of Heat Wave Exposure",
    "Perceived Heat Wave Threat Severity",
    "Perceived Threat of Heat Waves on Health", 
    "Knowledge of the Impact of Heat Waves",
    "Heat and Policy Support",
    "Perceived Responsibility of Healthcare Workers",
    "Personal Impact of Climate Change",
    "Climate Change - Support for Action"
  ]


  useEffect(() => {
    if (!ameData || loading || error) return

    // Check if this is an update or initial render
    const svg = d3.select(svgRef.current)
    const existingG = svg.select("g.chart-group")
    const isUpdate = existingG.size() > 0
    
    if (!isUpdate) {
      // Only clear everything on initial render
      svg.selectAll("*").remove()
    }

    // Set up dimensions first - wider graph with reduced left margin
    const margin = { top: 100, right: 80, bottom: 80, left: 280 } // Reduced left margin, increased top for legend
    const width = 900 - margin.left - margin.right // Wider overall width

    // Calculate global domain from ALL data (both waves)
    const globalEstimates = []
    ameData.forEach(item => {
      if (item.contrast?.includes("Treatment vs") && item.contrast?.includes("Control")) {
        globalEstimates.push(item.estimate)
      }
      if (item.contrast?.includes("Handoff vs") && item.contrast?.includes("Control")) {
        globalEstimates.push(item.estimate)
      }
    })
    globalEstimates.push(0) // Include zero baseline

    const globalDomain = d3.extent(globalEstimates)
    console.log('Global estimates:', globalEstimates)
    console.log('Global domain:', globalDomain)
    
    // Ensure domain includes zero and add proper padding
    const maxAbs = Math.max(Math.abs(globalDomain[0]), Math.abs(globalDomain[1]), 0.1) // Ensure minimum range
    const padding = maxAbs * 0.1
    const domainMin = Math.min(globalDomain[0] - padding, -padding)
    const domainMax = Math.max(globalDomain[1] + padding, padding)
    
    console.log('Final domain:', [domainMin, domainMax])
    
    const xScale = d3.scaleLinear()
      .domain([domainMin, domainMax])
      .range([0, width])

    // Filter data for current wave
    const waveData = ameData.filter(item => item.wave === currentWave)
    
    // Process data to get treatment and handoff effects
    const chartData = []
    yAxisItems.forEach(category => {
      const originalOutcome = Object.keys(outcomeMapping).find(key => outcomeMapping[key] === category)
      if (!originalOutcome) return

      const treatmentItem = waveData.find(item => 
        item.outcome === originalOutcome && 
        item.contrast?.includes("Treatment vs") && 
        item.contrast?.includes("Control")
      )
      
      const handoffItem = waveData.find(item => 
        item.outcome === originalOutcome && 
        item.contrast?.includes("Handoff vs") && 
        item.contrast?.includes("Control")
      )

      if (treatmentItem || handoffItem) {
        chartData.push({
          category,
          treatment: treatmentItem ? {
            estimate: treatmentItem.estimate,
            se: treatmentItem.std_error,
            significant: treatmentItem.sig_raw !== "",
            contrast: treatmentItem.contrast,
            pValue: treatmentItem.p_value,
            effectSize: getEffectSize(treatmentItem.estimate, treatmentItem.sig_raw, treatmentItem.p_value)
          } : null,
          handoff: handoffItem ? {
            estimate: handoffItem.estimate, 
            se: handoffItem.std_error,
            significant: handoffItem.sig_raw !== "",
            contrast: handoffItem.contrast,
            pValue: handoffItem.p_value,
            effectSize: getEffectSize(handoffItem.estimate, handoffItem.sig_raw, handoffItem.p_value)
          } : null
        })
      }
    })

    if (chartData.length === 0) return

    // Set up remaining dimensions
    const height = 50 * chartData.length + margin.top + margin.bottom
    
    // Set up SVG dimensions
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height)
    
    const g = isUpdate ? existingG : svg.append("g")
      .attr("class", "chart-group")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Add static elements only on initial render
    if (!isUpdate) {
      // Add title
      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#374151")
        .text("Key Findings: Treatment Effects")

      // Add legend underneath subtitle
      const legendData = [
        { label: 'Heat Wave Episode', color: COLOR_MAP.treatment },
        { label: 'Heat Wave + Social Media', color: COLOR_MAP.handoff }
      ]

      const legendY = 75 // 25px below subtitle
      const legend = svg.append("g")
        .attr("class", "chart-legend")
        .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${legendY})`)

      const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${(i - 0.5) * 160}, 0)`) // Same spacing as before

      legendItems.append("circle")
        .attr("r", 6)
        .attr("fill", d => d.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)

      legendItems.append("text")
        .attr("x", 12)
        .attr("y", 0)
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#374151")
        .text(d => d.label)
    }

    // Update subtitle with current wave
    svg.select("text.subtitle")
      .remove()
    svg.append("text")
      .attr("class", "subtitle")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#6b7280")
      .text(`Effect sizes showing change from control condition (${WAVE_LABELS[currentWave === "Immediate" ? 2 : 3]})`)

    const yScale = d3.scaleBand()
      .domain(chartData.map(d => d.category))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.2)

    // Set transition duration
    const transitionDuration = 600

    // Add X axis (only on initial render)
    if (!isUpdate) {
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(6))

      // Add X axis label
      g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height - margin.top - margin.bottom + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "500")
        .style("fill", "#374151")
        .text("Standard Treatment Effect")

    } else {
      // Update x-axis on wave change
      g.select(".x-axis")
        .transition()
        .duration(transitionDuration)
        .call(d3.axisBottom(xScale).ticks(6))
    }

    // Function to wrap text
    const wrapText = (text, width) => {
      const words = text.split(' ')
      const lines = []
      let currentLine = []
      
      for (let word of words) {
        currentLine.push(word)
        if (currentLine.join(' ').length > width) {
          if (currentLine.length > 1) {
            currentLine.pop()
            lines.push(currentLine.join(' '))
            currentLine = [word]
          } else {
            lines.push(currentLine.join(' '))
            currentLine = []
          }
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '))
      }
      return lines
    }

    // Add Y axis labels with wrapping (only on initial render)
    if (!isUpdate) {
      chartData.forEach((d, i) => {
          const lines = wrapText(d.category, 28) // Tighter wrapping
          const yPos = margin.top + yScale(d.category) + yScale.bandwidth() / 2
          const lineHeight = 12 // Smaller line height
          const startY = yPos - ((lines.length - 1) * lineHeight / 2)
          
          lines.forEach((line, lineIndex) => {
            svg.append("text")
              .attr("class", `y-label-${i}-${lineIndex}`)
              .attr("x", margin.left - 10)
              .attr("y", startY + (lineIndex * lineHeight))
              .attr("text-anchor", "end")
              .attr("dominant-baseline", "middle")
              .style("font-size", "13px")
              .style("font-weight", "500")
              .style("fill", "#374151")
              .text(line)
          })
      })
    }

    // Create tooltip
    let tooltip = d3.select("body").select(".ame-chart-tooltip")
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "ame-chart-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", "1000")
    }

    // Add connecting lines and dots for each category with transitions
    
    chartData.forEach(d => {
      const yPos = yScale(d.category) + yScale.bandwidth() / 2
      const treatmentY = yPos - 3
      const handoffY = yPos + 3

      // Add/update horizontal line from zero to treatment (if exists)
      if (d.treatment) {
        const treatmentLineKey = `treatment-line-${d.category.replace(/\s+/g, '-')}`
        let treatmentLine = g.select(`.${treatmentLineKey}`)
        
        if (treatmentLine.empty()) {
          treatmentLine = g.append("line")
            .attr("class", treatmentLineKey)
            .attr("x1", xScale(0))
            .attr("y1", treatmentY)
            .attr("x2", xScale(0))
            .attr("y2", treatmentY)
            .attr("stroke", COLOR_MAP.treatment)
            .attr("stroke-width", 2)
            .attr("opacity", 0.8)
        }
        
        treatmentLine.transition().duration(transitionDuration)
          .attr("x1", xScale(0))
          .attr("y1", treatmentY)
          .attr("x2", xScale(d.treatment.estimate))
          .attr("y2", treatmentY)
      }

      // Add/update horizontal line from zero to handoff (if exists)
      if (d.handoff) {
        const handoffLineKey = `handoff-line-${d.category.replace(/\s+/g, '-')}`
        let handoffLine = g.select(`.${handoffLineKey}`)
        
        if (handoffLine.empty()) {
          handoffLine = g.append("line")
            .attr("class", handoffLineKey)
            .attr("x1", xScale(0))
            .attr("y1", handoffY)
            .attr("x2", xScale(0))
            .attr("y2", handoffY)
            .attr("stroke", COLOR_MAP.handoff)
            .attr("stroke-width", 2)
            .attr("opacity", 0.8)
        }
        
        handoffLine.transition().duration(transitionDuration)
          .attr("x1", xScale(0))
          .attr("y1", handoffY)
          .attr("x2", xScale(d.handoff.estimate))
          .attr("y2", handoffY)
      }

      // Add/update treatment dot
      if (d.treatment) {
        const treatmentDotKey = `treatment-dot-${d.category.replace(/\s+/g, '-')}`
        let treatmentDot = g.select(`.${treatmentDotKey}`)
        
        if (treatmentDot.empty()) {
          treatmentDot = g.append("circle")
            .attr("class", treatmentDotKey)
            .attr("cx", xScale(0))
            .attr("cy", treatmentY)
            .attr("r", 6)
            .attr("fill", COLOR_MAP.treatment)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
        }
        
        treatmentDot.transition().duration(transitionDuration)
          .attr("cx", xScale(d.treatment.estimate))
          .attr("cy", treatmentY)
          .attr("opacity", d.treatment.significant ? 1 : 0.6)
        
        // Update tooltip
        treatmentDot.on("mouseover", function(event) {
          tooltip.transition().duration(200).style("opacity", 1)
          const pValue = d.treatment.pValue === 0 ? '<0.001' : d.treatment.pValue.toFixed(3)
          const ciLower = d.treatment.estimate - 1.96 * d.treatment.se
          const ciUpper = d.treatment.estimate + 1.96 * d.treatment.se
          tooltip.html(`
            <strong>${d.category}</strong><br/>
            Contrast: ${d.treatment.contrast}<br/>
            Estimate: ${d.treatment.estimate.toFixed(3)}<br/>
            P-value: ${pValue}<br/>
            95% CI: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
        })
        .on("mouseout", function() {
          tooltip.transition().duration(200).style("opacity", 0)
        })
      }

      // Add/update handoff dot
      if (d.handoff) {
        const handoffDotKey = `handoff-dot-${d.category.replace(/\s+/g, '-')}`
        let handoffDot = g.select(`.${handoffDotKey}`)
        
        if (handoffDot.empty()) {
          handoffDot = g.append("circle")
            .attr("class", handoffDotKey)
            .attr("cx", xScale(0))
            .attr("cy", handoffY)
            .attr("r", 6)
            .attr("fill", COLOR_MAP.handoff)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
        }
        
        handoffDot.transition().duration(transitionDuration)
          .attr("cx", xScale(d.handoff.estimate))
          .attr("cy", handoffY)
          .attr("opacity", d.handoff.significant ? 1 : 0.6)
        
        // Update tooltip
        handoffDot.on("mouseover", function(event) {
          tooltip.transition().duration(200).style("opacity", 1)
          const pValue = d.handoff.pValue === 0 ? '<0.001' : d.handoff.pValue.toFixed(3)
          const ciLower = d.handoff.estimate - 1.96 * d.handoff.se
          const ciUpper = d.handoff.estimate + 1.96 * d.handoff.se
          tooltip.html(`
            <strong>${d.category}</strong><br/>
            Contrast: ${d.handoff.contrast}<br/>
            Estimate: ${d.handoff.estimate.toFixed(3)}<br/>
            P-value: ${pValue}<br/>
            95% CI: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
        })
        .on("mouseout", function() {
          tooltip.transition().duration(200).style("opacity", 0)
        })
      }
    })

    // ADD ZERO LINE AT THE VERY END WITH HIGH Z-INDEX
    svg.selectAll(".zero-line").remove()
    svg.selectAll(".zero-line-label").remove()
    
    const absoluteZeroX = margin.left + xScale(0)
    const absoluteY1 = margin.top
    const absoluteY2 = margin.top + (height - margin.top - margin.bottom)
    
    const zeroLine = svg.append("line")
      .attr("class", "zero-line")
      .attr("x1", absoluteZeroX)
      .attr("x2", absoluteZeroX)
      .attr("y1", absoluteY1)
      .attr("y2", absoluteY2)
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.7)
      .style("z-index", "9999")
      .style("pointer-events", "none")

    // Add zero line label - back to original position
    svg.append("text")
      .attr("class", "zero-line-label")
      .attr("x", absoluteZeroX - 12)
      .attr("y", absoluteY1 + (absoluteY2 - absoluteY1) / 2)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, ${absoluteZeroX - 12}, ${absoluteY1 + (absoluteY2 - absoluteY1) / 2})`)
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#666")
      .style("z-index", "9999")
      .style("pointer-events", "none")
      .text("No different from control")

    // Cleanup tooltip on component unmount
    return () => {
      d3.select("body").selectAll(".ame-chart-tooltip").remove()
    }


  }, [ameData, currentWave, loading, error])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>

  return (
    <div className="chart-container-wrapper">
      <div style={{ position: 'relative' }}>
        {/* Wave Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '20px' 
        }}>
          <button 
            className={`wave-tab ${currentWave === "Immediate" ? 'active' : ''}`}
            onClick={() => setCurrentWave("Immediate")}
            style={{
              padding: '8px 16px',
              border: '2px solid #d1d5db',
              background: currentWave === "Immediate" ? '#3b82f6' : 'white',
              color: currentWave === "Immediate" ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            {WAVE_LABELS[2]}
          </button>
          <button 
            className={`wave-tab ${currentWave === "15 Days" ? 'active' : ''}`}
            onClick={() => setCurrentWave("15 Days")}
            style={{
              padding: '8px 16px',
              border: '2px solid #d1d5db', 
              background: currentWave === "15 Days" ? '#3b82f6' : 'white',
              color: currentWave === "15 Days" ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            {WAVE_LABELS[3]}
          </button>
        </div>

        <svg ref={svgRef}></svg>
      </div>
    </div>
  )
}

export default AMEChartDumbbellSimple