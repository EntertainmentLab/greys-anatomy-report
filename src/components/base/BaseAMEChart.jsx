import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useAMEData } from '../../hooks/useAMEData'
import { WAVE_LABELS } from '../../constants'
import { processDataForVisualization } from '../../utils/ameChartUtils'
import AMEBarChart from './AMEBarChart'
import SurveyItemsPopup from '../infographics/SurveyItemsPopup'
import DownloadButton from '../ui/DownloadButton'
import { useChartDownload } from '../../hooks/useChartDownload'

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
  const { chartRef, generateFilename } = useChartDownload(`ame-${className.replace('ame-chart-', '')}`)
  
  // Function to get all available views for download all (copying temporal chart pattern)
  const getAllViews = async () => {
    return [
      { value: 'Immediate', label: WAVE_LABELS[2] },
      { value: '15 Days', label: WAVE_LABELS[3] }
    ]
  }

  // Function to change the view programmatically (copying temporal chart pattern)
  const changeViewForDownload = async (value) => {
    setCurrentWave(value)
    // Wait for state update - same as temporal chart
    await new Promise(resolve => setTimeout(resolve, 100))
  }

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
    <div className={`ame-chart-wrapper ${className}`} ref={chartRef} style={{ position: 'relative' }} {...containerProps}>
      <DownloadButton 
        chartRef={chartRef}
        filename={generateFilename({ wave: currentWave === "Immediate" ? 2 : 3 })}
        position="top-right"
        enableDownloadAll={true}
        getAllViews={getAllViews}
        onViewChange={changeViewForDownload}
      />
      {/* Wave Controls */}
      {showWaveControls && (
        <div className="wave-controls">
          <button 
            className={`wave-tab ${currentWave === "Immediate" ? 'active' : ''}`}
            onClick={() => handleWaveChange("Immediate")}
          >
            {WAVE_LABELS[2]}
          </button>
          <button 
            className={`wave-tab ${currentWave === "15 Days" ? 'active' : ''}`}
            onClick={() => handleWaveChange("15 Days")}
          >
            {WAVE_LABELS[3]}
          </button>
        </div>
      )}
      
      {/* Chart */}
      {chartData.length > 0 ? (
        <AMEBarChart
          data={chartData}
          previousData={previousWaveData.current}
          title={title}
          subtitle={subtitle ? `${subtitle} (${WAVE_LABELS[currentWave === "Immediate" ? 2 : 3]})` : undefined}
          maxValue={0.8}
          onOutcomeClick={handleSurveyItemClick}
        />
      ) : (
        <div className="loading-container">
          <p className="loading-container__text">No data available for {currentWave}</p>
        </div>
      )}

      {/* Survey Items Popup */}
      {surveyPopupOpen && (
        <SurveyItemsPopup
          isOpen={surveyPopupOpen}
          onClose={closeSurveyPopup}
          constructName={selectedConstruct}
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