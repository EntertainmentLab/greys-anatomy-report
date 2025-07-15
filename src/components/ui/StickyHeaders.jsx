import { useEffect } from 'react'

const StickyHeaders = () => {
  useEffect(() => {
    const headers = document.querySelectorAll('h1, h2, h3')
    
    const observerOptions = {
      root: null,
      rootMargin: '-1px 0px 0px 0px',
      threshold: [0, 1]
    }

    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const header = entry.target
        
        if (entry.boundingClientRect.top <= 1) {
          // Header is at or above the sticky position
          header.classList.add('sticky')
        } else {
          // Header is below the sticky position
          header.classList.remove('sticky')
        }
      })
    }, observerOptions)

    // Observe all headers
    headers.forEach(header => {
      headerObserver.observe(header)
    })

    // Advanced sticky behavior: ensure proper stacking
    const handleScroll = () => {
      const stickyHeaders = document.querySelectorAll('h1.sticky, h2.sticky, h3.sticky')
      
      stickyHeaders.forEach((header, index) => {
        const headerRect = header.getBoundingClientRect()
        const nextHeader = header.nextElementSibling
        
        if (nextHeader && (nextHeader.tagName === 'H1' || nextHeader.tagName === 'H2' || nextHeader.tagName === 'H3')) {
          const nextHeaderRect = nextHeader.getBoundingClientRect()
          
          // If the next header is approaching, start transitioning the current header
          if (nextHeaderRect.top <= headerRect.height + 10) {
            header.style.transform = `translateY(${Math.min(0, nextHeaderRect.top - headerRect.height - 10)}px)`
            header.style.opacity = Math.max(0.3, (nextHeaderRect.top - 10) / headerRect.height)
          } else {
            header.style.transform = 'translateY(-2px)'
            header.style.opacity = '1'
          }
        }
      })
    }

    // Add scroll listener for advanced animations
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      headerObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      
      // Remove all sticky classes
      headers.forEach(header => {
        header.classList.remove('sticky')
        header.style.transform = ''
        header.style.opacity = ''
      })
    }
  }, [])

  return null // This component doesn't render anything
}

export default StickyHeaders