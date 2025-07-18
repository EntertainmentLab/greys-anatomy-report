import { useState, useRef } from 'react'

function FullReportCollapse({ children, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sectionsRef = useRef(null)

  const toggleExpansion = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    if (onToggle) {
      onToggle(newExpanded)
    }
    
    // Scroll to the sections when expanding
    if (newExpanded && sectionsRef.current) {
      setTimeout(() => {
        sectionsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100) // Small delay to ensure DOM updates
    }
  }

  return (
    <div className="full-report-collapse">
      <div className="full-report-trigger" onClick={toggleExpansion}>
        <div className="full-report-content">
          <span className="full-report-text">See Full Report</span>
          <div className={`full-report-arrow ${isExpanded ? 'expanded' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className={`full-report-sections ${isExpanded ? 'expanded' : ''}`}>
        <div className="full-report-sections-content" ref={sectionsRef}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default FullReportCollapse