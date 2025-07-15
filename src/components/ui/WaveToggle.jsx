import React from 'react'
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

export default WaveToggle