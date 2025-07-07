import { useEffect } from 'react'

function PleaseRotatePrompt() {
  useEffect(() => {
    // Check if mobile device
    const isMobile = typeof window !== 'undefined' && 
      /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    
    if (!isMobile) return

    // Load pleaserotate.js library
    import('pleaserotate.js').then((PleaseRotate) => {
      // Configure options for landscape mode viewing
      const options = {
        forcePortrait: false, // We want landscape for charts
        message: "For the best experience, please rotate your device.",
        subMessage: "This report is best viewed in landscape mode.",
        allowClickBypass: true,
        onlyMobile: true,
        zIndex: 9999
      }

      // Initialize pleaserotate
      if (PleaseRotate.default) {
        PleaseRotate.default(options)
      }
    }).catch((error) => {
      console.warn('Could not load pleaserotate.js:', error)
    })
  }, [])

  // This component doesn't render anything - the library handles the UI
  return null
}

export default PleaseRotatePrompt
