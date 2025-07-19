import { useState, useRef, useCallback } from 'react'

/**
 * useWaveControl - Shared hook for wave state management
 * 
 * This hook standardizes wave control behavior across all chart components,
 * ensuring consistent wave transitions, data storage, and state management.
 * 
 * @param {string} defaultWave - Initial wave value (default: "Immediate")
 * @param {Function} dataProcessor - Optional function to process data on wave change
 * @returns {Object} Wave control state and handlers
 */
export function useWaveControl(defaultWave = "Immediate", dataProcessor = null) {
  const [currentWave, setCurrentWave] = useState(defaultWave)
  const previousWaveData = useRef(null)
  const previousWave = useRef(defaultWave)

  /**
   * Handle wave transition with optional data storage
   * @param {string} newWave - The wave to transition to
   * @param {Array} currentData - Current data to store before transition
   */
  const handleWaveChange = useCallback((newWave, currentData = null) => {
    if (newWave === currentWave) return

    // Store current wave data if provided and processor exists
    if (currentData && dataProcessor) {
      previousWaveData.current = dataProcessor(currentData)
    }

    previousWave.current = currentWave
    setCurrentWave(newWave)
  }, [currentWave, dataProcessor])

  /**
   * Reset to default wave
   */
  const resetWave = useCallback(() => {
    previousWaveData.current = null
    previousWave.current = defaultWave
    setCurrentWave(defaultWave)
  }, [defaultWave])

  /**
   * Get wave transition info
   * @returns {Object} Information about the wave transition
   */
  const getTransitionInfo = useCallback(() => {
    return {
      hasTransitioned: previousWave.current !== currentWave,
      fromWave: previousWave.current,
      toWave: currentWave,
      hasPreviousData: previousWaveData.current !== null
    }
  }, [currentWave])

  return {
    // State
    currentWave,
    previousWave: previousWave.current,
    previousWaveData: previousWaveData.current,
    
    // Actions
    handleWaveChange,
    resetWave,
    setCurrentWave,
    
    // Computed
    getTransitionInfo,
    
    // Utilities
    isWaveActive: useCallback((wave) => currentWave === wave, [currentWave]),
    hasWaveChanged: useCallback((wave) => previousWave.current === wave && currentWave !== wave, [currentWave])
  }
}

/**
 * Wave value standardization utilities
 */
export const WAVE_VALUES = {
  BASELINE: "Baseline",
  IMMEDIATE: "Immediate", 
  FOLLOW_UP: "15 Days"
}

/**
 * Convert numeric wave values to standardized strings
 * @param {number|string} waveValue - Wave value to convert
 * @returns {string} Standardized wave string
 */
export function normalizeWaveValue(waveValue) {
  const waveMap = {
    1: WAVE_VALUES.BASELINE,
    2: WAVE_VALUES.IMMEDIATE,
    3: WAVE_VALUES.FOLLOW_UP,
    "1": WAVE_VALUES.BASELINE,
    "2": WAVE_VALUES.IMMEDIATE,
    "3": WAVE_VALUES.FOLLOW_UP
  }
  
  return waveMap[waveValue] || waveValue
}

/**
 * Get display label for wave value
 * @param {string} waveValue - Wave value
 * @returns {string} Display-friendly label
 */
export function getWaveLabel(waveValue) {
  const labelMap = {
    [WAVE_VALUES.BASELINE]: "Baseline (Wave 1)",
    [WAVE_VALUES.IMMEDIATE]: "Immediate (Wave 2)", 
    [WAVE_VALUES.FOLLOW_UP]: "15 Days Later (Wave 3)"
  }
  
  return labelMap[waveValue] || waveValue
}

/**
 * Validate wave value
 * @param {string} waveValue - Wave value to validate
 * @returns {boolean} Whether the wave value is valid
 */
export function isValidWave(waveValue) {
  return Object.values(WAVE_VALUES).includes(waveValue)
}