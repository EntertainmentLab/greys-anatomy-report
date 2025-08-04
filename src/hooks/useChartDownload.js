import { useRef } from 'react'

export const useChartDownload = (baseFilename) => {
  const chartRef = useRef(null)

  const generateFilename = (options = {}) => {
    const parts = [baseFilename]

    // Add wave information
    if (options.wave) {
      const waveMap = {
        1: 'baseline',
        2: 'immediate',
        3: '15-days-later'
      }
      parts.push(waveMap[options.wave] || `wave${options.wave}`)
    }

    // Add condition information
    if (options.condition) {
      parts.push(options.condition.toLowerCase())
    }

    // Add party information
    if (options.party && options.party !== 'Overall') {
      parts.push(options.party.toLowerCase())
    }

    // Add category if specified
    if (options.category) {
      parts.push(options.category.toLowerCase().replace(/\s+/g, '-'))
    }

    // Add timestamp for uniqueness
    const timestamp = new Date().toISOString().slice(0, 10)
    parts.push(timestamp)

    return parts.join('-')
  }

  return {
    chartRef,
    generateFilename
  }
}

