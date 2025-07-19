import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useAMEData } from '../../hooks/useAMEData'
import { WAVE_LABELS } from '../../constants'
import { processDataForVisualization } from '../../utils/ameChartUtils'
import AMEBarChart from './AMEBarChart'
import SurveyItemsPopup from '../infographics/SurveyItemsPopup'

/**
 * BaseAMEChart - Shared component for all AME chart implementations
 * 
 * This component consolidates the duplicate logic from AMEChart1, AMEChart2, and AMEChart3
 * into a single, configurable component that handles wave management, data processing,
 * and popup interactions.
 */
function BaseAMEChart({ 
  outcomeMapping, 
  dataOutcomes, 
  title, 
  subtitle,
  description,
  className = '',
  defaultWave = "Immediate",
  showWaveControls = true,
  containerProps = {}
}) {
  const { ameData, loading, error } = useAMEData()
  const [currentWave, setCurrentWave] = useState(defaultWave)
  const [surveyPopupOpen, setSurveyPopupOpen] = useState(false)
  const [selectedConstruct, setSelectedConstruct] = useState('')
  const previousWaveData = useRef(null)
  const previousWave = useRef(defaultWave)

  // Process data for current wave
  const chartData = React.useMemo(() => {
    if (!ameData || ameData.length === 0) return []
    const waveData = ameData.filter(item => item.wave === currentWave)
    return processDataForVisualization(waveData, outcomeMapping, dataOutcomes)
  }, [ameData, currentWave, outcomeMapping, dataOutcomes])

  // Handle wave transition with previous data storage
  const handleWaveChange = (newWave) => {
    if (newWave === currentWave) return
    
    // Store current wave data before changing
    if (ameData && ameData.length > 0) {
      const currentWaveData = ameData.filter(item => item.wave === currentWave)
      previousWaveData.current = processDataForVisualization(currentWaveData, outcomeMapping, dataOutcomes)
    }
    
    previousWave.current = currentWave
    setCurrentWave(newWave)
  }

  // Handle survey item popup
  const handleSurveyItemClick = (construct) => {
    setSelectedConstruct(construct)
    setSurveyPopupOpen(true)
  }

  const closeSurveyPopup = () => {
    setSurveyPopupOpen(false)
    setSelectedConstruct('')
  }

  // Loading state
  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading-container">
          <div className="loading-container__spinner" />
          <p className="loading-container__text">Loading chart data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="chart-container">
        <div className="error-container">
          <div className="error-container__icon">⚠️</div>
          <p className="error-container__text">
            Error loading chart data: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`chart-container ${className}`} {...containerProps}>
      {/* Chart Header */}
      <div className="chart-container__header">
        <div>
          {title && (
            <h3 className="chart-container__title">{title}</h3>
          )}
          {subtitle && (
            <p className="chart-container__subtitle">{subtitle}</p>
          )}
        </div>
        
        {/* Wave Controls */}
        {showWaveControls && (
          <div className="chart-container__controls">
            <div className="wave-controls">
              {Object.entries(WAVE_LABELS).map(([waveKey, waveLabel]) => (
                <button
                  key={waveKey}
                  className={`wave-controls__tab ${currentWave === waveLabel ? 'wave-controls__tab--active' : ''}`}
                  onClick={() => handleWaveChange(waveLabel)}
                  aria-pressed={currentWave === waveLabel}
                >
                  {waveLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="chart-container__description">
          <p>{description}</p>
        </div>
      )}

      {/* Chart Body */}
      <div className="chart-container__body">
        {chartData.length > 0 ? (
          <AMEBarChart
            data={chartData}
            currentWave={currentWave}
            previousWaveData={previousWaveData.current}
            previousWave={previousWave.current}
            onSurveyItemClick={handleSurveyItemClick}
            outcomeMapping={outcomeMapping}
          />
        ) : (
          <div className="loading-container">
            <p className="loading-container__text">No data available for {currentWave}</p>
          </div>
        )}
      </div>

      {/* Survey Items Popup */}
      {surveyPopupOpen && (
        <SurveyItemsPopup
          isOpen={surveyPopupOpen}
          onClose={closeSurveyPopup}
          construct={selectedConstruct}
        />
      )}
    </div>
  )
}

BaseAMEChart.propTypes = {
  /** Mapping of data outcome keys to display labels */
  outcomeMapping: PropTypes.objectOf(PropTypes.string).isRequired,
  
  /** Array of data outcome keys to display */
  dataOutcomes: PropTypes.arrayOf(PropTypes.string).isRequired,
  
  /** Optional title for the chart */
  title: PropTypes.string,
  
  /** Optional subtitle for the chart */
  subtitle: PropTypes.string,
  
  /** Optional description text */
  description: PropTypes.string,
  
  /** Additional CSS class names */
  className: PropTypes.string,
  
  /** Default wave to display */
  defaultWave: PropTypes.string,
  
  /** Whether to show wave controls */
  showWaveControls: PropTypes.bool,
  
  /** Additional props to pass to container div */
  containerProps: PropTypes.object
}

export default BaseAMEChart