import { useEffect } from 'react'
import * as d3 from 'd3'
import { COLOR_MAP, WAVE_LABELS } from '../../constants'

export const useTemporalChart = ({
  svgRef,
  data,
  title,
  subtitle,
  yAxisLabel,
  currentPoliticalParty,
  conditions,
  waveMapping,
  yDomain
}) => {
  useEffect(() => {
    if (!data || data.length === 0) {
      console.log("No temporal chart data available");
      return;
    }

    console.log("Rendering temporal chart with data:", data.slice(0, 3));

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter to only show Overall data
    const filteredData = data.filter(d => d.political_party === 'Overall');
    
    if (filteredData.length === 0) {
      console.log("No Overall data available");
      return;
    }

    console.log("Filtered Overall data for y-axis calculation:", filteredData.map(d => ({ condition: d.condition, wave: d.wave, mean: d.mean })));

    // Set up dimensions
    const margin = { top: 80, right: 60, bottom: 120, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title - remove political party from title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(title);

    // Add subtitle
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(subtitle);

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
      // Use only the filtered Overall data for y-axis calculation
      const allMeans = filteredData.map(d => d.mean);
      console.log("All means from filtered data:", allMeans);
      const dataMin = Math.min(...allMeans);
      const dataMax = Math.max(...allMeans);
      console.log("Data min:", dataMin, "Data max:", dataMax);
      
      // Use exact data bounds with minimal padding
      yMin = dataMin - 0.3; // Small padding below minimum
      yMax = dataMax + 0.3; // Small padding above maximum
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

    // Style x-axis text
    xAxis.selectAll("text")
      .style("font-size", "11px")
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
      .call(d3.axisLeft(yScale).ticks(6));

    // Style y-axis
    yAxis.selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "Roboto Condensed, sans-serif");

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
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
        return {
          wave: parseInt(wave),
          mean: totalMean / waveData.length,
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
      
      // Draw points for averages
      g.selectAll(`.point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .data(conditionData)
        .enter()
        .append("circle")
        .attr("class", `point-${conditionInfo.name.replace(/\s+/g, '-')}`)
        .attr("cx", d => xScale(d.wave))
        .attr("cy", d => yScale(d.mean))
        .attr("r", 6)
        .attr("fill", conditionInfo.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
          // Tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0);

          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          
          tooltip.html(`<strong>${d.condition}</strong><br/>
                      ${d.wave_label}: ${d.mean.toFixed(1)} years<br/>`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove();
        });
    });

    // Add legend at the bottom (centered)
    const legendWidth = conditions.length * 150;
    const legendStartX = (width + margin.left + margin.right - legendWidth) / 2;
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendStartX}, ${height + margin.top + 60})`);

    const legendItems = legend.selectAll(".legend-item")
      .data(conditions)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 150}, 0)`);

    // Legend lines
    legendItems.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3);

    // Legend circles
    legendItems.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Legend text
    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(d => d.name);

  }, [data, title, subtitle, yAxisLabel, conditions, waveMapping, yDomain, svgRef]);
};
