import React, { useState, useEffect } from 'react'
// CSS imported via main.css

const TableOfContents = ({ integrated = false }) => {
  const [activeSection, setActiveSection] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

const sections = [
  {
    id: 'study-overview',
    title: 'Study Overview',
    selector: 'h1:contains("Study Overview")',
    subsections: [
    ]
  },
  {
    id: 'methodology',
    title: 'Methodology',
    selector: 'h1:contains("Methodology")',
    subsections: [
      {
        id: 'quantitative-methodology',
        title: 'Quantitative',
        selector: 'h2:contains("Quantitative Methodology")'
      },
      {
        id: 'qualitative-methodology',
        title: 'Qualitative',
        selector: 'h2:contains("Qualitative Methodology")'
      }
    ]
  },
  {
    id: 'key-findings',
    title: 'Key Findings',
    selector: 'h1:contains("Key Findings")',
    subsections: [
      {
        id: 'perception-knowledge',
        title: 'Perception and Knowledge',
        selector: 'h2:contains("Perception and Knowledge of Heat Waves")'
      },
      {
        id: 'policy-support',
        title: 'Policy Support',
        selector: 'h2:contains("Policy Support and Healthcare Worker Responsibility")'
      },
      {
        id: 'climate-connections',
        title: 'Climate Change Connections',
        selector: 'h2:contains("Climate Change Connections")'
      },
      {
        id: 'entertainment-value',
        title: 'Entertainment Value',
        selector: 'h2:contains("Impact of the Social Media Campaign on Episode\'s Entertainment Value")'
      }
    ]
  },
  {
    id: 'supplementary-materials',
    title: 'Supplementary Materials',
    selector: 'h1:contains("Supplementary Materials")',
    subsections: []
  }
]

// Function to find element by text content
const findElementByText = (selector) => {
  const tag = selector.split(':')[0]
  const text = selector.match(/contains\("(.+)"\)/)?.[1]

  if (!text) return null

  const elements = document.querySelectorAll(tag)
  return Array.from(elements).find(el => el.textContent.trim().includes(text))
}

// Smooth scroll to section
const scrollToSection = (selector) => {
  const element = findElementByText(selector)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
  }
}

// Track when to show the TOC (after banner)
useEffect(() => {
  if (integrated) return

  const handleScroll = () => {
    const banner = document.querySelector('.banner-container')
    if (banner) {
      const bannerBottom = banner.offsetTop + banner.offsetHeight
      setIsVisible(window.scrollY > bannerBottom - 100)
    }
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll()

  return () => window.removeEventListener('scroll', handleScroll)
}, [integrated])

// Intersection observer to track active section
useEffect(() => {
  const observerOptions = {
    rootMargin: '-100px 0px -60% 0px',
    threshold: 0
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target
        const text = element.textContent.trim()

        // Find matching section
        for (const section of sections) {
          const sectionText = section.selector.match(/contains\("(.+)"\)/)?.[1]
          if (text.includes(sectionText)) {
            setActiveSection(section.id)
            return
          }

          // Check subsections
          if (section.subsections) {
            for (const subsection of section.subsections) {
              const subsectionText = subsection.selector.match(/contains\("(.+)"\)/)?.[1]
              if (text.includes(subsectionText)) {
                setActiveSection(subsection.id)
                return
              }
            }
          }
        }
      }
    })
  }, observerOptions)

  // Observe all headings
  const headings = document.querySelectorAll('h1, h2, h3')
  headings.forEach(heading => observer.observe(heading))

  return () => observer.disconnect()
}, [])

if (integrated) {
  // Original dropdown behavior for integrated mode
  return (
    <div className="toc-container integrated">
      <button
        className="toc-toggle integrated"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle table of contents"
      >
        <span className="toc-icon">☰</span>
        <span className="toc-label">Table of Contents</span>
      </button>

      <nav className={`toc-nav integrated ${isOpen ? 'open' : ''}`}>
        <div className="toc-header">
          <button
            className="toc-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close table of contents"
          >
            ×
          </button>
        </div>

        <ul className="toc-list">
          {sections.map((section) => (
            <li key={section.id} className="toc-item">
              <button
                className={`toc-link ${activeSection === section.id ? 'active' : ''} ${section.subsections ? 'has-subsections' : ''}`}
                onClick={() => scrollToSection(section.selector)}
              >
                {section.title}
                {section.subsections && (
                  <span className="toc-expand-icon">▼</span>
                )}
              </button>

              {section.subsections && (
                <ul className="toc-sublist">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id} className="toc-subitem">
                      <button
                        className={`toc-sublink ${activeSection === subsection.id ? 'active' : ''}`}
                        onClick={() => scrollToSection(subsection.selector)}
                      >
                        {subsection.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

// Fixed sidebar for non-integrated mode
return (
  <div className={`toc-sidebar ${isVisible ? 'visible' : ''}`}>
    <nav className="toc-sidebar-nav">
      <h3 className="toc-sidebar-title">Table of Contents</h3>
      <ul className="toc-list">
        {sections.map((section) => (
          <li key={section.id} className="toc-item">
            <button
              className={`toc-link ${activeSection === section.id ? 'active' : ''} ${section.subsections ? 'has-subsections' : ''}`}
              onClick={() => scrollToSection(section.selector)}
            >
              {section.title}
            </button>

            {section.subsections && (
              <ul className="toc-sublist">
                {section.subsections.map((subsection) => (
                  <li key={subsection.id} className="toc-subitem">
                    <button
                      className={`toc-sublink ${activeSection === subsection.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(subsection.selector)}
                    >
                      {subsection.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </div>
)
}

export default TableOfContents