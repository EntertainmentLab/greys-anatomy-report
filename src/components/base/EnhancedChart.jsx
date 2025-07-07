import { useEffect } from 'react'
import * as d3 from 'd3'
import { CONDITION_LABELS, COLOR_MAP, WAVE_LABELS, KNOWLEDGE_CATEGORIES_LABELS } from '../../constants'

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
    const isTablet = window.innerWidth <= 1024;
    // Set left/right margins equal for centering
    const margin = isMobile 
      ? { top: 120, right: 40, bottom: 60, left: 40 }
      : isTablet 
      ? { top: 140, right: 60, bottom: 70, left: 60 }
      : { top: 160, right: 80, bottom: 80, left: 80 };
    const width = Math.max(containerWidth - margin.left - margin.right, isMobile ? 500 : 700);
    const height = isMobile ? Math.max(300, yAxisItems.length * 60) : isTablet ? 350 : 400;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("display", "block")
      .style("margin", "0 auto");

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

    // Estimate line counts for title and subtitle
    const titleText = `${title} (${WAVE_LABELS[currentWave]})`;
    const subtitleText = subtitle;
    const charsPerLine = Math.floor(width / 13); // ~13px per char at 20-28px font
    const titleLines = estimateLineCount(titleText, charsPerLine);
    const subtitleLines = estimateLineCount(subtitleText, charsPerLine);

    // Font sizes
    const titleFontSize = isMobile ? 20 : isTablet ? 24 : 28;
    const subtitleFontSize = isMobile ? 16 : isTablet ? 18 : 20;
    const lineGap = isMobile ? 4 : isTablet ? 6 : 8;

    // Calculate heights
    const titleHeight = titleLines * titleFontSize + (titleLines - 1) * lineGap;
    const subtitleHeight = subtitleLines * subtitleFontSize + (subtitleLines - 1) * lineGap;
    const topPadding = 10;
    const subtitleY = topPadding + titleHeight + 7;
    const legendY = subtitleY + subtitleHeight + 5;

    // Add title using foreignObject for wrapping
    svg.append("foreignObject")
      .attr("x", margin.left)
      .attr("y", topPadding)
      .attr("width", width)
      .attr("height", titleHeight + 30) // add extra height for subtitle line
      .append("xhtml:div")
      .style("font-size", `${titleFontSize}px`)
      .style("font-weight", "bold")
      .style("font-family", "Roboto Condensed, sans-serif")
      .style("color", "#1f2937")
      .style("text-align", "center")
      .style("width", "100%")
      .style("line-height", "1.2")
      .html(() => {
        // Split title and wave label
        const waveLabel = WAVE_LABELS[currentWave] ? WAVE_LABELS[currentWave] : '';
        return `
          <div>${title}</div>
          <div style="
            font-size: ${Math.round(titleFontSize * 0.75)}px;
            font-weight: 500;
            color: #64748b;
            margin-top: 2px;
            line-height: 1.2;
          ">(${waveLabel})</div>
        `;
      });

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

    // Add legend at the top underneath subtitle
    const legendSpacing = isMobile ? 100 : isTablet ? 110 : 140;
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + width / 2 - (conditions.length * legendSpacing) / 2}, ${legendY})`);

    conditions.forEach((condition, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * legendSpacing}, 0)`);

      legendItem.append("circle")
        .attr("r", isMobile ? 9 : isTablet ? 10 : 12)
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      legendItem.append("text")
        .attr("x", isMobile ? 18 : isTablet ? 22 : 25)
        .attr("y", 5)
        .style("font-size", isMobile ? "15px" : isTablet ? "16px" : "18px")
        .style("font-weight", "600")
        .style("fill", "#1f2937")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(CONDITION_LABELS[condition]);
    });

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => `${d}%`))
      .selectAll("text")
      .style("font-size", isMobile ? "15px" : isTablet ? "16px" : "18px")
      .style("font-weight", "500")
      .style("fill", "#374151");
    
    // Add x-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 54) // was height + 40, now increased for more space
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

      // Do NOT draw any y-axis label

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
        .attr("r", isMobile ? 8 : isTablet ? 9 : 10) // was 11/12/14, now smaller
        .attr("fill", COLOR_MAP[condition])
        .attr("stroke", "white")
        .attr("stroke-width", 2)
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
            ? `<strong>${CONDITION_LABELS[condition]}</strong><br/>${yItem}: ${dataPoint.mean.toFixed(1)}%<br/>N = ${dataPoint.n}`
            : `<strong>${CONDITION_LABELS[condition]}</strong><br/>${yItem}: ${dataPoint.mean.toFixed(1)}%<br/>N = ${dataPoint.n}`;
          
          tooltip.html(tooltipContent)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".d3-tooltip").remove();
        });
      
      // Add label
      const labelYPos = yPos - (isMobile ? 16 : isTablet ? 18 : 20); // was 22/25/28, now smaller
      const labelWidth = isMobile ? 24 : isTablet ? 28 : 32; // was 32/36/42, now smaller
      const labelHeight = isMobile ? 16 : isTablet ? 18 : 20; // was 22/25/28, now smaller
      
      const labelGroup = g.append("g")
        .attr("class", `label-${condition}`);
      
      // Add background rectangle
      labelGroup.append("rect")
        .attr("x", xPos - labelWidth/2)
        .attr("y", labelYPos - labelHeight/2)
        .attr("width", labelWidth)
        .attr("height", labelHeight)
        .attr("fill", COLOR_MAP[condition])
        .attr("rx", 4)
        .attr("ry", 4);
      
      // Add pointer triangle
      labelGroup.append("path")
        .attr("d", `M${xPos - 4},${labelYPos + labelHeight/2} L${xPos + 4},${labelYPos + labelHeight/2} L${xPos},${labelYPos + labelHeight/2 + 6} Z`)
        .attr("fill", COLOR_MAP[condition]);
      
      // Add text
      labelGroup.append("text")
        .attr("x", xPos)
        .attr("y", labelYPos)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", isMobile ? "11px" : isTablet ? "12px" : "13px") // was 13/14/16, now smaller
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("font-family", "Roboto Condensed, sans-serif")
        .text(Math.round(dataPoint.mean));
    }

    // Add category labels on the right side at max value positions
    yAxisItems.forEach(item => {
      const yPos = yScale(item) + yScale.bandwidth() / 2;
      
      // Find the maximum value for this category/item across all conditions
      let itemData;
      if (chartType === 'policy') {
        itemData = filteredData.filter(d => d.political_party === item);
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

        // Create a professional label group
        const labelGroup = g.append("g")
          .attr("class", "right-side-label");

        // Add background rectangle with subtle styling
        // Dynamically measure text width using SVG for accurate sizing
        const tempText = g.append("text")
          .style("font-size", isMobile ? "14px" : isTablet ? "15px" : "16px")
          .style("font-family", "Roboto Condensed, sans-serif")
          .style("font-weight", "600")
          .style("visibility", "hidden");

        let maxTextWidth = 0;
        labelLines.forEach(line => {
          tempText.text(line);
          const bbox = tempText.node().getBBox();
          if (bbox.width > maxTextWidth) maxTextWidth = bbox.width;
        });
        tempText.remove();
        const textWidth = maxTextWidth;
        const labelPadding = isMobile ? 8 : isTablet ? 10 : 12;
        const labelHeight = (isMobile ? 24 : isTablet ? 26 : 28) * labelLines.length;

        labelGroup.append("rect")
          .attr("x", maxXPos + 15)
          .attr("y", yPos - labelHeight/2)
          .attr("width", textWidth + labelPadding * 2)
          .attr("height", labelHeight)
          .attr("rx", 6)
          .attr("ry", 6)
          .style("fill", "rgba(255, 255, 255, 0.95)")
          .style("stroke", "#e5e7eb")
          .style("stroke-width", 1)
          .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
          .style("backdrop-filter", "blur(4px)");

        // Add connecting line from max point to label
        labelGroup.append("line")
          .attr("x1", maxXPos + 2)
          .attr("y1", yPos)
          .attr("x2", maxXPos + 12)
          .attr("y2", yPos)
          .style("stroke", "#94a3b8")
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", "2,2");

        // Add the label text (with wrapping)
        labelLines.forEach((line, i) => {
          labelGroup.append("text")
            .attr("x", maxXPos + 15 + labelPadding)
            .attr("y", yPos - (labelLines.length - 1) * 10 + i * 20)
            .attr("dominant-baseline", "middle")
            .style("font-size", isMobile ? "14px" : isTablet ? "15px" : "16px")
            .style("font-weight", "600")
            .style("fill", "#374151")
            .style("font-family", "Roboto Condensed, sans-serif")
            .style("letter-spacing", "-0.025em")
            .text(line);
        });
      }
    });

  }, [data, currentWave, currentPoliticalParty, currentCategory, svgRef, xDomain, title, subtitle, xAxisLabel, chartType, yAxisItems, dataFilter]);
};

