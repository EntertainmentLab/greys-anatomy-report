import { useEffect } from 'react'
import * as d3 from 'd3'
import { COLOR_MAP, CONDITION_LABELS } from '../../constants'
import { smart as smartDomain, extractValues } from '../../utils/domainUtils'

/**
 * Unified bar chart hook that replaces dumbbell charts with bars + error bars
 * Uses the same data processing as useUnifiedDumbbellChart but renders as bars
 */
export const useUnifiedBarChart = ({
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

    // Clear previous chart
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

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
        // Calculate differences for all waves to get consistent domain
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
                controlMean: controlPoint.mean,
                type: condition,
                color: condition === 'treatment' ? '#86efac' : '#16a34a' // Same colors as AME charts
              })
            }
          })
        })
      } else if (groupBy === 'political_party') {
        // Logic for political party grouping
        const allCategories = [...new Set(data.map(d => d.category))]

        yAxisItems.forEach(party => {
          allWaves.forEach(wave => {
            allCategories.forEach(category => {
              const itemData = data.filter(d => d.political_party === party && d.wave === wave && d.category === category)
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
        })

        // Calculate differences for current wave
        yAxisItems.forEach(party => {
          const partyData = filteredData.filter(d => d.political_party === party)
          
          if (categoryFilter) {
            const itemData = partyData.filter(d => d.category === categoryFilter)
            const controlPoint = itemData.find(d => d.condition === 'control')

            if (controlPoint) {
              ['treatment', 'handoff'].forEach(condition => {
                const conditionPoint = itemData.find(d => d.condition === condition)
                if (conditionPoint) {
                  const difference = conditionPoint.mean - controlPoint.mean
                  const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2))

                  chartData.push({
                    ...conditionPoint,
                    mean: difference,
                    se: diffSE,
                    political_party: party,
                    originalMean: conditionPoint.mean,
                    controlMean: controlPoint.mean,
                    type: condition,
                    color: condition === 'treatment' ? '#86efac' : '#16a34a' // Same colors as AME charts
                  })
                }
              })
            }
          }
        })
      }

      // Use provided domain or calculate from data
      const domain = xDomain || smartDomain(allWaveValues)
      
      // Set up dimensions
      const containerElement = svgRef.current.parentElement
      const containerWidth = containerElement ? containerElement.getBoundingClientRect().width : 1000
      const isMobile = containerWidth <= 768
      
      const margin = { 
        top: isMobile ? 80 : 100, 
        right: isMobile ? 40 : 60, 
        bottom: isMobile ? 80 : 100, 
        left: isMobile ? 200 : 250 
      }
      
      const width = Math.max(400, containerWidth - margin.left - margin.right)
      const height = Math.max(300, yAxisItems.length * (isMobile ? 80 : 100))

      // Set SVG dimensions
      svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

      // Create main group
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Add title
      svg.append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', isMobile ? 20 : 25)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '16px' : '20px')
        .style('font-weight', 'bold')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('fill', '#374151')
        .text(title)

      // Add subtitle
      if (subtitle) {
        svg.append('text')
          .attr('x', (width + margin.left + margin.right) / 2)
          .attr('y', isMobile ? 45 : 50)
          .attr('text-anchor', 'middle')
          .style('font-size', isMobile ? '12px' : '14px')
          .style('font-style', 'italic')
          .style('fill', '#6b7280')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .text(subtitle)
      }

      // Create scales
      const xScale = d3.scaleLinear()
        .domain(domain)
        .range([0, width])

      const yScale = d3.scaleBand()
        .domain(yAxisItems)
        .range([0, height])
        .paddingInner(0.3)
        .paddingOuter(0.1)

      // Add dotted zero line with label
      const zeroX = xScale(0)
      
      // Zero line
      g.append('line')
        .attr('x1', zeroX)
        .attr('x2', zeroX)
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', '#6b7280')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5')
        .style('opacity', 0.8)

      // Zero line label
      g.append('text')
        .attr('x', zeroX)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '10px' : '12px')
        .style('font-weight', '500')
        .style('fill', '#6b7280')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .text('No change from control')

      // Add X axis
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('.1f'))

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', isMobile ? '10px' : '12px')
        .style('fill', '#374151')

      // Add X axis label
      if (xAxisLabel) {
        g.append('text')
          .attr('x', width / 2)
          .attr('y', height + (isMobile ? 50 : 60))
          .attr('text-anchor', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', isMobile ? '12px' : '14px')
          .style('fill', '#374151')
          .text(xAxisLabel)
      }

      // Add Y axis labels
      const yAxisGroup = g.append('g').attr('class', 'y-axis')

      yAxisItems.forEach(item => {
        const yPos = yScale(item) + yScale.bandwidth() / 2
        
        yAxisGroup.append('text')
          .attr('x', -15)
          .attr('y', yPos)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'Roboto Condensed, sans-serif')
          .style('font-size', isMobile ? '11px' : '13px')
          .style('font-weight', '600')
          .style('fill', '#374151')
          .style('cursor', onYAxisLabelClick ? 'pointer' : 'default')
          .text(item)
          .on('click', onYAxisLabelClick ? () => onYAxisLabelClick(item) : null)
      })

      // Group data by category/political party
      const groupedData = {}
      chartData.forEach(d => {
        const key = groupBy === 'category' ? d.category : d.political_party
        if (!groupedData[key]) groupedData[key] = []
        groupedData[key].push(d)
      })

      // Create chart bars for each group
      Object.keys(groupedData).forEach(key => {
        const groupData = groupedData[key]
        const yPos = yScale(key)
        const barHeight = Math.min(20, yScale.bandwidth() / 3)
        const barSpacing = 4
        const totalHeight = (barHeight * groupData.length) + (barSpacing * (groupData.length - 1))
        const startY = yPos + (yScale.bandwidth() - totalHeight) / 2

        groupData.forEach((d, i) => {
          const barY = startY + (i * (barHeight + barSpacing))
          const barStart = Math.min(0, d.mean)
          const barEnd = Math.max(0, d.mean)
          const barWidth = Math.abs(xScale(barEnd) - xScale(barStart))
          const barX = xScale(barStart)

          // Create bar
          const bar = g.append('rect')
            .attr('x', barX)
            .attr('y', barY)
            .attr('width', barWidth)
            .attr('height', barHeight)
            .style('fill', d.color)
            .style('opacity', 0.8)
            .style('cursor', 'pointer')

          // Add error bars
          const errorBarLength = 1.96 * d.se // 95% confidence interval
          const ciLower = d.mean - errorBarLength
          const ciUpper = d.mean + errorBarLength

          // Error bar line
          g.append('line')
            .attr('x1', xScale(ciLower))
            .attr('x2', xScale(ciUpper))
            .attr('y1', barY + barHeight / 2)
            .attr('y2', barY + barHeight / 2)
            .style('stroke', '#374151')
            .style('stroke-width', 1.5)

          // Error bar caps
          g.append('line')
            .attr('x1', xScale(ciLower))
            .attr('x2', xScale(ciLower))
            .attr('y1', barY + 2)
            .attr('y2', barY + barHeight - 2)
            .style('stroke', '#374151')
            .style('stroke-width', 1.5)

          g.append('line')
            .attr('x1', xScale(ciUpper))
            .attr('x2', xScale(ciUpper))
            .attr('y1', barY + 2)
            .attr('y2', barY + barHeight - 2)
            .style('stroke', '#374151')
            .style('stroke-width', 1.5)

          // Add tooltip
          bar.on('mouseover', function(event) {
            const tooltip = d3.select('body').append('div')
              .attr('class', 'd3-tooltip')
              .style('opacity', 0)
              .style('position', 'absolute')
              .style('background', 'rgba(0,0,0,0.8)')
              .style('color', 'white')
              .style('padding', '10px')
              .style('border-radius', '5px')
              .style('pointer-events', 'none')
              .style('font-family', 'Roboto Condensed, sans-serif')
              .style('font-size', '12px')
              .style('z-index', '1000')

            tooltip.transition()
              .duration(200)
              .style('opacity', .9)
            
            const conditionLabel = d.type === 'treatment' ? CONDITION_LABELS.treatment : CONDITION_LABELS.handoff
            const tooltipContent = `<strong>${conditionLabel}</strong><br/>
Difference: ${d.mean.toFixed(2)}<br/>
95% CI: [${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}]<br/>
Standard Error: ${d.se.toFixed(3)}`
            
            tooltip.html(tooltipContent)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px')
          })
          .on('mouseout', function() {
            d3.selectAll('.d3-tooltip').remove()
          })
        })
      })

      // Add legend
      const legendData = [
        { label: CONDITION_LABELS.treatment, color: '#86efac', type: 'treatment' },
        { label: CONDITION_LABELS.handoff, color: '#16a34a', type: 'handoff' }
      ]

      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width / 2}, ${height + (isMobile ? 70 : 80)})`)

      const legendItemWidth = isMobile ? 120 : 160
      const totalLegendWidth = legendData.length * legendItemWidth
      const startX = -totalLegendWidth / 2

      const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${startX + (i * legendItemWidth)}, 0)`)

      legendItems.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', isMobile ? 16 : 20)
        .attr('height', isMobile ? 12 : 16)
        .style('fill', d => d.color)
        .style('stroke', '#374151')
        .style('stroke-width', 1)

      legendItems.append('text')
        .attr('x', isMobile ? 22 : 28)
        .attr('y', isMobile ? 9 : 11)
        .style('font-family', 'Roboto Condensed, sans-serif')
        .style('font-size', isMobile ? '10px' : '11px')
        .style('fill', '#374151')
        .style('dominant-baseline', 'middle')
        .text(d => d.label)
    }

  }, [data, currentWave, groupBy, categoryFilter, title, subtitle, xAxisLabel, yAxisLabel, yAxisItems, xDomain, calculateDifferences, onYAxisLabelClick])
}