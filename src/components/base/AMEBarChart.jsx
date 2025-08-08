import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { getBarColor, formatTooltip, getEffectSize } from '../../utils/ameChartUtils'
import { COLOR_MAP, CONDITION_LABELS } from '../../constants'

const AMEBarChart = ({ 
  data, 
  previousData = null,
  title, 
  subtitle, 
  maxValue = 0.8, 
  onOutcomeClick = null 
}) => {
  const svgRef = useRef()
  const [isInitialized, setIsInitialized] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [containerWidth, setContainerWidth] = useState(1000)
  const [chartDimensions, setChartDimensions] = useState({ margin: { left: 200 }, width: 500 })

  // Calculate mobile state based on container width
  const isMobile = containerWidth < 768
  const isSmallMobile = containerWidth < 480

  // Text wrapping utility function
  const wrapText = (text, maxWidth, fontSize = 12) => {
    if (!text || typeof text !== 'string') return ['']
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + ' ' + word
      const testWidth = testLine.length * fontSize * 0.6
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)
    return lines
  }

  useEffect(() => {
    if (!data || data.length === 0) return

    // Helper function to find matching outcome data
    const findMatchingOutcome = (outcomeData, outcome) => {
      return outcomeData?.find(o => o.outcome === outcome)
    }

    // Group data by outcome categories
    const groupedData = data.map(outcome => {
      const bars = []
      const previousOutcome = findMatchingOutcome(previousData, outcome.outcome)
      
      if (outcome.treatment) {
        const effect = getEffectSize(outcome.treatment.estimate, outcome.treatment.sig, outcome.treatment.p_value_fdr)
        const previousTreatment = previousOutcome?.treatment
        
        bars.push({
          type: 'treatment',
          label: CONDITION_LABELS.treatment,
          color: '#86efac', // Light green for treatment
          data: outcome.treatment,
          previousData: previousTreatment,
          effect: effect
        })
      }
      if (outcome.handoff) {
        const effect = getEffectSize(outcome.handoff.estimate, outcome.handoff.sig, outcome.handoff.p_value_fdr)
        const previousHandoff = previousOutcome?.handoff
        
        bars.push({
          type: 'handoff',
          label: CONDITION_LABELS.handoff,
          color: '#16a34a', // Dark green for handoff/multiplatform
          data: outcome.handoff,
          previousData: previousHandoff,
          effect: effect
        })
      }
      return {
        outcome: outcome.outcome,
        bars: bars
      }
    })

    // Get container dimensions for responsive sizing
    const containerElement = svgRef.current.parentElement
    const currentContainerWidth = containerElement ? containerElement.getBoundingClientRect().width : 1200
    
    // Update container width state if it has changed significantly
    if (Math.abs(currentContainerWidth - containerWidth) > 20) {
      setContainerWidth(currentContainerWidth)
    }
    
    // Calculate responsive dimensions with stable margins
    // Use a fixed label width to prevent size changes between waves
    const baseLabelWidth = isMobile ? 180 : 220
    const leftMargin = baseLabelWidth + (isMobile ? 15 : 20)
    
    const margin = { 
      top: isMobile ? 100 : 120, // Increased to make room for legend under subtitle
      right: isMobile ? 180 : 220, // More space for effect size column
      bottom: isMobile ? 60 : 80, 
      left: leftMargin 
    }
    
    const categoryHeight = isMobile ? 60 : 80
    const availableWidth = currentContainerWidth // Use full container width
    const width = Math.max(350, (availableWidth - margin.left - margin.right) * 0.75)
    // Use actual category count for height calculation
    const height = groupedData.length * categoryHeight

    // Update chart dimensions for use in JSX only if they've changed significantly
    if (Math.abs(chartDimensions.width - width) > 5 || Math.abs(chartDimensions.margin.left - margin.left) > 5) {
      setChartDimensions({ margin, width })
    }

    // Scales
    const xScale = d3.scaleLinear()
      .domain([-0.1, maxValue])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(groupedData.map(d => d.outcome))
      .range([0, height])
      .paddingInner(0.3)
      .paddingOuter(0.1)

    const svg = d3.select(svgRef.current)

    // Check if this is an update (for transitions) or initial render
    const isUpdate = svg.select("g.chart-group").size() > 0

    // Only do a full clear and rebuild on first render
    if (!isInitialized) {
      svg.selectAll('*').remove()
      setIsInitialized(true)
    }

    // Set SVG dimensions
    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    // Remove pattern definitions - no longer needed

    // Create or select main group
    let g = svg.select('.chart-group')
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'chart-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
    }

    // Tooltip will be accessed via tooltipRef.current directly

    // Update responsive title
    let titleText = svg.select('.chart-title')
    if (titleText.empty()) {
      titleText = svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', isMobile ? 20 : 25)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', isMobile ? '14px' : '18px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
    } else {
      titleText
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', isMobile ? 20 : 25)
        .style('font-size', isMobile ? '14px' : '18px')
    }
    titleText.text(title)

    // Update responsive subtitle
    svg.selectAll('.chart-subtitle').remove()
    const subtitleWidth = Math.min(500, width + margin.left + margin.right - 40)
    const subtitleFontSize = isMobile ? 11 : 14
    const wrappedSubtitle = wrapText(subtitle, subtitleWidth, subtitleFontSize)
    wrappedSubtitle.forEach((line, lineIndex) => {
      svg.append('text')
        .attr('class', 'chart-subtitle')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', (isMobile ? 35 : 45) + (lineIndex * (isMobile ? 12 : 16)))
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', subtitleFontSize + 'px')
        .style('fill', '#6b7280')
        .text(line)
    })

    // Add static elements only if they don't exist
    if (g.select('.x-axis').empty()) {
      // X-axis
      const xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(-0.1, 0.9, 0.1))
        .tickFormat(d3.format('.1f'))

      const xAxisGroup = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)

      xAxisGroup.select('.domain')
        .style('stroke', '#374151')
        .style('stroke-width', 1)

      xAxisGroup.selectAll('.tick line')
        .style('stroke', '#d1d5db')

      xAxisGroup.selectAll('.tick text')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', isMobile ? '10px' : '12px')
        .style('fill', '#374151')

      xAxisGroup.selectAll('.tick')
        .filter(d => d === 0)
        .select('line')
        .style('stroke', '#374151')
        .style('stroke-width', 2)

      // X-axis label
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + (isMobile ? 30 : 40))
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', isMobile ? '11px' : '14px')
        .style('fill', '#374151')
        .text('Standardized Treatment Effect')

      // Effect size header is now handled by HTML overlay

      // Legend showing different bar types
      const legendData = [
        { label: CONDITION_LABELS.treatment, type: 'treatment' },
        { label: CONDITION_LABELS.handoff, type: 'handoff' }
      ]

      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${(width + margin.left + margin.right) / 2}, ${isMobile ? 80 : 90})`)

      const legendItemWidth = isMobile ? 120 : 160
      const totalLegendWidth = legendData.length * legendItemWidth
      const startX = -totalLegendWidth / 2

      const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${startX + (i * legendItemWidth)}, 0)`)

      // Create legend bars that match the actual chart appearance
      legendItems.each(function(d) {
        const group = d3.select(this)
        const rectWidth = isMobile ? 20 : 24
        const rectHeight = isMobile ? 14 : 16
        
        // Use the same colors as the bars
        const color = d.type === 'treatment' ? '#86efac' : '#16a34a'
        
        group.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .style('fill', color)
          .style('stroke', '#374151')
          .style('stroke-width', 1)
        
        // Add label
        group.append('text')
          .attr('x', rectWidth + 8)
          .attr('y', rectHeight / 2)
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', isMobile ? '10px' : '11px')
          .style('fill', '#374151')
          .style('dominant-baseline', 'middle')
          .text(d.label)
      })
    }

    // Simple data update for categories - clear and rebuild each time
    g.selectAll('.category-group').remove()
    
    const categoryGroups = g.selectAll('.category-group')
      .data(groupedData)
      .enter()
      .append('g')
      .attr('class', 'category-group')
      .attr('transform', d => `translate(0, ${yScale(d.outcome)})`)

    // Add alternating category backgrounds
    categoryGroups.append('rect')
      .attr('x', -margin.left)
      .attr('y', 0)
      .attr('width', width + margin.left + margin.right)
      .attr('height', yScale.bandwidth())
      .style('fill', (d, i) => i % 2 === 0 ? '#f9fafb' : '#ffffff')

    // Add responsive category labels
    categoryGroups.each(function(d) {
      const group = d3.select(this)
      const availableWidth = baseLabelWidth - (isMobile ? 20 : 30) // Leave room for info button
      const fontSize = isMobile ? 12 : 14
      const wrappedLines = wrapText(d.outcome, availableWidth, fontSize)
      const lineHeight = isMobile ? 14 : 16
      const totalHeight = wrappedLines.length * lineHeight
      const startY = (yScale.bandwidth() - totalHeight) / 2 + lineHeight
      const textX = isMobile ? -20 : -30 // Position text appropriately

      wrappedLines.forEach((line, lineIndex) => {
        group.append('text')
          .attr('x', textX)
          .attr('y', startY + (lineIndex * lineHeight))
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', fontSize + 'px')
          .style('font-weight', '600')
          .style('fill', '#374151')
          .style('cursor', onOutcomeClick ? 'pointer' : 'default')
          .text(line)
          .on('click', function(event) {
            if (onOutcomeClick) {
              onOutcomeClick(d.outcome)
            }
          })
      })

      // Add responsive info buttons
      // Y-axis info icons will be added as HTML elements instead of SVG
      // Store outcome click data for HTML buttons
      if (onOutcomeClick) {
        d.hasInfoButton = true
        d.onOutcomeClick = onOutcomeClick
      }
    })

    // Add bars with smooth animations
    categoryGroups.each(function(categoryData) {
      const group = d3.select(this)
      const barCount = categoryData.bars.length
      const barHeight = isMobile ? 16 : 20
      const barSpacing = isMobile ? 3 : 4
      const totalBarHeight = (barHeight * barCount) + (barSpacing * (barCount - 1))
      const startY = (yScale.bandwidth() - totalBarHeight) / 2

      categoryData.bars.forEach((bar, barIndex) => {
        const barY = startY + (barIndex * (barHeight + barSpacing))

        // Individual bar container background
        group.append('rect')
          .attr('x', 0)
          .attr('y', barY)
          .attr('width', width)
          .attr('height', barHeight)
          .style('fill', '#f8fafc')
          .style('stroke', '#e2e8f0')
          .style('stroke-width', 0.5)

        // Zero line
        group.append('line')
          .attr('x1', xScale(0))
          .attr('x2', xScale(0))
          .attr('y1', barY)
          .attr('y2', barY + barHeight)
          .style('stroke', '#1f2937')
          .style('stroke-width', 1)

        // Effect bar with smooth animation from previous wave data
        const barStart = Math.min(0, bar.data.estimate)
        const barEnd = Math.max(0, bar.data.estimate)
        const barWidth = Math.max(2, xScale(barEnd) - xScale(barStart))

        // Use previous wave data as animation starting point if available
        const startFromPrevious = bar.previousData && previousData
        const prevBarStart = startFromPrevious ? Math.min(0, bar.previousData.estimate) : 0
        const prevBarEnd = startFromPrevious ? Math.max(0, bar.previousData.estimate) : 0
        const prevBarWidth = startFromPrevious ? Math.max(2, xScale(prevBarEnd) - xScale(prevBarStart)) : 0

        // Create solid colored bars
        const effectBar = group.append('rect')
          .attr('x', startFromPrevious ? xScale(prevBarStart) : xScale(0))
          .attr('y', barY)
          .attr('width', startFromPrevious ? prevBarWidth : 0)
          .attr('height', barHeight)
          .style('fill', bar.color)
          .style('pointer-events', 'none')

        // Animate to final position
        effectBar
          .transition()
          .duration(750)
          .ease(d3.easeQuadOut)
          .attr('x', xScale(barStart))
          .attr('width', barWidth)

        // Confidence interval
        const prevCiLower = startFromPrevious ? bar.previousData.ci_lower : 0
        const prevCiUpper = startFromPrevious ? bar.previousData.ci_upper : 0
        const prevCiWidth = startFromPrevious ? Math.max(1, xScale(prevCiUpper) - xScale(prevCiLower)) : 0

        const ciBar = group.append('rect')
          .attr('x', startFromPrevious ? xScale(prevCiLower) : xScale(0))
          .attr('y', barY + barHeight/2 - 0.5)
          .attr('width', startFromPrevious ? prevCiWidth : 0)
          .attr('height', 1)
          .style('fill', 'rgba(0, 0, 0, 0.6)')
          .style('pointer-events', 'none') // Allow events to pass through

        ciBar
          .transition()
          .duration(750)
          .ease(d3.easeQuadOut)
          .attr('x', xScale(bar.data.ci_lower))
          .attr('width', Math.max(1, xScale(bar.data.ci_upper) - xScale(bar.data.ci_lower)))


        // Responsive effect description
        group.append('text')
          .attr('x', width + (isMobile ? 5 : 10))
          .attr('y', barY + barHeight/2)
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', isMobile ? '9px' : '11px')
          .style('fill', '#374151')
          .style('opacity', 0)
          .text(`${bar.effect.includes('increase') ? '▲' : '—'} ${bar.effect}`)
          .transition()
          .delay(400)
          .duration(350)
          .style('opacity', 1)

        // Add invisible larger hitbox for better hover interaction
        const hitbox = group.append('rect')
          .attr('x', xScale(Math.min(bar.data.ci_lower, 0)) - 5)
          .attr('y', barY - 2)
          .attr('width', Math.max(60, xScale(Math.max(bar.data.ci_upper, 0)) - xScale(Math.min(bar.data.ci_lower, 0)) + 10))
          .attr('height', barHeight + 4)
          .style('fill', 'transparent')
          .style('cursor', 'pointer')
          .on("mouseover", function(event) {
            // Create tooltip using the same pattern as working charts
            const tooltip = d3.select("body").append("div")
              .attr("class", "d3-tooltip")
              .style("opacity", 0)
              .style("position", "absolute")
              .style("background", "rgba(0,0,0,0.8)")
              .style("color", "white")
              .style("padding", "10px")
              .style("border-radius", "5px")
              .style("pointer-events", "none")
              .style("font-family", "var(--font-secondary)")
              .style("font-size", "12px")
              .style("z-index", "1000");

            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            
            tooltip.html(formatTooltip(bar.data, categoryData.outcome))
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.selectAll(".d3-tooltip").remove();
          })
      })
    })

  }, [data, previousData, title, subtitle, maxValue, onOutcomeClick])


  return (
    <div className="ame-bar-chart-container" style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {/* Responsive effect size header with inline info button positioned over the SVG */}
      <div 
        className="treatment-effect-header"
        style={{
          position: 'absolute',
          left: `${chartDimensions.margin.left + chartDimensions.width + (isMobile ? 5 : 10)}px`,
          top: isMobile ? '80px' : '90px',
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 'bold',
          color: '#374151',
          fontFamily: 'Roboto Condensed, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}
      >
        Effect Size
        <span 
          className="info-button"
          onMouseEnter={() => setHoveredItem('effect-size-info')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          i
          {hoveredItem === 'effect-size-info' && (
            <div className="info-tooltip">
              <div><strong>Effect Size Mapping:</strong></div>
              <div>• Small: &lt;0.1 standard deviations</div>
              <div>• Moderate: 0.1-0.3 standard deviations</div>
              <div>• Large: &gt;0.3 standard deviations</div>
              <div>• No clear change: p-value ≥ 0.05</div>
            </div>
          )}
        </span>
      </div>

      {/* Y-axis info buttons positioned over the chart */}
      {data && onOutcomeClick && data.map((categoryData, index) => {
        const yPos = chartDimensions.margin.top + (index * (isMobile ? 60 : 80)) + (isMobile ? 30 : 40)
        const leftPos = chartDimensions.margin.left - (isMobile ? 25 : 30)
        
        return (
          <span
            key={`info-${index}`}
            className="info-button"
            style={{
              position: 'absolute',
              left: `${leftPos}px`,
              top: `${yPos}px`,
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation()
              onOutcomeClick(categoryData.outcome)
            }}
            onMouseEnter={() => setHoveredItem(`y-axis-${index}`)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            i
          </span>
        )
      })}
    </div>
  )
}

AMEBarChart.propTypes = {
  /** Array of chart data objects */
  data: PropTypes.array.isRequired,
  
  /** Previous wave data for comparison */
  previousData: PropTypes.array,
  
  /** Chart title */
  title: PropTypes.string,
  
  /** Chart subtitle */
  subtitle: PropTypes.string,
  
  /** Maximum value for chart scale */
  maxValue: PropTypes.number,
  
  /** Callback when outcome is clicked */
  onOutcomeClick: PropTypes.func
}

export default AMEBarChart