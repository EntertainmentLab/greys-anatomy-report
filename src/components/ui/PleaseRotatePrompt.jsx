import { useEffect, useState } from 'react'

function PleaseRotatePrompt() {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false)

  useEffect(() => {
    // Check if mobile device
    const isMobile = typeof window !== 'undefined' && 
      /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    
    if (!isMobile) return

    // Try to load pleaserotate.js library
    import('pleaserotate.js').then((PleaseRotate) => {
      console.log('PleaseRotate module loaded:', PleaseRotate)
      
      try {
        // Configure options for landscape mode viewing
        const options = {
          forcePortrait: false, // We want landscape for charts
          message: "For the best experience, please rotate your device.",
          subMessage: "This report is best viewed in landscape mode.",
          allowClickBypass: true,
          onlyMobile: true,
          zIndex: 9999
        }

        // Try different ways the library might be exported
        let initFunction = null
        if (typeof PleaseRotate.default === 'function') {
          initFunction = PleaseRotate.default
        } else if (typeof PleaseRotate === 'function') {
          initFunction = PleaseRotate
        } else if (PleaseRotate.start && typeof PleaseRotate.start === 'function') {
          initFunction = PleaseRotate.start
        }

        if (initFunction) {
          initFunction(options)
          setLibraryLoaded(true)
          console.log('PleaseRotate initialized successfully')
        } else {
          throw new Error('No valid initialization function found')
        }
      } catch (error) {
        console.warn('Failed to initialize pleaserotate.js:', error)
        setShowCustomPrompt(true)
      }
    }).catch((error) => {
      console.warn('Could not load pleaserotate.js:', error)
      setShowCustomPrompt(true)
    })
  }, [])

  // Custom fallback for orientation detection
  useEffect(() => {
    if (!showCustomPrompt) return

    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768
      const isPortrait = window.innerHeight > window.innerWidth
      
      if (isMobile && isPortrait) {
        setShowCustomPrompt(true)
      } else {
        setShowCustomPrompt(false)
      }
    }

    checkOrientation()
    
    const handleResize = () => setTimeout(checkOrientation, 100)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [showCustomPrompt])

  // Show custom prompt if library failed and we're in portrait
  if (showCustomPrompt && !libraryLoaded) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Roboto Condensed, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '20px',
          animation: 'rotate 2s ease-in-out infinite alternate'
        }}>
          📱
        </div>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          margin: 0
        }}>
          For the best experience, please rotate your device
        </h2>
        
        <p style={{
          fontSize: '1rem',
          opacity: 0.8,
          margin: '10px 0 20px 0'
        }}>
          This report is best viewed in landscape mode
        </p>

        <button
          onClick={() => setShowCustomPrompt(false)}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: 'Roboto Condensed, sans-serif'
          }}
        >
          Continue anyway
        </button>

        <style>{`
          @keyframes rotate {
            from { transform: rotate(-15deg); }
            to { transform: rotate(15deg); }
          }
        `}</style>
      </div>
    )
  }

  return null
}

export default PleaseRotatePrompt
