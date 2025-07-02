import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import '../../styles/components/Chart-Likert.css'

function LikertChart({ 
  data, 
  categories, 
  items, 
  conditions, 
  title, 
  subtitle, 
  currentWave, 
  waveLabels,
  className = "chart-container" 
}) {
  const svgRef = useRef()

  // Helper function to wrap text
  const wrapText = (text, width, lineHeight = 1.2) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      if (testLine.length * 3 < width) { // Approximate character width
        currentLine = testLine
      } else {
        lines.push(currentLine)
        currentLine = words[i]
      }
    }
    lines.push(currentLine)
    return lines
  }

  useEffect(() => {
    if (!data || data.length === 0) return

    const filteredData = data.filter(d => d.wave === currentWave)
    if (filteredData.length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set up dimensions
    const margin = { top: 120, right: 40, bottom: 80, left: 60 }
    const width = 700 - margin.left - margin.right
    const height = 500 - margin.bottom - margin.top

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create faceted layout
    const facetWidth = width / items.length
    const barWidth = 25
    const barSpacing = 4
    const facetPadding = 20

    const yScale = d3.scaleLinear()
      .domain([-60, 60])
      .range([height - 60, -20])

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(`${title} (${waveLabels[currentWave]})`)

    // Add wrapped subtitle
    if (subtitle) {
      const words = subtitle.split(' ')
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
      const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')

      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-style", "italic")
        .style("fill", "#666")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(line1)

      svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-style", "italic")
        .style("fill", "#666")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(line2)
    }

    // Create bars for each response category
    // Determine order for visual display
    // We want: [extremely, very, moderately, little, not] from top to bottom
    // Find the indices of these categories in the provided categories array
    const extremelyIndex = categories.findIndex(c => c.key.includes('extremely') || c.key.includes('great_deal'));
    const veryIndex = categories.findIndex(c => c.key.includes('very') || c.key.includes('quite'));
    const moderatelyIndex = categories.findIndex(c => c.key.includes('moderate'));
    const littleIndex = categories.findIndex(c => c.key.includes('little'));
    const notIndex = categories.findIndex(c => c.key.includes('not'));
    
    // Create a map of visual order to use in stacking logic
    const categoryOrderMap = new Map();
    categoryOrderMap.set(extremelyIndex, 0); // extremely worried - top
    categoryOrderMap.set(veryIndex, 1);      // very worried
    categoryOrderMap.set(moderatelyIndex, 2); // moderately worried
    categoryOrderMap.set(littleIndex, 3);    // little worried  
    categoryOrderMap.set(notIndex, 4);       // not worried - bottom
    
    categories.forEach(category => {
      const bars = []
      
      items.forEach((item, itemIndex) => {
        conditions.forEach((condition, conditionIndex) => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && d[item.dataKey] === item.value
          )
          
          if (dataPoint) {
            const value = dataPoint[category.key] || 0
            let start = 0
            
            // Get the visual order position (0-4) for this category
            const categoryIndex = categories.findIndex(cat => cat.key === category.key);
            const visualOrder = categoryOrderMap.get(categoryIndex);
            
            // Calculate stacking based on visual order
            if (visualOrder === 0) {
              // Extremely worried - starts after very worried (swap position with very worried)
              start = dataPoint[categories[veryIndex].key] || 0;
            } else if (visualOrder === 1) {
              // Very worried - starts at 0 (swap position with extremely worried)
              start = 0;
            } else if (visualOrder === 2) {
              // Moderately worried - starts at zero going down
              start = 0;
            } else if (visualOrder === 3) {
              // Little worried - stacks after moderately going down
              start = -(dataPoint[categories[moderatelyIndex].key] || 0);
            } else if (visualOrder === 4) {
              // Not worried - stacks at the bottom
              start = -((dataPoint[categories[moderatelyIndex].key] || 0) + 
                      (dataPoint[categories[littleIndex].key] || 0));
            }
            
            // For categories below middle (moderately), values are negative
            if (visualOrder >= 2) {
              start = start - value;
            }
            
            // Calculate x position for faceted layout with spacing
            const facetStart = itemIndex * facetWidth + facetPadding
            const totalBarsWidth = conditions.length * barWidth + (conditions.length - 1) * barSpacing
            const groupStart = facetStart + (facetWidth - 2 * facetPadding - totalBarsWidth) / 2
            const xPos = groupStart + conditionIndex * (barWidth + barSpacing)
            
            bars.push({
              item: item.label,
              condition,
              start,
              end: start + value,
              value,
              category: category.label,
              xPos,
              itemIndex,
              conditionIndex
            })
          }
        })
      })
      
      // Draw bars for this category with appropriate styling
      g.selectAll(`.bar-${category.key}`)
        .data(bars)
        .enter()
        .append("rect")
        .attr("class", `bar-${category.key}`)
        .attr("x", d => d.xPos)
        .attr("y", d => yScale(Math.max(d.start, d.end)))
        .attr("width", barWidth)
        .attr("height", d => Math.abs(yScale(d.start) - yScale(d.end)))
        .attr("fill", category.color)
        .attr("stroke", "none")
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
          
          tooltip.html(`<strong>${d.category}</strong><br/>${d.item} - ${d.condition}: ${d.value.toFixed(1)}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove()
        })
    })

    // Add reference line at y=0
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "rgba(128, 128, 128, 0.6)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    // Add item labels with text wrapping
    items.forEach((item, index) => {
      const facetStart = index * facetWidth + facetPadding
      const facetCenter = facetStart + (facetWidth - 2 * facetPadding) / 2
      const maxWidth = facetWidth - 2 * facetPadding
      
      const lines = wrapText(item.label, maxWidth)
      
      lines.forEach((line, lineIndex) => {
        g.append("text")
          .attr("x", facetCenter)
          .attr("y", -25 + (lineIndex * 12))
          .attr("text-anchor", "middle")
          .style("font-weight", "bold")
          .style("font-size", "11px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .text(line)
      })
    })

    // Add condition labels
    items.forEach((item, itemIndex) => {
      conditions.forEach((condition, conditionIndex) => {
        const facetStart = itemIndex * facetWidth + facetPadding
        const totalBarsWidth = conditions.length * barWidth + (conditions.length - 1) * barSpacing
        const groupStart = facetStart + (facetWidth - 2 * facetPadding - totalBarsWidth) / 2
        const xPos = groupStart + conditionIndex * (barWidth + barSpacing) + barWidth / 2
        
        g.append("text")
          .attr("x", xPos)
          .attr("y", height + 15)
          .attr("text-anchor", "middle")
          .attr("transform", `rotate(-45, ${xPos}, ${height + 15})`)
          .style("font-size", "9px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .text(condition)
        
        // Add labels on top of bars for the sum of the first two categories (most positive responses)
        const dataPoint = filteredData.find(d => 
          d.condition === condition && d[item.dataKey] === item.value
        )
        
        if (dataPoint) {
          // Find the "extremely" and "very" categories for the top label
          const extremelyValue = dataPoint[categories[extremelyIndex].key] || 0;
          const veryValue = dataPoint[categories[veryIndex].key] || 0;
          const topValue = extremelyValue + veryValue;
          
          // Position the label at the top of the stacked values
          // Since very worried is now at the bottom, and extremely worried is on top
          const topPosition = topValue;
          
          g.append("text")
            .attr("x", xPos)
            .attr("y", yScale(topPosition) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "#196bc1")
            .style("font-weight", "bold")
            .style("font-family", "Roboto Condensed, sans-serif")
            .text(`${topValue.toFixed(1)}%`)
        }
      })
    })

    // Add legend - centered
    const legendWidth = categories.length * 120
    const legendStartX = (width + margin.left + margin.right - legendWidth) / 2
    
    const legend = svg.append("g")
      .attr("transform", `translate(${legendStartX}, ${height + margin.top + 50})`)

    categories.forEach((category, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 120}, 0)`)

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", category.color)

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "11px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(category.label)
    })

  }, [data, categories, items, conditions, title, subtitle, currentWave, waveLabels])

  return (
    <div className={className}>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default LikertChart
