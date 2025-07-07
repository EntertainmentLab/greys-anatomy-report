import { useEffect } from 'react'

function PleaseRotatePrompt() {
  useEffect(() => {
    // Dynamically import pleaserotate.js only in browser
    if (typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
      import('pleaserotate.js').then((PleaseRotate) => {
        // Configure options for landscape mode viewing
        const options = {
          forcePortrait: false, // We want landscape for charts
          message: "For the best experience, please rotate your device.",
          subMessage: "This report is best viewed in landscape mode.",
          allowClickBypass: false,
          onlyMobile: true,
          // Custom styling to match the app
          zIndex: 9999
        }

        // Initialize pleaserotate.js
        if (PleaseRotate.default && typeof PleaseRotate.default.start === 'function') {
          PleaseRotate.default.start(options)
        } else if (PleaseRotate.default && typeof PleaseRotate.default === 'function') {
          // Fallback if it's exported differently
          PleaseRotate.default(options)
        } else if (typeof PleaseRotate.start === 'function') {
          PleaseRotate.start(options)
        }
      }).catch((error) => {
        console.warn('Could not load pleaserotate.js:', error)
      })
    }
  }, [])

  // This component doesn't render anything - pleaserotate.js handles the UI
  return null
}

export default PleaseRotatePrompt
