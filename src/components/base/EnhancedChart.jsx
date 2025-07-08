import { useEffect } from 'react'
import * as d3 from 'd3'
import { CONDITION_LABELS, COLOR_MAP, WAVE_LABELS, KNOWLEDGE_CATEGORIES_LABELS, HIGH_LEVEL_CONSTRUCTS_LABELS } from '../../constants'

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
  waveControlsRef, // Ref to where wave controls should be rendered
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
    })).filter(item => {
      // Filter out entries with NaN or invalid values
      return !isNaN(item.mean) && !isNaN(item.se) && 
             item.mean !== null && item.se !== null && 
             item.mean !== undefined && item.se !== undefined &&
             isFinite(item.mean) && isFinite(item.se)
    });

    // Calculate global differences from ALL data before any filtering
    const globalDifferenceData = [];
    
    yAxisItems.forEach(item => {
      let itemData;
      if (chartType === 'policy') {
        itemData = processedData.filter(d => d.political_party === item);
      } else if (chartType === 'high-level-constructs') {
        itemData = processedData.filter(d => d.category === item);
      } else {
        itemData = processedData.filter(d => d.category === item);
      }
      
      // Find control group value for this item
      const controlPoint = itemData.find(d => d.condition === 'control');
      if (!controlPoint) return; // Skip if no control data
      
      // Calculate differences for treatment and handoff
      ['treatment', 'handoff'].forEach(condition => {
        const conditionPoint = itemData.find(d => d.condition === condition);
        if (conditionPoint) {
          const difference = conditionPoint.mean - controlPoint.mean;
          globalDifferenceData.push({ mean: difference });
        }
      });
    });

    // Calculate global min/max from ALL difference values
    const globalDiffMin = d3.min(globalDifferenceData, d => d.mean);
    const globalDiffMax = d3.max(globalDifferenceData, d => d.mean);
    
    // Extend domain to include zero and add padding
    const globalDomainMin = Math.min(0, Math.floor(globalDiffMin) - 2);
    const globalDomainMax = Math.max(0, Math.ceil(globalDiffMax) + 2);

    // Apply filters based on chart type
    let filteredData;
    if (chartType === 'policy') {
      // For policy chart: filter by wave, category and include all political parties
      filteredData = processedData.filter(d => 
        d.wave === currentWave && 
        d.category === currentCategory
      );
    } else if (chartType === 'high-level-constructs') {
      // For high-level constructs chart: filter by wave only (no political party)
      filteredData = processedData.filter(d => 
        d.wave === currentWave
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

    // Calculate differences from control group
    const calculateDifferences = (data) => {
      const differenceData = [];
      
      yAxisItems.forEach(item => {
        let itemData;
        if (chartType === 'policy') {
          itemData = data.filter(d => d.political_party === item);
        } else if (chartType === 'high-level-constructs') {
          itemData = data.filter(d => d.category === item);
        } else {
          itemData = data.filter(d => d.category === item);
        }
        
        // Find control group value for this item
        const controlPoint = itemData.find(d => d.condition === 'control');
        if (!controlPoint) return; // Skip if no control data
        
        // Calculate differences for treatment and handoff
        ['treatment', 'handoff'].forEach(condition => {
          const conditionPoint = itemData.find(d => d.condition === condition);
          if (conditionPoint) {
            const difference = conditionPoint.mean - controlPoint.mean;
            // Calculate standard error for difference (assuming independence)
            const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2));
            
            differenceData.push({
              ...conditionPoint,
              mean: difference,
              se: diffSE,
              originalMean: conditionPoint.mean,
              controlMean: controlPoint.mean
            });
          }
        });
      });
      
      return differenceData;
    };

    // Transform data to show differences from control
    const differenceData = calculateDifferences(filteredData);
    
    if (differenceData.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Update filtered data to use difference data
    filteredData = differenceData;

    // Check if this is an update (for transitions) or initial render
    const existingSvg = d3.select(svgRef.current);
    const isUpdate = existingSvg.select("g.chart-group").size() > 0;

    // Make chart responsive to container width
    const containerWidth = svgRef.current.parentNode.getBoundingClientRect().width;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    // Set larger right margins to accommodate category labels
    const margin = isMobile 
      ? { top: 120, right: 140, bottom: 70, left: 60 }
      : isTablet 
      ? { top: 140, right: 160, bottom: 80, left: 80 }
      : { top: 160, right: 180, bottom: 90, left: 100 };
    const width = Math.max(containerWidth - margin.left - margin.right, isMobile ? 500 : 700);
    const chartHeight = isMobile ? Math.max(300, yAxisItems.length * 60) : isTablet ? 350 : 400;
    
    // Helper to split text into lines for SVG <text>
    function wrapText(text, maxChars) {
      if (!text) return [];
      const words = text.split(' ');
      const lines = [];
      let line = '';
      words.forEach(word => {
        if ((line + word).length > maxChars) {
          lines.push(line.trim());
          line = '';
        }
        line += word + ' ';
      });
      if (line) lines.push(line.trim());
      return lines;
    }

    // Helper to estimate line count for wrapping
    function estimateLineCount(text, charsPerLine) {
      if (!text) return 1;
      return Math.ceil(text.length / charsPerLine);
    }
    
    // Calculate heights for title, subtitle, and legend positioning
    // Use the LONGEST possible wave label for consistent spacing
    const allWaveLabels = Object.values(WAVE_LABELS);
    const longestWaveLabel = allWaveLabels.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '');
    const titleTextForSpacing = `${title} (${longestWaveLabel})`;
    const subtitleText = subtitle;
    const charsPerLine = Math.floor(width / 13); // ~13px per char at 20-28px font
    const titleLines = estimateLineCount(titleTextForSpacing, charsPerLine);
    const subtitleLines = estimateLineCount(subtitleText, charsPerLine);

    // Font sizes
    const titleFontSize = isMobile ? 20 : isTablet ? 24 : 28;
    const subtitleFontSize = isMobile ? 16 : isTablet ? 18 : 20;
    const lineGap = isMobile ? 4 : isTablet ? 6 : 8;

    // Calculate heights with MINIMAL spacing for tight layout
    const titleHeight = titleLines * titleFontSize + (titleLines - 1) * lineGap;
    const subtitleHeight = subtitleLines * subtitleFontSize + (subtitleLines - 1) * lineGap;
    const topPadding = 5; // Much smaller
    const subtitleY = topPadding + titleHeight + 3; // Very tight gap
    const waveControlsHeight = isMobile ? 28 : isTablet ? 32 : 36; // Even smaller
    const waveControlsY = subtitleY + subtitleHeight + 4; // Tight gap
    const chartStartY = waveControlsY + waveControlsHeight + 8; // Start chart after wave controls
    const xAxisLabelY = chartStartY + chartHeight + 54; // X-axis label position
    const legendHeight = isMobile ? 20 : isTablet ? 24 : 28; // Smaller
    const legendY = xAxisLabelY + 25; // Legend below x-axis label
    
    const totalHeight = legendY + legendHeight + 20; // Include legend at bottom

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .style("max-width", `${width + margin.left + margin.right}px`)
      .style("display", "block")
      .style("margin", "0 auto");

    // Handle SVG setup based on whether this is an update or initial render
    let g;
    const transitionDuration = 600;
    
    if (isUpdate) {
      // Keep existing structure for transitions
      g = svg.select("g.chart-group");
    } else {
      // Clear all content for initial render
      svg.selectAll("*").remove();
      g = svg.append("g")
        .attr("class", "chart-group")
        .attr("transform", `translate(${margin.left},${chartStartY})`);
    }

    const conditions = ['treatment', 'handoff'];
    
    // Set up scales using GLOBAL difference domain (consistent across all filtering)
    const xScale = d3.scaleLinear()
      .domain([globalDomainMin, globalDomainMax])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(yAxisItems)
      .range([0, chartHeight])
      .padding(0.2);


    // Add static elements only on initial render
    if (!isUpdate) {
      // Add title using foreignObject for wrapping (no wave label)
      svg.append("foreignObject")
      .attr("x", margin.left)
      .attr("y", topPadding)
      .attr("width", width)
      .attr("height", titleHeight + 5)
      .append("xhtml:div")
      .style("font-size", `${titleFontSize}px`)
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("color", "#1f2937")
      .style("text-align", "center")
      .style("width", "100%")
      .style("line-height", "1.2")
      .text(title);

    // Add subtitle using foreignObject for wrapping
    svg.append("foreignObject")
      .attr("x", margin.left)
      .attr("y", subtitleY)
      .attr("width", width)
      .attr("height", subtitleHeight)
      .append("xhtml:div")
      .style("font-size", `${subtitleFontSize}px`)
      .style("font-style", "italic")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("color", "#6b7280")
      .style("text-align", "center")
      .style("width", "100%")
      .style("line-height", "1.2")
      .text(subtitleText);


    // Add zero reference line
    g.append("line")
      .attr("x1", xScale(0))
      .attr("y1", 0)
      .attr("x2", xScale(0))
      .attr("y2", chartHeight)
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.7);

    // Add rotated text along zero line
    g.append("text")
      .attr("x", xScale(0) - 12)
      .attr("y", chartHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", isMobile ? "12px" : isTablet ? "13px" : "14px")
      .style("font-weight", "500")
      .style("fill", "#666")
      .style("font-family", "Roboto Condensed, sans-serif")
      .attr("transform", `rotate(-90, ${xScale(0) - 12}, ${chartHeight / 2})`)
      .text("No change from control");

    // Add x-axis with difference formatting
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => {
        if (d === 0) return '0';
        return d > 0 ? `+${d}` : `${d}`;
      }))
      .selectAll("text")
      .style("font-size", isMobile ? "15px" : isTablet ? "16px" : "18px")
      .style("font-weight", "500")
      .style("fill", "#374151");
    
    // Add x-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", chartHeight + 54) // was height + 40, now increased for more space
      .attr("text-anchor", "middle")
      .style("fill", "#1f2937")
      .style("font-size", isMobile ? "15px" : isTablet ? "17px" : "19px") // slightly smaller
      .style("font-weight", "600")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(xAxisLabel);

      // Add y-axis without any visual elements (no line, no ticks)
      g.append("g")
        .call(d3.axisLeft(yScale).tickFormat("").tickSize(0))
        .select(".domain")
        .remove();
    }

    // Add legend below wave controls (always update for both initial and update renders)
    const legendSpacing = isMobile ? 100 : isTablet ? 110 : 140;
    let legend = svg.select("g.legend");
    
    if (legend.empty()) {
      legend = svg.append("g")
        .attr("class", "legend");
    }
    
    legend.attr("transform", `translate(${margin.left + width / 2 - (conditions.length * legendSpacing) / 2}, ${legendY})`);

    const legendItems = legend.selectAll(".legend-item")
      .data(conditions, d => d);

    legendItems.exit().remove();

    const legendEnter = legendItems.enter()
      .append("g")
      .attr("class", "legend-item");

    legendEnter.append("circle");
    legendEnter.append("text");

    const legendUpdate = legendEnter.merge(legendItems);

    legendUpdate
      .attr("transform", (d, i) => `translate(${i * legendSpacing}, 0)`);

    legendUpdate.select("circle")
      .attr("r", isMobile ? 9 : isTablet ? 10 : 12)
      .attr("fill", d => COLOR_MAP[d])
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    legendUpdate.select("text")
      .attr("x", isMobile ? 18 : isTablet ? 22 : 25)
      .attr("y", 5)
      .style("font-size", isMobile ? "15px" : isTablet ? "16px" : "18px")
      .style("font-weight", "600")
      .style("fill", "#1f2937")
      .style("font-family", "Roboto Condensed, sans-serif")
      .text(d => CONDITION_LABELS[d]);

    // Position wave controls container if provided (always update)
    if (waveControlsRef && waveControlsRef.current) {
      // Position the wave controls container to center with title/subtitle
      const controlsContainer = waveControlsRef.current;
      const svgRect = svgRef.current.getBoundingClientRect();
      
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.left = '0px';
      controlsContainer.style.top = `${waveControlsY}px`;
      controlsContainer.style.width = '100%'; // Full container width
      controlsContainer.style.height = `${waveControlsHeight}px`;
      controlsContainer.style.display = 'flex';
      controlsContainer.style.justifyContent = 'center';
      controlsContainer.style.alignItems = 'center';
      controlsContainer.style.zIndex = '10';
    }

    // Collect data for connecting lines
    const lineData = [];

    // For each y-axis item (category or political party)
    yAxisItems.forEach(item => {
      const yPos = yScale(item) + yScale.bandwidth() / 2;

      // Draw light horizontal line (only on initial render)
      if (!isUpdate) {
        g.append("line")
          .attr("x1", 0)
          .attr("y1", yPos)
          .attr("x2", width)
          .attr("y2", yPos)
          .attr("stroke", "#f0f0f0")
          .attr("stroke-width", 1);
      }

      // Do NOT draw any y-axis label

      // For policy chart: connect dots for each political party
      // For knowledge chart: connect dots across different conditions for each category
      let itemData;
      
      if (chartType === 'policy') {
        itemData = filteredData.filter(d => d.political_party === item);
      } else if (chartType === 'high-level-constructs') {
        itemData = filteredData.filter(d => d.category === item);
      } else {
        itemData = filteredData.filter(d => d.category === item);
      }
      
      // Sort by condition in the order: treatment, handoff (no control in difference data)
      const sortedData = ['treatment', 'handoff']
        .map(condition => itemData.find(d => d.condition === condition))
        .filter(d => d !== undefined);
      
      // Collect line data for this item
      if (sortedData.length >= 1) {
        // Line from zero to treatment
        lineData.push({
          key: `${item}-treatment`,
          x1: xScale(0),
          y1: yPos,
          x2: xScale(sortedData[0].mean),
          y2: yPos,
          stroke: COLOR_MAP.treatment,
          item: item
        });
        
        // Line from treatment to handoff if handoff exists
        if (sortedData.length === 2) {
          lineData.push({
            key: `${item}-handoff`,
            x1: xScale(sortedData[0].mean),
            y1: yPos,
            x2: xScale(sortedData[1].mean),
            y2: yPos,
            stroke: COLOR_MAP.handoff,
            item: item
          });
        }
      }
    });

    // Data join for connecting lines with transitions
    const lines = g.selectAll(".connecting-line")
      .data(lineData, d => d.key);

    // Remove old lines
    lines.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // Add new lines
    const linesEnter = lines.enter()
      .append("line")
      .attr("class", "connecting-line")
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // Update all lines
    lines.merge(linesEnter)
      .transition()
      .duration(transitionDuration)
      .attr("x1", d => d.x1)
      .attr("y1", d => d.y1)
      .attr("x2", d => d.x2)
      .attr("y2", d => d.y2)
      .attr("stroke", d => d.stroke)
      .attr("opacity", 0.6);

    // Create data for dots with unique keys for transitions
    const dotData = [];
    conditions.forEach(condition => {
      if (chartType === 'policy') {
        yAxisItems.forEach(party => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && 
            d.political_party === party
          );
          if (dataPoint) {
            dotData.push({
              ...dataPoint,
              yItem: party,
              key: `${party}-${condition}`,
              x: xScale(dataPoint.mean),
              y: yScale(party) + yScale.bandwidth() / 2
            });
          }
        });
      } else {
        yAxisItems.forEach(category => {
          const dataPoint = filteredData.find(d => 
            d.condition === condition && 
            d.category === category
          );
          if (dataPoint) {
            dotData.push({
              ...dataPoint,
              yItem: category,
              key: `${category}-${condition}`,
              x: xScale(dataPoint.mean),
              y: yScale(category) + yScale.bandwidth() / 2
            });
          }
        });
      }
    });

    // Data join for dots with transitions
    const dots = g.selectAll(".chart-dot")
      .data(dotData, d => d.key);

    // Remove old dots
    dots.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // Add new dots
    const dotsEnter = dots.enter()
      .append("circle")
      .attr("class", "chart-dot")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", isMobile ? 8 : isTablet ? 9 : 10)
      .attr("fill", d => COLOR_MAP[d.condition])
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0);

    // Update existing dots
    dots.merge(dotsEnter)
      .on("mouseover", function(event, d) {
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
        
        const differenceText = d.mean >= 0 ? `+${d.mean.toFixed(1)}` : `${d.mean.toFixed(1)}`;
        const tooltipContent = chartType === 'policy'
          ? `<strong>${CONDITION_LABELS[d.condition]}</strong><br/>${d.yItem}: ${differenceText} vs Control<br/>N = ${d.n}`
          : `<strong>${CONDITION_LABELS[d.condition]}</strong><br/>${d.yItem}: ${differenceText} vs Control<br/>N = ${d.n}`;
        
        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".d3-tooltip").remove();
      })
      .transition()
      .duration(transitionDuration)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("opacity", 1);

    // Create data for labels with unique keys for transitions
    const labelData = dotData.map(d => {
      const labelYPos = d.y - (isMobile ? 16 : isTablet ? 18 : 20);
      const labelWidth = isMobile ? 24 : isTablet ? 28 : 32;
      const labelHeight = isMobile ? 16 : isTablet ? 18 : 20;
      const labelText = d.mean >= 0 ? `+${Math.round(d.mean)}` : `${Math.round(d.mean)}`;
      
      return {
        ...d,
        labelYPos,
        labelWidth,
        labelHeight,
        labelText
      };
    });

    // Data join for labels with transitions
    const labels = g.selectAll(".dot-label")
      .data(labelData, d => d.key);

    // Remove old labels
    labels.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // Add new labels
    const labelsEnter = labels.enter()
      .append("g")
      .attr("class", "dot-label")
      .style("opacity", 0);

    // Add background rectangle
    labelsEnter.append("rect")
      .attr("rx", 4)
      .attr("ry", 4);

    // Add pointer triangle
    labelsEnter.append("path");

    // Add text
    labelsEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif");

    // Update all labels
    const labelsUpdate = labels.merge(labelsEnter);

    labelsUpdate.select("rect")
      .transition()
      .duration(transitionDuration)
      .attr("x", d => d.x - d.labelWidth/2)
      .attr("y", d => d.labelYPos - d.labelHeight/2)
      .attr("width", d => d.labelWidth)
      .attr("height", d => d.labelHeight)
      .attr("fill", d => COLOR_MAP[d.condition]);

    labelsUpdate.select("path")
      .transition()
      .duration(transitionDuration)
      .attr("d", d => `M${d.x - 4},${d.labelYPos + d.labelHeight/2} L${d.x + 4},${d.labelYPos + d.labelHeight/2} L${d.x},${d.labelYPos + d.labelHeight/2 + 6} Z`)
      .attr("fill", d => COLOR_MAP[d.condition]);

    labelsUpdate.select("text")
      .transition()
      .duration(transitionDuration)
      .attr("x", d => d.x)
      .attr("y", d => d.labelYPos)
      .style("font-size", isMobile ? "11px" : isTablet ? "12px" : "13px")
      .text(d => d.labelText);

    labelsUpdate
      .transition()
      .duration(transitionDuration)
      .style("opacity", 1);

    // Create data for category labels on the right side at max value positions
    const categoryLabelData = yAxisItems.map(item => {
      const yPos = yScale(item) + yScale.bandwidth() / 2;
      
      // Find the maximum value for this category/item across all conditions
      let itemData;
      if (chartType === 'policy') {
        itemData = filteredData.filter(d => d.political_party === item);
      } else if (chartType === 'high-level-constructs') {
        itemData = filteredData.filter(d => d.category === item);
      } else {
        itemData = filteredData.filter(d => d.category === item);
      }
      
      if (itemData.length > 0) {
        const maxDataPoint = itemData.reduce((max, current) => 
          current.mean > max.mean ? current : max
        );
        
        const maxXPos = xScale(maxDataPoint.mean);
        
        // Use descriptive label for knowledge chart, otherwise use item
        let labelText = item;
        if (chartType === 'knowledge' && KNOWLEDGE_CATEGORIES_LABELS && KNOWLEDGE_CATEGORIES_LABELS[item]) {
          labelText = KNOWLEDGE_CATEGORIES_LABELS[item];
        } else if (chartType === 'high-level-constructs' && HIGH_LEVEL_CONSTRUCTS_LABELS && HIGH_LEVEL_CONSTRUCTS_LABELS[item]) {
          labelText = HIGH_LEVEL_CONSTRUCTS_LABELS[item];
        }

        // Reasonable wrap: split label into lines of ~32 chars
        const wrapLength = 32;
        const labelLines = [];
        let currentLine = '';
        labelText.split(' ').forEach(word => {
          if ((currentLine + ' ' + word).trim().length > wrapLength) {
            labelLines.push(currentLine.trim());
            currentLine = '';
          }
          currentLine += ' ' + word;
        });
        if (currentLine) labelLines.push(currentLine.trim());

        return {
          key: item,
          item,
          yPos,
          maxXPos,
          labelLines,
          labelText
        };
      }
      return null;
    }).filter(d => d !== null);

    // Data join for category labels with transitions
    const categoryLabels = g.selectAll(".category-label")
      .data(categoryLabelData, d => d.key);

    // Remove old category labels
    categoryLabels.exit()
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();

    // Add new category labels
    const categoryLabelsEnter = categoryLabels.enter()
      .append("g")
      .attr("class", "category-label")
      .style("opacity", 0);

    // Update all category labels
    const categoryLabelsUpdate = categoryLabels.merge(categoryLabelsEnter);

    categoryLabelsUpdate.each(function(d) {
      const labelGroup = d3.select(this);
      
      // Check if this is a new label (needs to be created) or existing (needs to be updated)
      const isNewLabel = labelGroup.selectAll("rect").empty();
      
      if (isNewLabel) {
        // Create new label elements for first-time render
        const tempText = g.append("text")
          .style("font-size", isMobile ? "14px" : isTablet ? "15px" : "16px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .style("font-weight", "600")
          .style("visibility", "hidden");

        let maxTextWidth = 0;
        d.labelLines.forEach(line => {
          tempText.text(line);
          const bbox = tempText.node().getBBox();
          if (bbox.width > maxTextWidth) maxTextWidth = bbox.width;
        });
        tempText.remove();
        
        const textWidth = maxTextWidth;
        const labelPadding = isMobile ? 8 : isTablet ? 10 : 12;
        const labelHeight = (isMobile ? 24 : isTablet ? 26 : 28) * d.labelLines.length;

        // Create background rectangle - ensure it doesn't exceed chart bounds
        const labelStartX = Math.min(d.maxXPos + 15, width - textWidth - labelPadding * 2 - 10);
        labelGroup.append("rect")
          .attr("class", "label-background")
          .attr("x", labelStartX)
          .attr("y", d.yPos - labelHeight/2)
          .attr("width", textWidth + labelPadding * 2)
          .attr("height", labelHeight)
          .attr("rx", 6)
          .attr("ry", 6)
          .style("fill", "rgba(255, 255, 255, 0.95)")
          .style("stroke", "#e5e7eb")
          .style("stroke-width", 1)
          .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
          .style("backdrop-filter", "blur(4px)");

        // Create connecting line
        labelGroup.append("line")
          .attr("class", "label-connector")
          .attr("x1", d.maxXPos + 2)
          .attr("y1", d.yPos)
          .attr("x2", labelStartX - 3)
          .attr("y2", d.yPos)
          .style("stroke", "#94a3b8")
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", "2,2");

        // Create text elements
        d.labelLines.forEach((line, i) => {
          labelGroup.append("text")
            .attr("class", `label-text-${i}`)
            .attr("x", labelStartX + labelPadding)
            .attr("y", d.yPos - (d.labelLines.length - 1) * 10 + i * 20)
            .attr("dominant-baseline", "middle")
            .style("font-size", isMobile ? "14px" : isTablet ? "15px" : "16px")
            .style("font-weight", "600")
            .style("fill", "#374151")
            .style("font-family", "Roboto Condensed, sans-serif")
            .style("letter-spacing", "-0.025em")
            .text(line);
        });
      } else {
        // Update existing label elements with smooth transitions
        const labelPadding = isMobile ? 8 : isTablet ? 10 : 12;
        
        // Calculate constrained label position
        const tempText = g.append("text")
          .style("font-size", isMobile ? "14px" : isTablet ? "15px" : "16px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .style("font-weight", "600")
          .style("visibility", "hidden");

        let maxTextWidth = 0;
        d.labelLines.forEach(line => {
          tempText.text(line);
          const bbox = tempText.node().getBBox();
          if (bbox.width > maxTextWidth) maxTextWidth = bbox.width;
        });
        tempText.remove();
        
        const labelStartX = Math.min(d.maxXPos + 15, width - maxTextWidth - labelPadding * 2 - 10);
        
        // Smoothly move background rectangle
        labelGroup.select(".label-background")
          .transition()
          .duration(transitionDuration)
          .attr("x", labelStartX);

        // Smoothly move connecting line
        labelGroup.select(".label-connector")
          .transition()
          .duration(transitionDuration)
          .attr("x1", d.maxXPos + 2)
          .attr("x2", labelStartX - 3);

        // Smoothly move text elements
        d.labelLines.forEach((line, i) => {
          labelGroup.select(`.label-text-${i}`)
            .transition()
            .duration(transitionDuration)
            .attr("x", labelStartX + labelPadding);
        });
      }
    });

    // Show labels immediately (no delay, move with data)
    categoryLabelsUpdate
      .style("opacity", 1);

  }, [data, currentWave, currentPoliticalParty, currentCategory, svgRef, xDomain, title, subtitle, xAxisLabel, chartType, yAxisItems, dataFilter]);
};

