import { useState, useEffect, useCallback } from 'react'

/**
 * useDataLoader - Standardized data loading hook
 * 
 * This hook provides consistent loading, error handling, and retry logic
 * across all data-fetching components in the application.
 * 
 * @param {string|Function} dataSource - URL string or async function that returns data
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state, data, error, and control functions
 */
export function useDataLoader(dataSource, options = {}) {
  const {
    immediate = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    transform = null
  } = options

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
    attempt: 0,
    lastFetch: null
  })

  /**
   * Fetch data with retry logic
   */
  const fetchData = useCallback(async (attempt = 1) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        attempt 
      }))

      let result
      if (typeof dataSource === 'function') {
        result = await dataSource()
      } else if (typeof dataSource === 'string') {
        const response = await fetch(dataSource)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        result = await response.json()
      } else {
        throw new Error('Invalid data source: must be URL string or async function')
      }

      // Transform data if transformer provided
      const finalData = transform ? transform(result) : result

      setState(prev => ({
        ...prev,
        data: finalData,
        loading: false,
        error: null,
        lastFetch: new Date().toISOString()
      }))

      // Call success callback
      if (onSuccess) {
        onSuccess(finalData)
      }

      return finalData

    } catch (error) {
      console.error(`Data loading attempt ${attempt} failed:`, error)

      // Retry if attempts remaining
      if (attempt < retryAttempts) {
        setTimeout(() => {
          fetchData(attempt + 1)
        }, retryDelay * attempt) // Exponential backoff
        return
      }

      // Final failure
      const errorMessage = error.message || 'Failed to load data'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      // Call error callback
      if (onError) {
        onError(error)
      }

      throw error
    }
  }, [dataSource, retryAttempts, retryDelay, onSuccess, onError, transform])

  /**
   * Retry data loading
   */
  const retry = useCallback(() => {
    fetchData(1)
  }, [fetchData])

  /**
   * Refresh data (alias for retry)
   */
  const refresh = retry

  /**
   * Clear data and reset state
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      attempt: 0,
      lastFetch: null
    })
  }, [])

  // Initial load
  useEffect(() => {
    if (immediate && dataSource) {
      fetchData(1)
    }
  }, [immediate, fetchData])

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    attempt: state.attempt,
    lastFetch: state.lastFetch,
    
    // Computed state
    hasData: state.data !== null,
    hasError: state.error !== null,
    isRetrying: state.attempt > 1,
    
    // Actions
    fetchData: () => fetchData(1),
    retry,
    refresh,
    reset
  }
}

/**
 * useJsonLoader - Specialized hook for loading JSON data
 * 
 * @param {string} url - JSON file URL
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and data
 */
export function useJsonLoader(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${import.meta.env.BASE_URL}${url}`
  
  return useDataLoader(fullUrl, {
    ...options,
    transform: options.transform || ((data) => data)
  })
}

/**
 * useProcessedData - Hook for data that requires processing
 * 
 * @param {string|Function} dataSource - Data source
 * @param {Function} processor - Data processing function
 * @param {Array} dependencies - Dependencies that trigger reprocessing
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and processed data
 */
export function useProcessedData(dataSource, processor, dependencies = [], options = {}) {
  const { data: rawData, ...loaderState } = useDataLoader(dataSource, {
    ...options,
    immediate: false
  })

  const [processedData, setProcessedData] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Process data when raw data or dependencies change
  useEffect(() => {
    if (!rawData || !processor) {
      setProcessedData(null)
      return
    }

    setProcessing(true)
    
    try {
      const result = processor(rawData, ...dependencies)
      setProcessedData(result)
    } catch (error) {
      console.error('Data processing failed:', error)
      setProcessedData(null)
    } finally {
      setProcessing(false)
    }
  }, [rawData, processor, ...dependencies])

  return {
    ...loaderState,
    data: processedData,
    rawData,
    processing,
    loading: loaderState.loading || processing
  }
}