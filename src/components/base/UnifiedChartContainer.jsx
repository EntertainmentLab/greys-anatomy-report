import React from 'react'
import PropTypes from 'prop-types'
import DownloadButton from '../ui/DownloadButton'
import { WAVE_LABELS } from '../../constants'

/**
 * Unified container for all chart types
 * Provides consistent structure, styling, and controls
 */
const UnifiedChartContainer = ({
  chartRef,
  svgRef,
  filename,
  children,
  // Wave controls
  showWaveControls = false,
  currentWave = null,
  onWaveChange = null,
  availableWaves = [2, 3],
  // Custom controls
  customControls = null,
  // Container props
  className = '',
  style = {}
}) => {
  const containerStyle = {
    position: 'relative',
    maxWidth: '100%',
    ...style
  }

  return (
    <div 
      className={`unified-chart-container ${className}`} 
      ref={chartRef} 
      style={containerStyle}
    >
      {/* Download Button */}
      <DownloadButton 
        chartRef={chartRef}
        filename={filename}
        position="top-right"
      />

      {/* Wave Controls */}
      {showWaveControls && currentWave !== null && onWaveChange && (
        <div className="wave-controls-container">
          <div className="wave-controls">
            {availableWaves.map(wave => (
              <button 
                key={wave}
                className={`wave-tab ${currentWave === wave ? 'active' : ''}`}
                onClick={() => onWaveChange(wave)}
              >
                {WAVE_LABELS[wave]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Controls */}
      {customControls && (
        <div className="custom-controls-container">
          {customControls}
        </div>
      )}

      {/* Chart SVG Container */}
      <div className="chart-svg-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Additional Content */}
      {children}
    </div>
  )
}

UnifiedChartContainer.propTypes = {
  /** Ref for the chart container (used by download button) */
  chartRef: PropTypes.object.isRequired,
  
  /** Ref for the SVG element */
  svgRef: PropTypes.object.isRequired,
  
  /** Filename for downloads */
  filename: PropTypes.string.isRequired,
  
  /** Additional content to render */
  children: PropTypes.node,
  
  /** Whether to show wave controls */
  showWaveControls: PropTypes.bool,
  
  /** Current wave selection */
  currentWave: PropTypes.number,
  
  /** Wave change handler */
  onWaveChange: PropTypes.func,
  
  /** Available waves to show in controls */
  availableWaves: PropTypes.arrayOf(PropTypes.number),
  
  /** Custom controls to render */
  customControls: PropTypes.node,
  
  /** Additional CSS class */
  className: PropTypes.string,
  
  /** Additional inline styles */
  style: PropTypes.object
}

export default UnifiedChartContainer