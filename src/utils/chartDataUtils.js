/**
 * Standardized data processing utilities for all chart types
 * Ensures consistent data interface across the application
 */

/**
 * Normalizes data to standard chart format
 * @param {Array} rawData - Raw data from API/hooks
 * @returns {Array} Normalized data with consistent structure
 */
export const normalizeChartData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return []

  return rawData.map(item => ({
    condition: extractValue(item, 'condition'),
    category: extractValue(item, 'category'),
    mean: parseFloat(extractValue(item, 'mean')) || 0,
    se: parseFloat(extractValue(item, 'se')) || 0,
    n: parseInt(extractValue(item, 'n'), 10) || 0,
    wave: parseInt(extractValue(item, 'wave'), 10) || 1,
    political_party: extractValue(item, 'political_party'),
    // Preserve any additional fields
    ...item
  })).filter(item => {
    // Filter out entries with invalid values
    return !isNaN(item.mean) && !isNaN(item.se) && 
           item.mean !== null && item.se !== null && 
           isFinite(item.mean) && isFinite(item.se)
  })
}

/**
 * Safely extracts values from potentially nested data structures
 */
const extractValue = (item, key) => {
  if (!item || !item[key]) return undefined
  
  const value = item[key]
  
  // Handle direct values
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  
  // Handle single-level arrays
  if (Array.isArray(value) && !Array.isArray(value[0])) {
    return value[0]
  }
  
  // Handle nested arrays
  if (Array.isArray(value) && Array.isArray(value[0])) {
    return value[0][0]
  }
  
  return undefined
}

/**
 * Filters data by wave and other criteria
 * @param {Array} data - Normalized chart data
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered data
 */
export const filterChartData = (data, filters = {}) => {
  if (!data || !Array.isArray(data)) return []

  return data.filter(item => {
    // Wave filter
    if (filters.wave !== undefined && item.wave !== filters.wave) {
      return false
    }
    
    // Political party filter
    if (filters.political_party && item.political_party !== filters.political_party) {
      return false
    }
    
    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false
    }
    
    // Condition filter
    if (filters.condition && item.condition !== filters.condition) {
      return false
    }
    
    // Custom filter function
    if (filters.customFilter && !filters.customFilter(item)) {
      return false
    }
    
    return true
  })
}

/**
 * Calculates differences from control group
 * @param {Array} data - Filtered chart data
 * @param {Array} categories - Categories to process
 * @returns {Array} Data with differences calculated
 */
export const calculateDifferences = (data, categories) => {
  if (!data || !Array.isArray(data) || !categories) return []

  const differenceData = []
  
  categories.forEach(category => {
    const categoryData = data.filter(d => d.category === category)
    const controlPoint = categoryData.find(d => d.condition === 'control')
    
    if (!controlPoint) return // Skip if no control data
    
    // Calculate differences for treatment and handoff
    ['treatment', 'handoff'].forEach(condition => {
      const conditionPoint = categoryData.find(d => d.condition === condition)
      if (conditionPoint) {
        const difference = conditionPoint.mean - controlPoint.mean
        // Calculate standard error for difference (assuming independence)
        const diffSE = Math.sqrt(Math.pow(conditionPoint.se, 2) + Math.pow(controlPoint.se, 2))
        
        differenceData.push({
          ...conditionPoint,
          mean: difference,
          se: diffSE,
          originalMean: conditionPoint.mean,
          controlMean: controlPoint.mean,
          category: category
        })
      }
    })
  })
  
  return differenceData
}

/**
 * Calculates domain (min/max) for chart scales
 * @param {Array} data - Chart data
 * @param {Object} options - Domain calculation options
 * @returns {Array} [min, max] domain values
 */
export const calculateDomain = (data, options = {}) => {
  if (!data || data.length === 0) return [0, 1]

  const {
    padding = 0.1,
    includeZero = true,
    customDomain = null
  } = options

  if (customDomain) return customDomain

  const values = data.map(d => d.mean)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  
  const range = dataMax - dataMin
  const paddingValue = Math.max(range * padding, 0.05)
  
  let domainMin = dataMin - paddingValue
  let domainMax = dataMax + paddingValue
  
  if (includeZero) {
    domainMin = Math.min(domainMin, 0)
    domainMax = Math.max(domainMax, 0)
  }
  
  return [domainMin, domainMax]
}

/**
 * Groups data by a specified field
 * @param {Array} data - Chart data
 * @param {string} groupBy - Field to group by
 * @returns {Object} Grouped data
 */
export const groupDataBy = (data, groupBy) => {
  if (!data || !Array.isArray(data)) return {}
  
  return data.reduce((groups, item) => {
    const key = item[groupBy]
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Creates tooltip content for chart data points
 * @param {Object} dataPoint - Single data point
 * @param {Object} options - Formatting options
 * @returns {string} HTML content for tooltip
 */
export const createTooltipContent = (dataPoint, options = {}) => {
  const {
    showDifference = false,
    precision = 1,
    unit = '',
    showConfidenceInterval = true,
    showSampleSize = true
  } = options

  let content = `<strong>${dataPoint.condition}</strong><br/>`
  content += `${dataPoint.category}<br/>`
  
  if (showDifference && dataPoint.originalMean !== undefined) {
    const valueText = dataPoint.mean >= 0 ? `+${dataPoint.mean.toFixed(precision)}` : `${dataPoint.mean.toFixed(precision)}`
    content += `Difference: ${valueText}${unit}<br/>`
    content += `Treatment: ${dataPoint.originalMean.toFixed(precision)}${unit}<br/>`
    content += `Control: ${dataPoint.controlMean.toFixed(precision)}${unit}<br/>`
  } else {
    content += `Value: ${dataPoint.mean.toFixed(precision)}${unit}<br/>`
  }
  
  if (showConfidenceInterval && dataPoint.se) {
    const ciLower = (dataPoint.mean - 1.96 * dataPoint.se).toFixed(precision)
    const ciUpper = (dataPoint.mean + 1.96 * dataPoint.se).toFixed(precision)
    content += `95% CI: [${ciLower}, ${ciUpper}]${unit}<br/>`
  }
  
  if (showSampleSize && dataPoint.n) {
    content += `N = ${dataPoint.n}`
  }
  
  return content
}