import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useKnowledgeData } from '../hooks/useKnowledgeData';
import '../styles/components/GreysAnatomyKnowledgeViz.css';

const waves = {
  2: 'Immediately',
  3: '15 Days Later'
};
const conditions = ['control', 'treatment', 'handoff'];
const colors = { control: '#E0BFA5', treatment: '#A4C5A4', handoff: '#6B8E52' };

export default function GreysAnatomyKnowledgeViz() {
  const { data, loading, error } = useKnowledgeData();
  const svgRef = useRef();
  const [active, setActive] = useState(conditions.reduce((m, c) => ({ ...m, [c]: true }), {}));

  useEffect(() => {
    if (!data || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const fullW = 800, fullH = 400;
    const panelW = (fullW - margin.left - margin.right) / 4;
    const panelH = fullH - margin.top - margin.bottom;

    // flatten and nest
    const nested = d3.groups(data, d => d.category);

    // global y-scale
    const allMeans = data.map(d => d.mean);
    const y = d3.scaleLinear()
      .domain([d3.min(allMeans) - 5, d3.max(allMeans) + 5])
      .range([panelH, 0]);

    // x positions for two waves
    const x = d3.scalePoint()
      .domain(Object.values(waves))
      .range([0, panelW]);

    // panels
    const panel = svg
      .attr('width', fullW).attr('height', fullH)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`)
      .selectAll('.panel')
      .data(nested)
      .enter()
      .append('g')
      .attr('class', 'panel')
      .attr('transform', (_, i) => `translate(${i * panelW},0)`);

    // y axis (only first panel)
    panel.filter((_, i) => i === 0)
      .append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text').style('font-size', '14px');

    // wave labels bottom
    panel.append('g')
      .attr('transform', `translate(0,${panelH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text').style('font-size', '14px');

    // category titles
    panel.append('text')
      .attr('class', 'category-title')
      .attr('x', panelW / 2).attr('y', -10)
      .attr('text-anchor', 'middle')
      .text(d => d[0]);

    // lines + circles
    panel.each(function ([cat, values]) {
      const group = d3.select(this);
      conditions.forEach(cond => {
        if (!active[cond]) return;
        const pts = values.filter(d => d.condition === cond);
        if (pts.length < 2) return;
        // line
        group.append('line')
          .attr('x1', x(waves[2]))
          .attr('x2', x(waves[3]))
          .attr('y1', y(pts.find(d => d.wave === 2)?.mean))
          .attr('y2', y(pts.find(d => d.wave === 3)?.mean))
          .attr('stroke', colors[cond])
          .attr('stroke-width', 2);

        // circles
        pts.forEach(datum => {
          group.append('circle')
            .attr('cx', x(waves[datum.wave]))
            .attr('cy', y(datum.mean))
            .attr('r', 5)
            .attr('fill', colors[cond])
            .on('mouseover', function (event) {
              d3.select('.nyt-tooltip')
                .style('opacity', 1)
                .html(`
                  <strong>${datum.category}</strong><br/>
                  Condition: ${cond}<br/>
                  ${waves[datum.wave]}: ${datum.mean.toFixed(1)}%
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
              d3.select('.nyt-tooltip').style('opacity', 0);
            });
        });
      });
    });

    // legend
    const legend = svg.append('g')
      .attr('transform', `translate(${fullW - 150},${margin.top})`);

    conditions.forEach((c, i) => {
      const row = legend.append('g')
        .attr('transform', `translate(0,${i * 20})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setActive(prev => ({ ...prev, [c]: !prev[c] }));
        });
      row.append('rect')
        .attr('width', 12).attr('height', 12)
        .attr('fill', colors[c])
        .attr('opacity', active[c] ? 1 : 0.3);
      row.append('text')
        .attr('x', 16).attr('y', 10)
        .text(c.charAt(0).toUpperCase() + c.slice(1))
        .style('font-size', '14px')
        .style('opacity', active[c] ? 1 : 0.3);
    });

  }, [data, active]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!data || !data.length) return <div>No data available.</div>;

  // Tooltip div (absolute, styled)
  return (
    <div className="viz-container" style={{ position: 'relative' }}>
      <h2>Grey’s Anatomy: Knowledge Retention</h2>
      <svg ref={svgRef} />
      <div
        className="nyt-tooltip"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: 14,
          color: '#222',
          opacity: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 10
        }}
      />
    </div>
  );
}
