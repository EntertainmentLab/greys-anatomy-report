/**
 * Domain calculation utilities for chart scales
 * Centralizes common domain calculation patterns to reduce duplication
 */

/**
 * Calculate domain with automatic padding, ensuring zero is included
 * @param {number[]} values - Array of numeric values
 * @param {number} paddingPercent - Padding as percentage (default 0.1 = 10%)
 * @param {number} minPadding - Minimum absolute padding (default 1)
 * @returns {[number, number]} Domain array [min, max]
 */
export const autoWithZero = (values, paddingPercent = 0.1, minPadding = 1) => {
  if (!values || values.length === 0) return [-1, 1]
  
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin
  const padding = Math.max(range * paddingPercent, minPadding)
  
  // Always include 0 in the domain for difference charts
  return [
    Math.min(dataMin - padding, -padding, 0),
    Math.max(dataMax + padding, padding)
  ]
}

/**
 * Calculate domain with automatic padding, without forcing zero inclusion
 * @param {number[]} values - Array of numeric values  
 * @param {number} paddingPercent - Padding as percentage (default 0.1 = 10%)
 * @param {number} minPadding - Minimum absolute padding (default 1)
 * @returns {[number, number]} Domain array [min, max]
 */
export const auto = (values, paddingPercent = 0.1, minPadding = 1) => {
  if (!values || values.length === 0) return [0, 1]
  
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin
  const padding = Math.max(range * paddingPercent, minPadding)
  
  return [dataMin - padding, dataMax + padding]
}

/**
 * Create a symmetric domain around zero
 * @param {number[]} values - Array of numeric values
 * @param {number} paddingPercent - Padding as percentage (default 0.1 = 10%)
 * @returns {[number, number]} Domain array [-max, max]
 */
export const symmetric = (values, paddingPercent = 0.1) => {
  if (!values || values.length === 0) return [-1, 1]
  
  const absMax = Math.max(...values.map(v => Math.abs(v)))
  const paddedMax = absMax * (1 + paddingPercent)
  
  return [-paddedMax, paddedMax]
}

/**
 * Use a fixed domain
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value  
 * @returns {[number, number]} Domain array [min, max]
 */
export const fixed = (min, max) => [min, max]

/**
 * Smart domain selection based on data characteristics and options
 * @param {number[]} values - Array of numeric values
 * @param {Object} options - Configuration object
 * @param {[number, number]} options.fixedDomain - Use this specific domain if provided
 * @param {boolean} options.includeZero - Whether to include zero in domain (default true)
 * @param {boolean} options.symmetric - Whether to create symmetric domain around zero
 * @param {number} options.paddingPercent - Padding percentage (default 0.1)
 * @param {number} options.minPadding - Minimum absolute padding (default 1)
 * @returns {[number, number]} Domain array [min, max]
 */
export const smart = (values, options = {}) => {
  const {
    fixedDomain,
    includeZero = true,
    symmetric: useSymmetric = false,
    paddingPercent = 0.1,
    minPadding = 1
  } = options
  
  // Use fixed domain if provided
  if (fixedDomain) {
    return fixedDomain
  }
  
  // Use symmetric domain if requested
  if (useSymmetric) {
    return symmetric(values, paddingPercent)
  }
  
  // Use auto with or without zero inclusion
  if (includeZero) {
    return autoWithZero(values, paddingPercent, minPadding)
  } else {
    return auto(values, paddingPercent, minPadding)
  }
}

/**
 * Helper to extract values from common data structures
 * @param {Array} data - Data array
 * @param {string} field - Field name to extract (default 'mean')
 * @returns {number[]} Array of numeric values
 */
export const extractValues = (data, field = 'mean') => {
  if (!data || !Array.isArray(data)) return []
  return data.map(d => d[field]).filter(v => v != null && !isNaN(v))
}

// Export all functions as default object for convenience
export default {
  autoWithZero,
  auto, 
  symmetric,
  fixed,
  smart,
  extractValues
}