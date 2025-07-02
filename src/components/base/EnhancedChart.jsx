import { useEffect } from 'react'
import * as d3 from 'd3'
import { CONDITION_LABELS, COLOR_MAP, WAVE_LABELS } from '../../constants'

export const useEnhancedChart = ({
  svgRef,
  data,
  currentWave,
  currentPoliticalParty,
  currentCategory,
  xDomain,
  title,
  subtitle,
  xAxisLabel,
  chartType, // 'policy' or 'knowledge'
  yAxisItems, // Array of items to display on Y-axis (categories or political parties)
  dataFilter,
}) => {
  useEffect(() => {
    if (!data || data.length === 0) {
      return
    }

    // Safely extract value from potentially nested arrays or direct values
    const extractValue = (item, key) => {
      if (!item[key]) return undefined;
      
      if (typeof item[key] === 'string' || typeof item[key] === 'number') {
        return item[key];
      }
      
      if (Array.isArray(item[key]) && !Array.isArray(item[key][0])) {
        return item[key][0];
      }
      
      if (Array.isArray(item[key]) && Array.isArray(item[key][0])) {
        return item[key][0][0];
      }
      
      return undefined;
    };

    // Process data regardless of structure
    const processedData = data.map(item => ({
      condition: extractValue(item, 'condition'),
      category: extractValue(item, 'category'),
      mean: parseFloat(extractValue(item, 'mean')),
      se: parseFloat(extractValue(item, 'se')),
      n: parseInt(extractValue(item, 'n'), 10),
      wave: parseInt(extractValue(item, 'wave'), 10),
      political_party: extractValue(item, 'political_party')
    }));

    // Calculate global min/max from ALL data before filtering
    const globalMin = d3.min(processedData, d => d.mean);
    const globalMax = d3.max(processedData, d => d.mean);
    
    // Round min down and max up to nearest 5
    const roundedMin = Math.floor(globalMin / 5) * 5;
    const roundedMax = Math.ceil(globalMax / 5) * 5;

    // Apply filters based on chart type
    let filteredData;
    if (chartType === 'policy') {
      // For policy chart: filter by wave, category and include all political parties
      filteredData = processedData.filter(d => 
        d.wave === currentWave && 
        d.category === currentCategory
      );
    } else {
      // For knowledge chart: filter by wave and political party
      filteredData = processedData.filter(d => 
        d.wave === currentWave && 
        d.political_party === currentPoliticalParty
      );
      
      if (dataFilter) {
        filteredData = dataFilter(filteredData);
      }
    }
    
    if (filteredData.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Remove previous chart elements
    d3.select(svgRef.current).selectAll("*").remove();

    // Make chart responsive to container width
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width;
    const isMobile = window.innerWidth <= 768;
    const margin = isMobile 
      ? { top: 100, right: 60, bottom: 100, left: 120 }
      : { top: 120, right: 120, bottom: 80, left: 150 };
    const width = Math.min(isMobile ? containerWidth - 40 : 950, containerWidth) - margin.left - margin.right;
    const height = isMobile ? Math.max(400, yAxisItems.length * 80) : 400 - margin.bottom - margin.top;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const conditions = ['control', 'treatment', 'handoff'];
    
    // Set up scales using the GLOBAL min/max for x-axis
    const xScale = d3.scaleLinear()
      .domain([roundedMin, roundedMax])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(yAxisItems)
      .range([0, height])
      .padding(0.2);

    // Add title
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(`${title} (${WAVE_LABELS[currentWave]})`);

    // Add subtitle
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(subtitle);

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => `${d}%`))
      .selectAll("text")
      .style("font-size", "11px");
    
    // Add x-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "12px")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(xAxisLabel);

    // Add y-axis with properly wrapped labels if needed
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("font-weight", "bold")
      .each(function(d) {
        if (chartType === 'knowledge') {
          const text = d3.select(this);
          const words = text.text().split(/\s+/).reverse();
          const lineHeight = 1.1;
          const width = isMobile ? 100 : 130;
          let word;
          let line = [];
          let lineNumber = 0;
          const y = text.attr("y");
          const dy = parseFloat(text.attr("dy") || 0);
          
          text.text(null);
          let tspan = text.append("tspan")
            .attr("x", -10)
            .attr("y", y)
            .attr("dy", dy + "em");
          
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan")
                .attr("x", -10)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            }
          }
        }
      });

    // For each y-axis item (category or political party)
    yAxisItems.forEach(item => {
      const yPos = yScale(item) + yScale.bandwidth() / 2;
      
      // Draw light horizontal line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", width)
        .attr("y2", yPos)
        .attr("stroke", "#f0f0f0")
        .attr("stroke-width", 1);
      
      // For policy chart: connect dots for each political party
      // For knowledge chart: connect dots across different conditions for each category
      let itemData;
      
      if (chartType === 'policy') {
        itemData = filteredData.filter(d => d.political_party === item);
      } else {
        itemData = filteredData.filter(d => d.category === item);
      }
      
      // Sort by condition in the order: control, treatment, handoff
      const sortedData = ['control', 'treatment', 'handoff']
        .map(condition => itemData.find(d => d.condition === condition))
        .filter(d => d !== undefined);
      
      // Draw connecting lines between dots if we have at least 2 dots
      if (sortedData.length >= 2) {
        // Draw line from control to treatment
        if (sortedData[0] && sortedData[1]) {
          g.append("line")
            .attr("x1", xScale(sortedData[0].mean))
            .attr("y1", yPos)
            .attr("x2", xScale(sortedData[1].mean))
            .attr("y2", yPos)
            .attr("stroke", COLOR_MAP.treatment)
            .attr("stroke-width", 2)
            .attr("opacity", 0.6);
        }
        
        // Draw line from treatment to handoff
        if (sortedData[1] && sortedData[2]) {
          g.append("line")
            .attr("x1", xScale(sortedData[1].mean))
            .attr("y1", yPos)
            .attr("x2", xScale(sortedData[2].mean))
            .attr("y2", yPos)
            .attr("stroke", COLOR_MAP.handoff)
            .attr("stroke-width", 2)
            .attr("opacity", 0.6);
        }
      }
    });

    // Add dots for each condition
    conditions.forEach(condition => {
      let conditionData;
      
      // Filter data differently based on chart type
      if (chartType === 'policy') {
        // For each y-axis item (political party), find the data point for this condition
        yAxisItems.forEach(party => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && 
            d.political_party === party
          );
          
          if (dataPoint) {
            addDotWithLabel(dataPoint, party, condition);
          }
        });
      } else {
        // For each y-axis item (category), find the data point for this condition
        yAxisItems.forEach(category => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && 
            d.category === category
          );
          
          if (dataPoint) {
            addDotWithLabel(dataPoint, category, condition);
          }
        });
      }
    });

    // Helper function to add a dot with a label
    function addDotWithLabel(dataPoint, yItem, condition) {
      const xPos = xScale(dataPoint.mean);
      const yPos = yScale(yItem) + yScale.bandwidth() / 2;
      
      // Add dot
      g.append("circle")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 7)
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("mouseover", function(event) {
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
          
          const tooltipContent = chartType === 'policy'
            ? `<strong>${CONDITION_LABELS[condition]}</strong><br/>${yItem}: ${dataPoint.mean.toFixed(1)}%`
            : `<strong>${CONDITION_LABELS[condition]}</strong><br/>${yItem}: ${dataPoint.mean.toFixed(1)}%`;
          
          tooltip.html(tooltipContent)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove();
        });
      
      // Add label
      const labelYPos = yPos - 15;
      
      const labelGroup = g.append("g")
        .attr("class", `label-${condition}`);
      
      // Add background rectangle
      labelGroup.append("rect")
        .attr("x", xPos - 10)
        .attr("y", labelYPos - 8)
        .attr("width", 20)
        .attr("height", 14)
        .attr("fill", COLOR_MAP[condition])
        .attr("rx", 3)
        .attr("ry", 3);
      
      // Add pointer triangle
      labelGroup.append("path")
        .attr("d", `M${xPos - 3},${labelYPos + 6} L${xPos + 3},${labelYPos + 6} L${xPos},${labelYPos + 10} Z`)
        .attr("fill", COLOR_MAP[condition]);
      
      // Add text
      labelGroup.append("text")
        .attr("x", xPos)
        .attr("y", labelYPos)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "8px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(Math.round(dataPoint.mean));
    }

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + width / 2 - (conditions.length * 120) / 2}, ${height + margin.top + 50})`);

    conditions.forEach((condition, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 120}, 0)`);

      legendItem.append("circle")
        .attr("r", 6)
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .style("font-size", "11px")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(CONDITION_LABELS[condition]);
    });

  }, [data, currentWave, currentPoliticalParty, currentCategory, svgRef, xDomain, title, subtitle, xAxisLabel, chartType, yAxisItems, dataFilter]);
};

