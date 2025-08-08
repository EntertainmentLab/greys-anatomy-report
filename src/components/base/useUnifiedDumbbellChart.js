import { useEffect } from 'react'
import * as d3 from 'd3'
import { COLOR_MAP, CONDITION_LABELS } from '../../constants'
import { smart as smartDomain, extractValues } from '../../utils/domainUtils'

/**
 * Unified dumbbell chart hook that handles both category-based and political party-based grouping
 */
export const useUnifiedDumbbellChart = ({
  svgRef,
  data,
  currentWave,
  previousData = null,
  groupBy = 'category', // 'category' or 'political_party'
  categoryFilter = null, // for policy charts that filter by category
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  yAxisItems,
  xDomain,
  calculateDifferences = true,
  onYAxisLabelClick = null
}) => {
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return
    }

    // Check if this is an update (for transitions) or initial render
    const svg = d3.select(svgRef.current)
    const isUpdate = svg.select('.chart-group').size() > 0

    // Only clear everything on initial render
    if (!isUpdate) {
      svg.selectAll('*').remove()
    }

    // Filter data for current wave and optional category
    let filteredData = data.filter(d => d.wave === currentWave)
    if (categoryFilter) {
      filteredData = filteredData.filter(d => d.category === categoryFilter)
    }

    if (filteredData.length === 0) return

    // Process data - calculate differences from control
    let chartData = []

    if (calculateDifferences) {
      const allWaves = [...new Set(data.map(d => d.wave))]
      const allWaveValues = []

      // Calculate global domain across all waves
      if (groupBy === 'category') {
        // Original logic for category grouping
        yAxisItems.forEach(item => {
          allWaves.forEach(wave => {
            const itemData = data.filter(d => d.category === item && d.wave === wave)
            const controlPoint = itemData.find(d => d.condition === 'control')

            if (controlPoint) {
              ['treatment', 'handoff'].forEach(condition => {
                const conditionPoint = itemData.find(d => d.condition === condition)
                if (conditionPoint) {
                  const difference = conditionPoint.mean - controlPoint.mean
                  allWaveValues.push(difference)
                }
              })
            }
          })
        })

        // Calculate differences for current wave
        yAxisItems.forEach(item => {
          const itemData = filteredData.filter(d => d.category === item)
          const controlPoint = itemData.find(d => d.condition === 'control')

          if (!controlPoint) return

          ['treatment', 'handoff'].forEach(condition => {
            const conditionPoint = itemData.find(d => d.condition === condition)
            if (conditionPoint) {
              const difference = conditionPoint.mean - controlPoint.mean
              const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2))

              chartData.push({
                ...conditionPoint,
                mean: difference,
                se: diffSE,
                category: item,
                originalMean: conditionPoint.mean,
                controlMean: controlPoint.mean
              })
            }
          })
        })
      } else if (groupBy === 'political_party') {
        // Logic for political party grouping
        const allCategories = [...new Set(data.map(d => d.category))]

        // Calculate differences for all waves and categories
        yAxisItems.forEach(party => {
          allWaves.forEach(wave => {
            allCategories.forEach(category => {
              const partyData = data.filter(d =>
                d.political_party === party &&
                d.wave === wave &&
                d.category === category
              )
              const controlPoint = partyData.find(d => d.condition === 'control')

              if (controlPoint) {
                ['treatment', 'handoff'].forEach(condition => {
                  const conditionPoint = partyData.find(d => d.condition === condition)
                  if (conditionPoint) {
                    const difference = conditionPoint.mean - controlPoint.mean
                    allWaveValues.push(difference)
                  }
                })
              }
            })
          })
        })

        // Calculate differences for current wave
        yAxisItems.forEach(party => {
          const partyData = filteredData.filter(d => d.political_party === party)
          const controlPoint = partyData.find(d => d.condition === 'control')

          if (!controlPoint) return

          ['treatment', 'handoff'].forEach(condition => {
            const conditionPoint = partyData.find(d => d.condition === condition)
            if (conditionPoint) {
              const difference = conditionPoint.mean - controlPoint.mean
              const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2))

              chartData.push({
                ...conditionPoint,
                mean: difference,
                se: diffSE,
                political_party: party,
                originalMean: conditionPoint.mean,
                controlMean: controlPoint.mean
              })
            }
          })
        })
      }

      // Set domain using global values
      if (allWaveValues.length > 0 && !xDomain) {
        xDomain = smartDomain(allWaveValues, { includeZero: true })
      }
    } else {
      chartData = filteredData.filter(d => d.condition !== 'control')
    }

    if (chartData.length === 0) return

    // Set up responsive dimensions
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width
    const isMobile = containerWidth <= 768

    const margin = {
      top: isMobile ? 120 : 130, // Increased to make room for legend under subtitle
      right: isMobile ? 80 : 100,
      bottom: isMobile ? 60 : 80, // Reduced since legend is no longer at bottom
      left: isMobile ? 140 : 180
    }

    const width = Math.max(400, containerWidth * 0.9) - margin.left - margin.right
    const height = Math.max(300, yAxisItems.length * (isMobile ? 65 : 75))

    // Set up scales
    let xMin, xMax
    if (xDomain) {
      [xMin, xMax] = xDomain
    } else {
      const allValues = extractValues(chartData, 'mean')
      const domain = smartDomain(allValues, { includeZero: calculateDifferences })
      ;[xMin, xMax] = domain
    }

    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(yAxisItems)
      .range([0, height])
      .padding(0.1)

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

    // Add static elements only on initial render
    if (!isUpdate) {
      // Add title
      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '18px' : '24px')
        .style('font-weight', 'bold')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('fill', '#1f2937')
        .text(title)

      // Add subtitle
      if (subtitle) {
        svg.append('text')
          .attr('class', 'chart-subtitle')
          .attr('x', (width + margin.left + margin.right) / 2)
          .attr('y', 55)
          .attr('text-anchor', 'middle')
          .style('font-size', isMobile ? '14px' : '16px')
          .style('font-style', 'italic')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('fill', '#6b7280')
          .text(subtitle)
      }

      // Add x-axis label
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '14px' : '16px')
        .style('font-weight', '600')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('fill', '#1f2937')
        .text(xAxisLabel)

      // Add y-axis label
      if (yAxisLabel) {
        g.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 20)
          .attr('x', 0 - (height / 2))
          .attr('text-anchor', 'middle')
          .style('font-size', isMobile ? '14px' : '16px')
          .style('font-weight', '600')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('fill', '#1f2937')
          .text(yAxisLabel)
      }

      // Add y-axis category labels
      yAxisItems.forEach(item => {
        const yPos = yScale(item) + yScale.bandwidth() / 2

        g.append('text')
          .attr('class', `y-label-${item.replace(/\s+/g, '-')}`)
          .attr('x', -10)
          .attr('y', yPos)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-size', isMobile ? '12px' : '14px')
          .style('font-weight', '500')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('fill', '#374151')
          .style('cursor', onYAxisLabelClick ? 'pointer' : 'default')
          .text(item)
          .on('click', () => {
            if (onYAxisLabelClick) {
              onYAxisLabelClick(item)
            }
          })
      })
    }

    // Update x-axis (always redraw to ensure consistent scaling with zero line)
    g.selectAll('.x-axis').remove()
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => {
        if (calculateDifferences) {
          if (d === 0) return '0'
          return d > 0 ? `+${d}` : `${d}`
        }
        return d
      }))
      .selectAll('text')
      .style('font-size', isMobile ? '12px' : '14px')
      .style('font-family', 'Roboto Condensed, sans-serif')
      .style('fill', '#374151')

    // Add zero reference line (always redraw since scales may change, draw before data elements)
    g.selectAll('.zero-line').remove()
    g.selectAll('.zero-label').remove()

    if (calculateDifferences && xMin <= 0 && xMax >= 0) {
      // Add "No change from control" label (rotated sideways, slightly to the left)
      const labelOffset = isMobile ? 8 : 10

      // Zero reference line
      g.append('line')
        .attr('x1', xScale(0))
        .attr('y1', 0)
        .attr('x2', xScale(0))
        .attr('y2', height)
        .attr('stroke', '#374151')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.7)

      g.append('text')
        .attr('class', 'zero-label')
        .attr('x', xScale(0) - labelOffset)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90, ${xScale(0) - labelOffset}, ${height / 2})`)
        .style('font-size', isMobile ? '10px' : '12px')
        .style('font-weight', '500')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('fill', '#6b7280')
        .style('pointer-events', 'none')
        .text('No change from control')
    }

    // Remove any existing tooltips to prevent duplicates
    d3.selectAll('.d3-tooltip').remove()

    // Clear existing data elements if updating
    if (isUpdate) {
      g.selectAll('.dumbbell-line').remove()
      g.selectAll('.dumbbell-dot').remove()
      g.selectAll('.dumbbell-label').remove()
    }

    // Helper function to find matching previous data point
    const findPreviousDataPoint = (itemOrParty, condition) => {
      if (!previousData || !calculateDifferences) return null

      if (groupBy === 'category') {
        // Find previous data for the same category and condition
        const prevCategoryData = previousData.filter(d => d.category === itemOrParty)
        const prevControlPoint = prevCategoryData.find(d => d.condition === 'control')
        const prevConditionPoint = prevCategoryData.find(d => d.condition === condition)

        if (!prevControlPoint || !prevConditionPoint) return null

        // Calculate previous difference
        const prevDifference = prevConditionPoint.mean - prevControlPoint.mean
        return { mean: prevDifference }
      } else if (groupBy === 'political_party') {
        // Find previous data for the same party, category, and condition
        const prevPartyData = previousData.filter(d =>
          d.political_party === itemOrParty &&
          d.category === categoryFilter
        )
        const prevControlPoint = prevPartyData.find(d => d.condition === 'control')
        const prevConditionPoint = prevPartyData.find(d => d.condition === condition)

        if (!prevControlPoint || !prevConditionPoint) return null

        // Calculate previous difference
        const prevDifference = prevConditionPoint.mean - prevControlPoint.mean
        return { mean: prevDifference }
      }

      return null
    }

    // Draw dumbbell chart with transitions
    const dodgeOffset = isMobile ? 6 : 8
    const transitionDuration = isUpdate ? 750 : 0

    yAxisItems.forEach(item => {
      const itemData = groupBy === 'category'
        ? chartData.filter(d => d.category === item)
        : chartData.filter(d => d.political_party === item)
      const yPos = yScale(item) + yScale.bandwidth() / 2

      // Draw lines from zero to each condition
      itemData.forEach(d => {
        const dotY = d.condition === 'treatment' ? yPos - dodgeOffset : yPos + dodgeOffset
        const prevData = findPreviousDataPoint(item, d.condition)
        const startFromPrevious = isUpdate && prevData && previousData
        const startX = startFromPrevious ? xScale(prevData.mean) : xScale(0)

        const line = g.append('line')
          .attr('class', 'dumbbell-line')
          .attr('x1', xScale(0))
          .attr('y1', dotY)
          .attr('x2', startX)
          .attr('y2', dotY)
          .attr('stroke', COLOR_MAP[d.condition])
          .attr('stroke-width', 3)
          .attr('opacity', 0.7)

        if (isUpdate) {
          line.transition()
            .duration(transitionDuration)
            .attr('x2', xScale(d.mean))
        }
      })

      // Draw dots
      itemData.forEach(d => {
        const dotY = d.condition === 'treatment' ? yPos - dodgeOffset : yPos + dodgeOffset
        const prevData = findPreviousDataPoint(item, d.condition)
        const startFromPrevious = isUpdate && prevData && previousData
        const startX = startFromPrevious ? xScale(prevData.mean) : xScale(d.mean)

        const circle = g.append('circle')
          .attr('class', 'dumbbell-dot')
          .attr('cx', startX)
          .attr('cy', dotY)
          .attr('r', isMobile ? 7 : 9)
          .attr('fill', COLOR_MAP[d.condition])
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            // Create tooltip inside event handler - same pattern as AME charts
            const tooltip = d3.select("body").append("div")
              .attr("class", "d3-tooltip")
              .style("opacity", 0)
              .style("position", "absolute")
              .style("background", "rgba(0,0,0,0.8)")
              .style("color", "white")
              .style("padding", "10px")
              .style("border-radius", "5px")
              .style("pointer-events", "none")
              .style("font-family", "Roboto Condensed, sans-serif")
              .style("font-size", "12px")
              .style("z-index", "1000")

            tooltip.transition().duration(200).style('opacity', .9)

            let tooltipContent = `${CONDITION_LABELS[d.condition]}\n`
            tooltipContent += `${groupBy === 'category' ? d.category : d.political_party}\n`

            if (calculateDifferences) {
              const valueText = d.mean >= 0 ? `+${d.mean.toFixed(0)}` : d.mean.toFixed(0).toString()
              tooltipContent += `Difference: ${valueText}\n`
              if (d.originalMean !== undefined) {
                tooltipContent += `Treatment: ${d.originalMean.toFixed(1)}\n`
                tooltipContent += `Control: ${d.controlMean.toFixed(1)}\n`
              }
            } else {
              tooltipContent += `Value: ${d.mean.toFixed(3)}\n`
            }

            tooltipContent += `N = ${d.n}`

            tooltip.html(tooltipContent.replace(/\n/g, '<br/>'))
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
          })
          .on('mouseout', function() {
            d3.selectAll('.d3-tooltip').remove()
          })

        if (isUpdate) {
          circle.transition()
            .duration(transitionDuration)
            .attr('cx', xScale(d.mean))
        }

        // Add value label
        const labelOffset = 18
        const labelX = xScale(d.mean) + (d.mean >= 0 ? labelOffset : -labelOffset)
        const valueText = d.mean >= 0 ? `+${Math.round(d.mean)}` : Math.round(d.mean).toString()

        const prevLabelX = startFromPrevious ?
          (xScale(prevData.mean) + (prevData.mean >= 0 ? labelOffset : -labelOffset)) :
          labelX
        const prevTextAnchor = startFromPrevious ?
          (prevData.mean >= 0 ? 'start' : 'end') :
          (d.mean >= 0 ? 'start' : 'end')

        const label = g.append('text')
          .attr('class', 'dumbbell-label')
          .attr('x', isUpdate ? prevLabelX : labelX)
          .attr('y', dotY)
          .attr('text-anchor', isUpdate ? prevTextAnchor : (d.mean >= 0 ? 'start' : 'end'))
          .attr('dominant-baseline', 'middle')
          .style('font-size', isMobile ? '12px' : '14px')
          .style('font-weight', '600')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('fill', COLOR_MAP[d.condition])
          .style('opacity', 1)
          .text(valueText)

        if (isUpdate) {
          label.transition()
            .duration(transitionDuration)
            .attr('x', labelX)
            .attr('text-anchor', d.mean >= 0 ? 'start' : 'end')
        }
      })
    })

    // Add legend only on initial render
    if (!isUpdate) {
      const legendData = [
        { label: CONDITION_LABELS.treatment, color: COLOR_MAP.treatment },
        { label: CONDITION_LABELS.handoff, color: COLOR_MAP.handoff }
      ]

      const legend = svg.append('g')
        .attr('class', 'chart-legend')
        .attr('transform', `translate(${margin.left + width / 2}, ${subtitle ? 80 : 60})`)

      const legendItemWidth = isMobile ? 140 : 180
      const startX = -legendItemWidth

      legendData.forEach((d, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(${startX + (i * legendItemWidth)}, 0)`)

        legendItem.append('circle')
          .attr('cx', 10)
          .attr('cy', 0)
          .attr('r', 8)
          .attr('fill', d.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)

        legendItem.append('text')
          .attr('x', 25)
          .attr('y', 0)
          .attr('dominant-baseline', 'middle')
          .style('font-size', isMobile ? '12px' : '14px')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('fill', '#374151')
          .text(d.label)
      })
    }


  }, [data, currentWave, previousData, groupBy, categoryFilter, title, subtitle, xAxisLabel, yAxisLabel, yAxisItems, xDomain, calculateDifferences, onYAxisLabelClick])
}
