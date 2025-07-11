import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { getBarColor, formatTooltip, getEffectSize } from '../../utils/ameChartUtils'
import { COLOR_MAP, CONDITION_LABELS } from '../../constants'

const AMEBarChart = ({ 
  data, 
  title, 
  subtitle, 
  maxValue = 0.8, 
  onOutcomeClick = null 
}) => {
  const svgRef = useRef()
  const [isInitialized, setIsInitialized] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  // Text wrapping utility function
  const wrapText = (text, maxWidth, fontSize = 12) => {
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

    // Group data by outcome categories
    const groupedData = data.map(outcome => {
      const bars = []
      if (outcome.treatment) {
        const effect = getEffectSize(outcome.treatment.estimate, outcome.treatment.sig, outcome.treatment.p_value_fdr)
        bars.push({
          type: 'treatment',
          label: CONDITION_LABELS.treatment,
          color: getBarColor(outcome.treatment.estimate, outcome.treatment.sig, effect),
          data: outcome.treatment,
          effect: effect
        })
      }
      if (outcome.handoff) {
        const effect = getEffectSize(outcome.handoff.estimate, outcome.handoff.sig, outcome.handoff.p_value_fdr)
        bars.push({
          type: 'handoff',
          label: CONDITION_LABELS.handoff,
          color: getBarColor(outcome.handoff.estimate, outcome.handoff.sig, effect),
          data: outcome.handoff,
          effect: effect
        })
      }
      return {
        outcome: outcome.outcome,
        bars: bars
      }
    })

    const margin = { top: 80, right: 120, bottom: 120, left: 280 }
    const categoryHeight = 80
    const width = 820 - margin.left - margin.right
    const height = groupedData.length * categoryHeight

    // Scales
    const xScale = d3.scaleLinear()
      .domain([-0.2, maxValue])
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

    // Create or select main group
    let g = svg.select('.chart-group')
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'chart-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
    }

    // Create tooltip if it doesn't exist
    let tooltip = d3.select('body').select('.ame-tooltip')
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'ame-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('white-space', 'pre-line')
        .style('pointer-events', 'none')
        .style('z-index', 1000)
    }

    // Update title
    let titleText = svg.select('.chart-title')
    if (titleText.empty()) {
      titleText = svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
    }
    titleText.text(title)

    // Update subtitle
    svg.selectAll('.chart-subtitle').remove()
    const wrappedSubtitle = wrapText(subtitle, 500, 14)
    wrappedSubtitle.forEach((line, lineIndex) => {
      svg.append('text')
        .attr('class', 'chart-subtitle')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', 45 + (lineIndex * 16))
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .text(line)
    })

    // Add static elements only if they don't exist
    if (g.select('.x-axis').empty()) {
      // X-axis
      const xAxis = d3.axisBottom(xScale)
        .tickValues([-0.2, 0, 0.2, 0.4, 0.6, 0.8])
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
        .style('font-size', '12px')
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
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', '14px')
        .style('fill', '#374151')
        .text('Standardized Treatment Effect')

      // Effect size header is now handled by HTML overlay

      // Legend with shapes
      const legendData = [
        { label: CONDITION_LABELS.treatment, shape: 'circle', type: 'treatment' },
        { label: CONDITION_LABELS.handoff, shape: 'triangle', type: 'handoff' }
      ]

      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width / 2}, ${height + 70})`)

      const legendItemWidth = 150
      const totalLegendWidth = legendData.length * legendItemWidth
      const startX = -totalLegendWidth / 2

      const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${startX + (i * legendItemWidth)}, 0)`)

      // Add shapes to legend
      legendItems.each(function(d) {
        const group = d3.select(this)
        if (d.shape === 'circle') {
          group.append('circle')
            .attr('cx', 8)
            .attr('cy', 8)
            .attr('r', 6)
            .style('fill', 'white')
            .style('stroke', '#000000')
            .style('stroke-width', 1)
        } else {
          group.append('path')
            .attr('d', d3.symbol().type(d3.symbolTriangle).size(64))
            .attr('transform', 'translate(8, 8)')
            .style('fill', 'white')
            .style('stroke', '#000000')
            .style('stroke-width', 1)
        }
      })

      legendItems.append('text')
        .attr('x', 25)
        .attr('y', 12)
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', '12px')
        .style('fill', '#374151')
        .text(d => d.label)
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

    // Add category labels
    categoryGroups.each(function(d) {
      const group = d3.select(this)
      const wrappedLines = wrapText(d.outcome, 220, 14)
      const lineHeight = 16
      const totalHeight = wrappedLines.length * lineHeight
      const startY = (yScale.bandwidth() - totalHeight) / 2 + lineHeight

      wrappedLines.forEach((line, lineIndex) => {
        group.append('text')
          .attr('x', -50)
          .attr('y', startY + (lineIndex * lineHeight))
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', '14px')
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

      // Add info buttons
      if (onOutcomeClick) {
        group.append('circle')
          .attr('cx', -20)
          .attr('cy', yScale.bandwidth() / 2)
          .attr('r', 8)
          .style('fill', '#3b82f6')
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation()
            onOutcomeClick(d.outcome)
          })

        group.append('text')
          .attr('x', -20)
          .attr('y', yScale.bandwidth() / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('fill', 'white')
          .style('cursor', 'pointer')
          .style('pointer-events', 'none')
          .text('i')
      }
    })

    // Add bars with smooth animations
    categoryGroups.each(function(categoryData) {
      const group = d3.select(this)
      const barCount = categoryData.bars.length
      const barHeight = 20
      const barSpacing = 4
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

        // Effect bar with smooth animation from current position
        const barStart = Math.min(0, bar.data.estimate)
        const barEnd = Math.max(0, bar.data.estimate)
        const barWidth = Math.max(2, xScale(barEnd) - xScale(barStart))

        const effectBar = group.append('rect')
          .attr('x', isUpdate ? xScale(barStart) : xScale(0))  // Start from current position if update
          .attr('y', barY)
          .attr('width', isUpdate ? barWidth : 0)  // Start from current width if update
          .attr('height', barHeight)
          .style('fill', bar.color)
          .style('cursor', 'pointer')

        // Animate to final position
        effectBar
          .transition()
          .duration(750)
          .ease(d3.easeQuadOut)
          .attr('x', xScale(barStart))
          .attr('width', barWidth)

        // Confidence interval
        const ciBar = group.append('rect')
          .attr('x', isUpdate ? xScale(bar.data.ci_lower) : xScale(0))
          .attr('y', barY + barHeight/2 - 0.5)
          .attr('width', isUpdate ? Math.max(1, xScale(bar.data.ci_upper) - xScale(bar.data.ci_lower)) : 0)
          .attr('height', 1)
          .style('fill', 'rgba(0, 0, 0, 0.6)')

        ciBar
          .transition()
          .duration(750)
          .ease(d3.easeQuadOut)
          .attr('x', xScale(bar.data.ci_lower))
          .attr('width', Math.max(1, xScale(bar.data.ci_upper) - xScale(bar.data.ci_lower)))

        // Shape at bar tip (circle for treatment, triangle for handoff)
        if (bar.type === 'treatment') {
          const shape = group.append('circle')
            .attr('cx', isUpdate ? xScale(bar.data.estimate) : xScale(0))
            .attr('cy', barY + barHeight/2)
            .attr('r', 4)
            .style('fill', 'white')
            .style('stroke', '#000000')
            .style('stroke-width', 1)
            
          shape
            .transition()
            .duration(750)
            .ease(d3.easeQuadOut)
            .attr('cx', xScale(bar.data.estimate))
        } else {
          // Triangle for handoff
          const shape = group.append('path')
            .attr('d', d3.symbol().type(d3.symbolTriangle).size(32))
            .attr('transform', `translate(${isUpdate ? xScale(bar.data.estimate) : xScale(0)}, ${barY + barHeight/2})`)
            .style('fill', 'white')
            .style('stroke', '#000000')
            .style('stroke-width', 1)
            
          shape
            .transition()
            .duration(750)
            .ease(d3.easeQuadOut)
            .attr('transform', `translate(${xScale(bar.data.estimate)}, ${barY + barHeight/2})`)
        }

        // Effect description
        group.append('text')
          .attr('x', width + 10)
          .attr('y', barY + barHeight/2)
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', '11px')
          .style('fill', '#374151')
          .style('opacity', 0)
          .text(`${bar.effect.includes('increase') ? '▲' : '—'} ${bar.effect}`)
          .transition()
          .delay(400)
          .duration(350)
          .style('opacity', 1)

        // Add hover effects
        effectBar
          .on('mouseover', function(event) {
            tooltip.transition().duration(200).style('opacity', .9)
            tooltip.html(formatTooltip(bar.data, categoryData.outcome))
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px')
          })
          .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px')
          })
          .on('mouseout', function() {
            tooltip.transition().duration(500).style('opacity', 0)
          })
      })
    })

  }, [data, title, subtitle, maxValue, onOutcomeClick, isInitialized])

  return (
    <div className="ame-bar-chart-container" style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {/* Effect size header with inline info button positioned over the SVG */}
      <div 
        className="treatment-effect-header"
        style={{
          position: 'absolute',
          right: '50px',
          top: '70px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#374151',
          fontFamily: 'Roboto Condensed, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        Effect Size
        <span 
          className="info-button"
          onMouseEnter={() => setHoveredItem('effect-size-info')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          ⓘ
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
    </div>
  )
}

export default AMEBarChart