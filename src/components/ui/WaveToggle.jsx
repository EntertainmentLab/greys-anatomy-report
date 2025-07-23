import React from 'react'
import PropTypes from 'prop-types'
// CSS imported via main.css

const WaveToggle = ({ currentWave, onWaveChange, className = '' }) => {
  const isImmediate = currentWave === "Immediate"
  
  return (
    <div className={`wave-toggle-container ${className}`}>
      <div className="wave-toggle-track" onClick={() => onWaveChange(isImmediate ? "15 Days" : "Immediate")}>
        <div className={`wave-toggle-slider ${isImmediate ? 'immediate' : 'delayed'}`}></div>
        <div className="wave-toggle-labels">
          <span className={`wave-toggle-label ${isImmediate ? 'active' : ''}`}>Immediate</span>
          <span className={`wave-toggle-label ${!isImmediate ? 'active' : ''}`}>15 Days</span>
        </div>
      </div>
    </div>
  )
}

WaveToggle.propTypes = {
  /** Current wave value */
  currentWave: PropTypes.string.isRequired,
  
  /** Function to call when wave changes */
  onWaveChange: PropTypes.func.isRequired,
  
  /** Additional CSS class names */
  className: PropTypes.string
}

export default WaveToggle