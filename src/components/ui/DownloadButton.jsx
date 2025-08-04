import { useState } from 'react'
import domtoimage from 'dom-to-image-more'

const DownloadButton = ({
  chartRef,
  filename = 'chart',
  className = '',
  buttonText = '⬇',
  position = 'top-right'
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!chartRef.current) return

    setIsDownloading(true)

    try {
      const node = chartRef.current

      // Hide UI elements - be more aggressive with dropdowns and controls
      const elementsToHide = node.querySelectorAll('.download-chart-btn, .wave-controls, .wave-controls-container, .custom-controls-container, .info-button, .construct-dropdown, select, label, .dropdown, .control-group, .form-group, .controls-container')
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
      
      // Don't modify temporal chart container - it was breaking the layout
      
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
          return !domNode.classList || !domNode.classList.contains('download-chart-btn')
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

  const positionStyles = {
    'top-right': { top: '8px', right: '8px' },
    'top-left': { top: '8px', left: '8px' },
    'bottom-right': { bottom: '8px', right: '8px' },
    'bottom-left': { bottom: '8px', left: '8px' }
  }

  const buttonStyles = {
    position: 'absolute',
    ...positionStyles[position],
    zIndex: 10,
    padding: '4px 8px',
    backgroundColor: isDownloading ? '#005BBB' : '#005BBB',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    border: 'none',
    opacity: isDownloading ? 0.5 : 1,
    cursor: isDownloading ? 'wait' : 'pointer',
    transition: 'background-color 0.2s ease'
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`download-chart-btn ${className}`}
      title="Download chart as PNG"
      style={buttonStyles}
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
      {isDownloading ? '...' : buttonText}
    </button>
  )
}

export default DownloadButton

