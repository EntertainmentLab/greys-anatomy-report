import { useEffect } from 'react'
import * as d3 from 'd3'
import { COLOR_MAP, WAVE_LABELS } from '../../constants'
import { smart as smartDomain, extractValues } from '../../utils/domainUtils'

export const useTemporalChart = ({
  svgRef,
  data,
  title,
  subtitle,
  yAxisLabel,
  currentPoliticalParty,
  conditions,
  waveMapping,
  yDomain,
  tooltipUnit = "years", // Default to "years" for backwards compatibility
  showErrorBars = true // Default to show error bars for backwards compatibility
}) => {
  useEffect(() => {
    if (!data || data.length === 0) {
      console.log("No temporal chart data available");
      return;
    }

    console.log("Rendering temporal chart with data:", data.slice(0, 3));

    const renderChart = () => {
      // Ensure SVG ref exists
      if (!svgRef.current || !svgRef.current.parentNode) {
        return;
      }

      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();

      // Filter to only show Overall data
      const filteredData = data.filter(d => d.political_party === 'Overall');
      
      if (filteredData.length === 0) {
        return;
      }

      // Simplified responsive dimensions
      const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width || 800;
      const isMobile = containerWidth <= 768;
      const isSmallMobile = containerWidth <= 480;
    
      const margin = {
        top: isMobile ? 120 : 140, // Increased to make room for legend under subtitle
        right: isMobile ? 30 : 50,
        bottom: isMobile ? 60 : 80, // Reduced since legend is no longer at bottom
        left: isMobile ? 50 : 70
      };
      
      // Simplified width calculation - use 90% of container width
      const width = Math.max(300, containerWidth * 0.9) - margin.left - margin.right;
      const height = (isMobile ? 400 : 500) - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add responsive title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", isMobile ? 20 : 25)
      .attr("text-anchor", "middle")
      .style("font-size", isSmallMobile ? "16px" : isMobile ? "18px" : "24px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(title);

    // Add responsive subtitle with text wrapping for mobile
    const subtitleText = svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", isMobile ? 45 : 60)
      .attr("text-anchor", "middle")
      .style("font-size", isSmallMobile ? "12px" : isMobile ? "14px" : "16px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif");
    
    if (isMobile && subtitle.length > 50) {
      // Wrap subtitle on mobile
      const words = subtitle.split(' ');
      let line = '';
      let lineNumber = 0;
      const maxLineLength = isSmallMobile ? 30 : 40;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        if (testLine.length > maxLineLength && line !== '') {
          subtitleText.append('tspan')
            .attr('x', (width + margin.left + margin.right) / 2)
            .attr('dy', lineNumber === 0 ? '0em' : '1.1em')
            .text(line.trim());
          line = word + ' ';
          lineNumber++;
        } else {
          line = testLine;
        }
      });
      
      if (line !== '') {
        subtitleText.append('tspan')
          .attr('x', (width + margin.left + margin.right) / 2)
          .attr('dy', lineNumber === 0 ? '0em' : '1.1em')
          .text(line.trim());
      }
    } else {
      subtitleText.text(subtitle);
    }

    // Create x-scale for waves - add extra points for time passage indicators
    const allTimepoints = [1, 2, 4, 5, 3]; // Include points 4 and 5 for tick marks
    const xScale = d3.scalePoint()
      .domain(allTimepoints)
      .range([0, width])
      .padding(0.1);

    // Calculate y-domain based on the actual filtered data with sensible padding
    let yMin, yMax;
    if (yDomain) {
      [yMin, yMax] = yDomain;
    } else {
      const allMeans = extractValues(filteredData, 'mean');
      console.log("All means from filtered data:", allMeans);
      
      // Use smart domain calculation with special handling for temporal data
      const domain = smartDomain(allMeans, { 
        includeZero: false, // Temporal charts don't need to include zero
        paddingPercent: 0.1,
        minPadding: 0.01
      });
      [yMin, yMax] = domain;
      
      console.log("Calculated yMin:", yMin, "yMax:", yMax);
    }

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Add axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          return waveMapping[d] || d;
        }));

    // Style x-axis text with responsive sizing
    xAxis.selectAll("text")
      .style("font-size", isSmallMobile ? "11px" : isMobile ? "13px" : "16px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("text-anchor", "middle")
      .each(function(d) {
        const text = d3.select(this);
        
        // Create complete timepoint mapping including intermediate points
        const completeWaveMapping = {
          ...waveMapping,
          4: "5 Days", // Add intermediate timepoint
          5: "10 Days"  // Add intermediate timepoint
        };
        
        // Only show text for points that have labels
        if (completeWaveMapping[d]) {
          const lines = completeWaveMapping[d].split('\n');
          text.text('');
          lines.forEach((line, i) => {
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', i === 0 ? '0.8em' : '1em')
              .text(line);
          });
        }
      });

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(isMobile ? 4 : 6));

    // Style y-axis with responsive sizing
    yAxis.selectAll("text")
      .style("font-size", isSmallMobile ? "11px" : isMobile ? "13px" : "16px")
      .style("font-family", "Roboto Condensed, sans-serif");

    // Add responsive y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", isMobile ? "0.8em" : "1em")
      .style("text-anchor", "middle")
      .style("font-size", isSmallMobile ? "12px" : isMobile ? "14px" : "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(yAxisLabel);

    // Group data by condition regardless of political party
    const dataByCondition = {};
    filteredData.forEach(d => {
      if (!dataByCondition[d.condition]) {
        dataByCondition[d.condition] = [];
      }
      dataByCondition[d.condition].push(d);
    });

    // For each condition, calculate the average values per wave
    const conditionAverages = {};
    conditions.forEach(conditionInfo => {
      const conditionData = dataByCondition[conditionInfo.name];
      if (!conditionData || conditionData.length === 0) return;
      
      // Group by wave to calculate averages
      const waveGroups = {};
      conditionData.forEach(d => {
        if (!waveGroups[d.wave]) {
          waveGroups[d.wave] = [];
        }
        waveGroups[d.wave].push(d);
      });
      
      // Calculate average for each wave
      conditionAverages[conditionInfo.name] = Object.keys(waveGroups).map(wave => {
        const waveData = waveGroups[wave];
        const totalMean = waveData.reduce((sum, d) => sum + d.mean, 0);
        const totalSe = waveData.reduce((sum, d) => sum + (d.se || 0), 0);
        const totalN = waveData.reduce((sum, d) => sum + (d.n || 0), 0);
        return {
          wave: parseInt(wave),
          mean: totalMean / waveData.length,
          se: totalSe / waveData.length,
          n: totalN,
          condition: conditionInfo.name,
          wave_label: waveData[0].wave_label
        };
      }).sort((a, b) => a.wave - b.wave);
    });

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.wave))
      .y(d => yScale(d.mean))
      .curve(d3.curveLinear);

    // Draw lines and points for each condition using the averages
    conditions.forEach(conditionInfo => {
      const conditionData = conditionAverages[conditionInfo.name];
      if (!conditionData || conditionData.length === 0) return;

      // Draw line - connect average data points
      g.append("path")
        .datum(conditionData)
        .attr("fill", "none")
        .attr("stroke", conditionInfo.color)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,0") // Solid line
        .attr("d", line);
      
      // Draw error bars using unrounded CI values (if enabled)
      if (showErrorBars) {
        g.selectAll(`.error-bar-${conditionInfo.name.replace(/\s+/g, '-')}`)
          .data(conditionData)
          .enter()
          .append("g")
          .attr("class", `error-bar-${conditionInfo.name.replace(/\s+/g, '-')}`)
          .each(function(d) {
            if (d.se !== undefined && d.se > 0) {
              const errorGroup = d3.select(this);
              
              // Calculate unrounded CI bounds
              const ciLower = d.mean - 1.96 * d.se;
              const ciUpper = d.mean + 1.96 * d.se;
              
              // Vertical error bar line
              errorGroup.append("line")
                .attr("x1", xScale(d.wave))
                .attr("x2", xScale(d.wave))
                .attr("y1", yScale(ciLower))
                .attr("y2", yScale(ciUpper))
                .attr("stroke", conditionInfo.color)
                .attr("stroke-width", isMobile ? 1 : 1.5)
                .attr("opacity", 0.7);
              
              // Top cap
              errorGroup.append("line")
                .attr("x1", xScale(d.wave) - (isMobile ? 3 : 4))
                .attr("x2", xScale(d.wave) + (isMobile ? 3 : 4))
                .attr("y1", yScale(ciUpper))
                .attr("y2", yScale(ciUpper))
                .attr("stroke", conditionInfo.color)
                .attr("stroke-width", isMobile ? 1 : 1.5)
                .attr("opacity", 0.7);
              
              // Bottom cap
              errorGroup.append("line")
                .attr("x1", xScale(d.wave) - (isMobile ? 3 : 4))
                .attr("x2", xScale(d.wave) + (isMobile ? 3 : 4))
                .attr("y1", yScale(ciLower))
                .attr("y2", yScale(ciLower))
                .attr("stroke", conditionInfo.color)
                .attr("stroke-width", isMobile ? 1 : 1.5)
                .attr("opacity", 0.7);
            }
          });
      }
      
      // Draw points for averages (on top of error bars)
      g.selectAll(`.point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .data(conditionData)
        .enter()
        .append("circle")
        .attr("class", `point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .attr("cx", d => xScale(d.wave))
        .attr("cy", d => yScale(d.mean))
        .attr("r", isMobile ? 4 : 6)
        .attr("fill", conditionInfo.color)
        .attr("stroke", "white")
        .attr("stroke-width", isMobile ? 1 : 2)
        .on("mouseover", function(event, d) {
          // Tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none");

          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          
          // Build tooltip content in specified order: estimate, CI, N, p value, significance
          let tooltipContent = `<strong>${d.condition}</strong><br/>`;
          tooltipContent += `${d.wave_label}<br/>`;
          
          // Estimate - use more precision if values are small
          const meanDecimals = Math.abs(d.mean) < 0.1 ? 3 : 2;
          tooltipContent += `Mean: ${d.mean.toFixed(meanDecimals)}${tooltipUnit ? ' ' + tooltipUnit : ''}<br/>`;
          
          // Confidence Interval - use more precision if values are small
          if (d.se !== undefined) {
            const ciLower = d.mean - 1.96 * d.se;
            const ciUpper = d.mean + 1.96 * d.se;
            
            // Determine decimal places based on magnitude
            const decimals = Math.abs(d.mean) < 0.1 ? 3 : 2;
            
            tooltipContent += `95% CI: [${ciLower.toFixed(decimals)}, ${ciUpper.toFixed(decimals)}]<br/>`;
          }
          
          // Sample size
          if (d.n !== undefined) {
            tooltipContent += `N = ${d.n}`;
          }
          
          // P-value and significance would go here if available in the data
          
          tooltip.html(tooltipContent)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove();
        });
    });

    // Add responsive legend
    const legendItemWidth = isSmallMobile ? 100 : isMobile ? 110 : 150;
    const legendWidth = conditions.length * legendItemWidth;
    const legendStartX = Math.max(0, (width + margin.left + margin.right - legendWidth) / 2);
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendStartX}, ${subtitle ? 90 : 70})`);

    if (isMobile && legendWidth > width + margin.left + margin.right) {
      // Stack legend items vertically on mobile if they don't fit
      const legendItems = legend.selectAll(".legend-item")
        .data(conditions)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

      // Legend lines
      legendItems.append("line")
        .attr("x1", 0)
        .attr("x2", 15)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", d => d.color)
        .attr("stroke-width", 2);

      // Legend circles
      legendItems.append("circle")
        .attr("cx", 7.5)
        .attr("cy", 0)
        .attr("r", 3)
        .attr("fill", d => d.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      // Legend text
      legendItems.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", isSmallMobile ? "11px" : isMobile ? "12px" : "14px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(d => d.name);
    } else {
      // Horizontal legend
      const legendItems = legend.selectAll(".legend-item")
        .data(conditions)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * legendItemWidth}, 0)`);

      // Legend lines
      legendItems.append("line")
        .attr("x1", 0)
        .attr("x2", isMobile ? 15 : 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", d => d.color)
        .attr("stroke-width", isMobile ? 2 : 3);

      // Legend circles
      legendItems.append("circle")
        .attr("cx", isMobile ? 7.5 : 10)
        .attr("cy", 0)
        .attr("r", isMobile ? 3 : 4)
        .attr("fill", d => d.color)
        .attr("stroke", "white")
        .attr("stroke-width", isMobile ? 1 : 2);

      // Legend text
      legendItems.append("text")
        .attr("x", isMobile ? 20 : 25)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", isSmallMobile ? "11px" : isMobile ? "12px" : "14px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(d => d.name);
    }
    };

    // Render chart immediately when dependencies are ready
    if (svgRef.current && data && data.length > 0) {
      renderChart();
    }

    // Add resize event listener for window resize
    const handleResize = () => {
      if (svgRef.current && data && data.length > 0) {
        renderChart();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [data, title, subtitle, yAxisLabel, conditions, waveMapping, yDomain, tooltipUnit, svgRef]);
};
