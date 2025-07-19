/**
 * Data Utility Functions
 * 
 * Consolidated utility functions for data processing and manipulation.
 * These functions were previously duplicated across multiple hook files.
 */

/**
 * Deeply flatten a value until it's not an array
 * 
 * This function recursively unwraps nested arrays until it reaches
 * a non-array value or an empty array.
 * 
 * @param {any} val - Value to unwrap
 * @returns {any} The unwrapped value
 * 
 * @example
 * deepUnwrap([[[42]]]) // returns 42
 * deepUnwrap([['hello']]) // returns 'hello'
 * deepUnwrap([]) // returns []
 * deepUnwrap('test') // returns 'test'
 */
export function deepUnwrap(val) {
  while (Array.isArray(val) && val.length > 0) {
    val = val[0]
  }
  return val
}

/**
 * Safely extract numeric value from potentially nested data
 * 
 * @param {any} val - Value to extract number from
 * @param {number} defaultValue - Default value if extraction fails
 * @returns {number} Extracted or default number
 */
export function safeNumeric(val, defaultValue = 0) {
  const unwrapped = deepUnwrap(val)
  const parsed = parseFloat(unwrapped)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely extract string value from potentially nested data
 * 
 * @param {any} val - Value to extract string from  
 * @param {string} defaultValue - Default value if extraction fails
 * @returns {string} Extracted or default string
 */
export function safeString(val, defaultValue = '') {
  const unwrapped = deepUnwrap(val)
  return unwrapped != null ? String(unwrapped) : defaultValue
}

/**
 * Process raw survey data into standardized format
 * 
 * @param {Array} rawData - Raw data array from JSON
 * @param {Object} fieldMap - Mapping of raw field names to standard names
 * @returns {Array} Processed data array
 */
export function processRawData(rawData, fieldMap = {}) {
  if (!Array.isArray(rawData)) {
    console.warn('processRawData: expected array, got', typeof rawData)
    return []
  }

  return rawData.map(item => {
    const processed = {}
    
    // Apply field mapping and unwrapping
    Object.entries(fieldMap).forEach(([rawField, standardField]) => {
      if (item.hasOwnProperty(rawField)) {
        processed[standardField] = deepUnwrap(item[rawField])
      }
    })

    // Copy unmapped fields directly (with unwrapping)
    Object.entries(item).forEach(([key, value]) => {
      if (!fieldMap.hasOwnProperty(key) && !Object.values(fieldMap).includes(key)) {
        processed[key] = deepUnwrap(value)
      }
    })

    return processed
  })
}

/**
 * Validate data structure against expected schema
 * 
 * @param {any} data - Data to validate
 * @param {Object} schema - Expected schema definition
 * @returns {Object} Validation result with isValid and errors
 */
export function validateDataSchema(data, schema) {
  const errors = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors }
  }

  if (data.length === 0) {
    errors.push('Data array is empty')
    return { isValid: false, errors }
  }

  // Check required fields in first item (sample validation)
  const sampleItem = data[0]
  const requiredFields = schema.required || []
  
  requiredFields.forEach(field => {
    if (!sampleItem.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Check field types if specified
  if (schema.fields) {
    Object.entries(schema.fields).forEach(([field, expectedType]) => {
      if (sampleItem.hasOwnProperty(field)) {
        const actualType = typeof sampleItem[field]
        if (actualType !== expectedType) {
          errors.push(`Field ${field}: expected ${expectedType}, got ${actualType}`)
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Filter data by multiple criteria
 * 
 * @param {Array} data - Data array to filter
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered data array
 */
export function filterData(data, filters) {
  if (!Array.isArray(data) || !filters) {
    return data
  }

  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined) {
        return true // Skip null/undefined filters
      }
      
      if (Array.isArray(value)) {
        return value.includes(item[key])
      }
      
      return item[key] === value
    })
  })
}

/**
 * Group data by specified field
 * 
 * @param {Array} data - Data array to group
 * @param {string} groupField - Field to group by
 * @returns {Object} Grouped data object
 */
export function groupBy(data, groupField) {
  if (!Array.isArray(data)) {
    return {}
  }

  return data.reduce((groups, item) => {
    const key = item[groupField]
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Calculate basic statistics for numeric field
 * 
 * @param {Array} data - Data array
 * @param {string} field - Numeric field to analyze
 * @returns {Object} Statistics object
 */
export function calculateStats(data, field) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      mean: null,
      median: null
    }
  }

  const values = data
    .map(item => safeNumeric(item[field]))
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b)

  if (values.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      mean: null,
      median: null
    }
  }

  const count = values.length
  const min = values[0]
  const max = values[count - 1]
  const mean = values.reduce((sum, val) => sum + val, 0) / count
  const median = count % 2 === 0 
    ? (values[Math.floor(count / 2) - 1] + values[Math.floor(count / 2)]) / 2
    : values[Math.floor(count / 2)]

  return {
    count,
    min,
    max,
    mean,
    median
  }
}

/**
 * Convert data to CSV format
 * 
 * @param {Array} data - Data array
 * @param {Array} columns - Column names to include
 * @returns {string} CSV string
 */
export function toCsv(data, columns = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }

  const headers = columns || Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item[header] || ''
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""')
      return escaped.includes(',') ? `"${escaped}"` : escaped
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}

/**
 * Debounce function for performance optimization
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}