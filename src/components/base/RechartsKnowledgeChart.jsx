import React, { useMemo, useState, useEffect } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { COLOR_MAP, CONDITION_LABELS, KNOWLEDGE_CATEGORIES, WAVE_LABELS } from '../../constants'

// Custom dot shape with number inside
const CustomizedShape = (props) => {
  const { cx, cy, payload, fill } = props;
  const value = payload.value;
  
  // Only render if we have position data
  if (!cx || !cy || value === undefined) return null;
  
  // Size of the circle (much larger)
  const radius = 15;
  
  return (
    <g>
      {/* Larger circle */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        fill={fill} 
        stroke="white" 
        strokeWidth={2}
      />
      
      {/* Text inside the circle */}
      <text 
        x={cx} 
        y={cy} 
        dy={1} 
        fill="white" 
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {`${Math.round(value)}%`}
      </text>
    </g>
  );
};

// Add a custom SVG line component for connecting dots
const CustomLineConnector = ({ points, color }) => {
  if (!points || points.length < 2) return null;
  
  // Generate the path for the line
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return (
    <path 
      d={pathData}
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeOpacity={0.7}
    />
  );
};

function RechartsKnowledgeChart({ data }) {
  const [currentWave, setCurrentWave] = useState(2);
  const [linePoints, setLinePoints] = useState({});
  const chartRef = React.useRef(null);
  
  // Process and filter the data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { data: [], xMin: 20, xMax: 90, conditionGroups: {} }
    
    console.log('RechartsKnowledgeChart - Raw data:', data.slice(0, 5))
    console.log('RechartsKnowledgeChart - Current wave:', currentWave)
    
    // Filter for current wave and exclude Cancer, and get overall/all political party data
    const filteredData = data.filter(d => {
      const wave = parseInt(d.wave)
      const category = d.category
      const politicalParty = d.political_party
      
      return wave === currentWave && 
             category !== 'Cancer' && 
             (politicalParty === 'All' || politicalParty === 'Overall' || !politicalParty)
    })
    
    console.log('RechartsKnowledgeChart - Filtered data:', filteredData)
    
    // Create an array of data points for each condition and category combination
    const scatterData = []
    
    KNOWLEDGE_CATEGORIES.forEach(category => {
      const categoryData = filteredData.filter(d => d.category === category)
      console.log(`Category ${category} data:`, categoryData)
      
      // Check what conditions we have for this category
      const conditions = [...new Set(categoryData.map(d => d.condition))]
      console.log(`Conditions for ${category}:`, conditions)
      
      categoryData.forEach(d => {
        if (d.condition && !isNaN(d.mean)) {
          // Add slight Y-axis offset for each condition to prevent stacking
          const conditionOffset = {
            'control': -0.001,
            'treatment': 0,
            'handoff': 0.001
          }
          
          scatterData.push({
            category,
            condition: d.condition,
            value: parseFloat(d.mean),
            se: parseFloat(d.se),
            n: parseInt(d.n),
            categoryIndex: KNOWLEDGE_CATEGORIES.indexOf(category),
            // Add numeric Y position with slight offset for each condition
            yPosition: KNOWLEDGE_CATEGORIES.indexOf(category) + (conditionOffset[d.condition] || 0)
          })
        }
      })
    })
    
    console.log('RechartsKnowledgeChart - Scatter data:', scatterData)
    console.log('Unique conditions in scatter data:', [...new Set(scatterData.map(d => d.condition))])
    
    // Calculate min and max values for X axis
    const allValues = scatterData.map(d => d.value);
    const minValue = Math.max(20, Math.floor(Math.min(...allValues)) - 5);
    const maxValue = Math.min(100, Math.ceil(Math.max(...allValues)) + 5);
    
    // Group by condition for tracking
    const conditionGroups = {
      'control': [],
      'treatment': [],
      'handoff': []
    };
    
    // Group points by condition
    scatterData.forEach(entry => {
      if (conditionGroups[entry.condition]) {
        conditionGroups[entry.condition].push(entry);
      }
    });
    
    // Sort each condition array by categoryIndex
    Object.keys(conditionGroups).forEach(condition => {
      conditionGroups[condition].sort((a, b) => a.categoryIndex - b.categoryIndex);
    });
    
    return { 
      data: scatterData, 
      xMin: minValue, 
      xMax: maxValue,
      conditionGroups: conditionGroups
    };
  }, [data, currentWave]);

  // Find dot positions for lines after rendering
  useEffect(() => {
    // Wait for chart to render
    setTimeout(() => {
      // Find all scatter point elements
      if (!chartRef.current) return;
      
      const dotElements = chartRef.current.querySelectorAll('.recharts-scatter-symbol');
      
      // Map them to their data points
      const pointPositions = Array.from(dotElements).map(dot => {
        const cx = parseFloat(dot.getAttribute('cx'));
        const cy = parseFloat(dot.getAttribute('cy'));
        
        // Get the data index from the dot if possible
        const index = dot.getAttribute('data-index') || -1;
        const dataPoint = chartData.data[index] || {};
        
        return {
          x: cx,
          y: cy,
          condition: dataPoint.condition,
          category: dataPoint.category,
          categoryIndex: dataPoint.categoryIndex
        };
      }).filter(p => p.condition && !isNaN(p.x) && !isNaN(p.y));
      
      // Group by condition
      const pointsByCondition = {
        'control': [],
        'treatment': [],
        'handoff': []
      };
      
      pointPositions.forEach(point => {
        if (pointsByCondition[point.condition]) {
          pointsByCondition[point.condition].push(point);
        }
      });
      
      // Sort points by category for each condition
      Object.keys(pointsByCondition).forEach(condition => {
        pointsByCondition[condition].sort((a, b) => a.categoryIndex - b.categoryIndex);
      });
      
      // Set the positions for drawing lines
      setLinePoints(pointsByCondition);
      
    }, 500); // Give chart time to render
  }, [chartData.data]);

  // Custom tooltip - now this will work correctly!
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="recharts-tooltip" style={{
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontSize: '13px',
          fontFamily: 'Roboto Condensed, sans-serif'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#fff' }}>
            {CONDITION_LABELS[data.condition]}
          </p>
          <p style={{ margin: '0 0 4px 0', color: '#e0e0e0' }}>
            {`${data.category}: ${data.value?.toFixed(1)}%`}
          </p>
          {data.n && (
            <p style={{ margin: '0', color: '#c0c0c0', fontSize: '11px' }}>
              {`Sample size: ${data.n}`}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom legend content
  const CustomLegend = () => {
    const legendItems = [
      { condition: 'control', label: CONDITION_LABELS.control, color: COLOR_MAP.control },
      { condition: 'treatment', label: CONDITION_LABELS.treatment, color: COLOR_MAP.treatment },
      { condition: 'handoff', label: CONDITION_LABELS.handoff, color: COLOR_MAP.handoff }
    ]

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '32px', 
        marginTop: '24px',
        marginLeft: '120px', // Align with chart area (left margin)
        marginRight: '80px', // Align with chart area (right margin)
        flexWrap: 'wrap',
        padding: '16px',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {legendItems.map((item) => (
          <div key={item.condition} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151'
          }}>
            <div 
              style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                backgroundColor: item.color,
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (!chartData.data || chartData.data.length === 0) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        color: '#64748b',
        fontFamily: 'Roboto Condensed, sans-serif'
      }}>
        No data available for wave {currentWave}
      </div>
    )
  }

  return (
    <div style={{ 
      marginTop: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      {/* Wave Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '24px',
        marginLeft: '120px', // Align with chart area
        marginRight: '80px', // Align with chart area
        gap: '8px'
      }}>
        <button 
          className={`wave-tab ${currentWave === 2 ? 'active' : ''}`}
          onClick={() => setCurrentWave(2)}
          style={{
            padding: '10px 20px',
            border: `2px solid ${currentWave === 2 ? '#3b82f6' : '#d1d5db'}`,
            backgroundColor: currentWave === 2 ? '#3b82f6' : 'white',
            color: currentWave === 2 ? 'white' : '#374151',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '13px',
            fontFamily: 'Roboto Condensed, sans-serif',
            transition: 'all 0.2s ease',
            boxShadow: currentWave === 2 ? '0 2px 4px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (currentWave !== 2) {
              e.target.style.backgroundColor = '#f3f4f6'
              e.target.style.borderColor = '#9ca3af'
            }
          }}
          onMouseLeave={(e) => {
            if (currentWave !== 2) {
              e.target.style.backgroundColor = 'white'
              e.target.style.borderColor = '#d1d5db'
            }
          }}
        >
          {WAVE_LABELS[2]}
        </button>
        <button 
          className={`wave-tab ${currentWave === 3 ? 'active' : ''}`}
          onClick={() => setCurrentWave(3)}
          style={{
            padding: '10px 20px',
            border: `2px solid ${currentWave === 3 ? '#3b82f6' : '#d1d5db'}`,
            backgroundColor: currentWave === 3 ? '#3b82f6' : 'white',
            color: currentWave === 3 ? 'white' : '#374151',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '13px',
            fontFamily: 'Roboto Condensed, sans-serif',
            transition: 'all 0.2s ease',
            boxShadow: currentWave === 3 ? '0 2px 4px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (currentWave !== 3) {
              e.target.style.backgroundColor = '#f3f4f6'
              e.target.style.borderColor = '#9ca3af'
            }
          }}
          onMouseLeave={(e) => {
            if (currentWave !== 3) {
              e.target.style.backgroundColor = 'white'
              e.target.style.borderColor = '#d1d5db'
            }
          }}
        >
          {WAVE_LABELS[3]}
        </button>
      </div>

      <h4 style={{ 
        textAlign: 'center', 
        marginBottom: '24px', 
        fontFamily: 'Roboto Condensed, sans-serif',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: '120px', // Align with chart area
        marginRight: '80px', // Align with chart area
        letterSpacing: '-0.025em'
      }}>
        Recharts Version - Knowledge Accuracy ({WAVE_LABELS[currentWave]})
      </h4>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 40, right: 80, bottom: 60, left: 120 }}
          ref={chartRef}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeWidth={1} />
          
          {/* X-axis for percentage values */}
          <XAxis 
            type="number" 
            dataKey="value"
            domain={[chartData.xMin, chartData.xMax]}
            tickFormatter={(value) => `${value}%`}
            label={{ 
              value: 'Average Accuracy (%)', 
              position: 'insideBottom', 
              offset: -40,
              style: { textAnchor: 'middle', fontSize: '13px', fontWeight: '500', fill: '#374151' }
            }}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
          />

          {/* Y-axis for categories */}
          <YAxis 
            type="number" 
            dataKey="yPosition"
            domain={[-0.5, KNOWLEDGE_CATEGORIES.length - 0.5]}
            ticks={KNOWLEDGE_CATEGORIES.map((_, index) => index)}
            tickFormatter={(value) => KNOWLEDGE_CATEGORIES[Math.round(value)] || ''}
            tick={{ fontSize: 12, fill: '#374151', fontWeight: '500' }}
            width={100}
            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Custom SVG for lines */}
          <svg>
            {Object.keys(linePoints).map(condition => (
              <CustomLineConnector 
                key={`line-${condition}`}
                points={linePoints[condition]}
                color={COLOR_MAP[condition]} 
              />
            ))}
          </svg>
          
          {/* Scatter with custom shape that includes number inside */}
          <Scatter 
            name="Knowledge"
            data={chartData.data}
            dataKey="value" 
            yAxisId={0}
            shape={<CustomizedShape />}
            zIndex={100}
          >
            {chartData.data?.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLOR_MAP[entry.condition]} 
                data-condition={entry.condition}
                data-category={entry.category}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Custom Legend below the chart */}
      <CustomLegend />
    </div>
  )
}

export default RechartsKnowledgeChart