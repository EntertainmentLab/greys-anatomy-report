import { useState } from 'react'
import domtoimage from 'dom-to-image-more'

// Standard download icon as SVG component (single download)
const DownloadIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// Download all icon (multiple pages/stack)
const DownloadAllIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Stack of pages */}
    <rect x="6" y="2" width="12" height="16" rx="1" />
    <rect x="9" y="5" width="12" height="16" rx="1" fill="white" stroke="currentColor" />
    {/* Download arrow on top */}
    <polyline points="12 10 15 13 18 10" />
    <line x1="15" y1="13" x2="15" y2="8" />
  </svg>
)

const DownloadButton = ({
  chartRef,
  filename = 'chart',
  className = '',
  buttonText = null,
  position = 'top-right',
  enableDownloadAll = false,
  getAllViews = null,
  onViewChange = null
}) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const captureChart = async (node) => {
    // Hide UI elements - be more aggressive with dropdowns and controls
    const elementsToHide = node.querySelectorAll('.download-chart-btn, .download-buttons-container, .wave-controls, .wave-controls-container, .custom-controls-container, .info-button, .construct-dropdown, select, label, .dropdown, .control-group, .form-group, .controls-container')
    const originalDisplay = new Map()
    
    elementsToHide.forEach(elem => {
      originalDisplay.set(elem, elem.style.display)
      elem.style.display = 'none'
    })

    // Fix chart container sizing and positioning for all unified containers
    const isUnifiedChart = node.classList.contains('unified-chart-container') || 
                         node.classList.contains('temporal-chart-container')
    const originalContainerStyles = new Map()
    
    if (isUnifiedChart) {
      // Store and fix container styles
      const originalContainerStyle = node.getAttribute('style') || ''
      originalContainerStyles.set(node, originalContainerStyle)
      
      // Find and fix the SVG container
      const svgContainer = node.querySelector('.chart-svg-container')
      const svg = node.querySelector('svg')
      
      if (svgContainer) {
        const originalSvgContainerStyle = svgContainer.getAttribute('style') || ''
        originalContainerStyles.set(svgContainer, originalSvgContainerStyle)
        svgContainer.style.margin = '0'
        svgContainer.style.padding = '20px'
        svgContainer.style.width = 'auto'
        svgContainer.style.maxWidth = 'none'
      }
      
      if (svg) {
        const originalSvgStyle = svg.getAttribute('style') || ''
        originalContainerStyles.set(svg, originalSvgStyle)
        svg.style.display = 'block'
        svg.style.margin = '0 auto'
      }
    }

    // Fix legend spacing and centering
    const legendItems = node.querySelectorAll('.legend-item')
    const legend = node.querySelector('.legend')
    const originalTransforms = new Map()
    const originalLegendTransform = legend ? legend.getAttribute('transform') : null
    
    legendItems.forEach((item, index) => {
      const currentTransform = item.getAttribute('transform') || ''
      originalTransforms.set(item, currentTransform)
      
      // Increase spacing between legend items to prevent overlap
      const baseSpacing = 180 // Increase from default spacing
      const newTransform = `translate(${-150 + (index * baseSpacing)}, 0)`
      item.setAttribute('transform', newTransform)
    })
    
    // For unified charts, center the legend properly
    if (legend && isUnifiedChart) {
      const svgWidth = node.querySelector('svg')?.getAttribute('width') || 800
      const centerX = svgWidth / 2
      // Extract y position from existing transform
      const currentTransform = legend.getAttribute('transform') || 'translate(0, 0)'
      const yMatch = currentTransform.match(/translate\([^,]+,\s*([^)]+)\)/)
      const yPos = yMatch ? yMatch[1] : '0'
      legend.setAttribute('transform', `translate(${centerX}, ${yPos})`)
    }

    // Apply minimal inline styles to fix font issues
    const textElements = node.querySelectorAll('text, span, div')
    const originalStyles = new Map()
    
    textElements.forEach(elem => {
      if (elem.style.display === 'none') return // Skip hidden elements
      
      const computedStyle = window.getComputedStyle(elem)
      const currentStyle = elem.getAttribute('style') || ''
      originalStyles.set(elem, currentStyle)
      
      let inlineStyle = currentStyle
      
      // Force specific fixes
      if (elem.textContent && elem.textContent.includes('Effect Size')) {
        inlineStyle += '; white-space: nowrap; font-family: "Roboto Condensed", sans-serif'
      }
      
      // Minimal legend text fixes
      if (elem.tagName === 'text') {
        inlineStyle += '; font-family: "Roboto Condensed", sans-serif'
      }
      
      elem.setAttribute('style', inlineStyle)
    })
    
    // Options for better quality  
    const options = {
      quality: 1,
      bgcolor: '#ffffff',
      width: node.offsetWidth * 2,
      height: node.offsetHeight * 2,
      style: {
        transform: 'scale(2)',
        transformOrigin: 'top left'
      },
      filter: (domNode) => {
        return !domNode.classList || 
               (!domNode.classList.contains('download-chart-btn') && 
                !domNode.classList.contains('download-buttons-container'))
      },
      // Try to handle CORS font issues
      useCORS: true,
      allowTaint: false
    }

    // Small delay to ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const dataUrl = await domtoimage.toPng(node, options)
    
    // Restore original styles
    textElements.forEach(elem => {
      const originalStyle = originalStyles.get(elem)
      if (originalStyle !== undefined) {
        elem.setAttribute('style', originalStyle)
      }
    })
    
    // Restore legend transforms
    legendItems.forEach(item => {
      const originalTransform = originalTransforms.get(item)
      if (originalTransform !== undefined) {
        item.setAttribute('transform', originalTransform)
      }
    })
    
    // Restore legend centering for temporal charts
    if (legend && originalLegendTransform !== null) {
      legend.setAttribute('transform', originalLegendTransform)
    }
    
    // Restore container styles for unified charts
    if (isUnifiedChart) {
      originalContainerStyles.forEach((originalStyle, element) => {
        if (originalStyle) {
          element.setAttribute('style', originalStyle)
        } else {
          element.removeAttribute('style')
        }
      })
    }
    
    // Restore hidden elements
    elementsToHide.forEach(elem => {
      const display = originalDisplay.get(elem)
      elem.style.display = display || ''
    })

    return dataUrl
  }

  const handleDownload = async () => {
    if (!chartRef.current) return

    setIsDownloading(true)

    try {
      const dataUrl = await captureChart(chartRef.current)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error('Error downloading chart:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAll = async () => {
    if (!chartRef.current || !getAllViews) return

    setIsDownloadingAll(true)

    try {
      const views = await getAllViews()
      const images = []
      
      // Extract base name without date (remove date suffix if present)
      const baseNameParts = filename.split('-')
      const datePattern = /^\d{4}-\d{2}-\d{2}$/
      const baseName = baseNameParts
        .filter(part => !datePattern.test(part))
        .join('-')
      
      for (const view of views) {
        // Change the view
        if (onViewChange) {
          await onViewChange(view.value)
          // Wait for chart to re-render
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Capture the chart
        const dataUrl = await captureChart(chartRef.current)
        images.push({
          name: view.label || view.value,
          dataUrl: dataUrl
        })
      }

      // Download all images
      for (let i = 0; i < images.length; i++) {
        const link = document.createElement('a')
        // Create clean filename: baseName-viewName.png
        const viewName = images[i].name.replace(/\s+/g, '-').toLowerCase()
        // Skip "overall-composite" suffix for cleaner names
        const cleanViewName = viewName === 'overall-composite' ? 'overall' : viewName
        link.download = `${baseName}-${cleanViewName}.png`
        link.href = images[i].dataUrl
        
        // Add delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 100))
        link.click()
      }

    } catch (error) {
      console.error('Error downloading all charts:', error)
    } finally {
      setIsDownloadingAll(false)
    }
  }

  const positionStyles = {
    'top-right': { top: '8px', right: '8px' },
    'top-left': { top: '8px', left: '8px' },
    'bottom-right': { bottom: '8px', right: '8px' },
    'bottom-left': { bottom: '8px', left: '8px' }
  }

  const buttonStyles = {
    padding: '6px 8px',
    backgroundColor: '#008542',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }

  const containerStyles = {
    position: 'absolute',
    ...positionStyles[position],
    zIndex: 10,
    display: 'flex',
    gap: '4px',
    flexDirection: 'row'
  }

  // If only single download is needed
  if (!enableDownloadAll || !getAllViews) {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`download-chart-btn ${className}`}
        title="Download chart as PNG"
        style={{
          ...buttonStyles,
          position: 'absolute',
          ...positionStyles[position],
          zIndex: 10,
          opacity: isDownloading ? 0.5 : 1,
          cursor: isDownloading ? 'wait' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isDownloading) {
            e.target.style.backgroundColor = '#006633'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDownloading) {
            e.target.style.backgroundColor = '#008542'
          }
        }}
      >
        {isDownloading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>...</span>
          </span>
        ) : (
          <>
            <DownloadIcon />
            {buttonText && <span>{buttonText}</span>}
          </>
        )}
      </button>
    )
  }

  // If download all is enabled, show both buttons
  return (
    <div className="download-buttons-container" style={containerStyles}>
      <button
        onClick={handleDownload}
        disabled={isDownloading || isDownloadingAll}
        className="download-chart-btn"
        title="Download current view"
        style={{
          ...buttonStyles,
          opacity: (isDownloading || isDownloadingAll) ? 0.5 : 1,
          cursor: (isDownloading || isDownloadingAll) ? 'wait' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isDownloading && !isDownloadingAll) {
            e.target.style.backgroundColor = '#006633'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDownloading && !isDownloadingAll) {
            e.target.style.backgroundColor = '#008542'
          }
        }}
      >
        {isDownloading ? '...' : <DownloadIcon />}
      </button>
      
      <button
        onClick={handleDownloadAll}
        disabled={isDownloading || isDownloadingAll}
        className="download-all-btn"
        title="Download all views"
        style={{
          ...buttonStyles,
          opacity: (isDownloading || isDownloadingAll) ? 0.5 : 1,
          cursor: (isDownloading || isDownloadingAll) ? 'wait' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isDownloading && !isDownloadingAll) {
            e.target.style.backgroundColor = '#006633'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDownloading && !isDownloadingAll) {
            e.target.style.backgroundColor = '#008542'
          }
        }}
      >
        {isDownloadingAll ? '...' : <DownloadAllIcon />}
      </button>
    </div>
  )
}

export default DownloadButton