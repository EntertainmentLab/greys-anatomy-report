/**
 * Emergency Scroll Fix Utility
 * 
 * This utility provides emergency functions to fix stuck scroll locks
 * that might be causing the page scroll to be cut off.
 */

/**
 * Emergency function to restore page scrolling
 * Call this if the page seems stuck with no scrolling
 */
export function emergencyRestoreScroll() {
  console.warn('🚨 EMERGENCY SCROLL RESTORE ACTIVATED')
  
  // Remove any overflow restrictions from body
  document.body.style.overflow = ''
  document.body.style.overflowX = ''
  document.body.style.overflowY = ''
  
  // Remove any height restrictions
  document.body.style.height = ''
  document.body.style.maxHeight = ''
  document.body.style.minHeight = ''
  
  // Remove any padding that might be from scroll lock
  document.body.style.paddingRight = ''
  
  // Also check html element
  document.documentElement.style.overflow = ''
  document.documentElement.style.height = ''
  
  // Reset any scroll-related inline styles
  const allElements = document.querySelectorAll('[style*="overflow"], [style*="height"]')
  allElements.forEach(element => {
    // Only reset if it looks like it might be causing scroll issues
    const style = element.getAttribute('style') || ''
    if (style.includes('overflow: hidden') || style.includes('height: 100vh')) {
      console.warn('Resetting suspicious styles on element:', element)
      element.style.overflow = ''
      if (element !== document.body && element !== document.documentElement) {
        element.style.height = ''
      }
    }
  })
  
  console.log('✅ Emergency scroll restore completed')
  console.log('📊 Current body styles:', {
    overflow: document.body.style.overflow,
    height: document.body.style.height,
    paddingRight: document.body.style.paddingRight
  })
}

/**
 * Check for common scroll-blocking issues
 */
export function diagnoseScrollIssues() {
  console.group('🔍 SCROLL DIAGNOSTIC REPORT')
  
  const bodyStyles = window.getComputedStyle(document.body)
  const htmlStyles = window.getComputedStyle(document.documentElement)
  
  const issues = []
  
  // Check body overflow
  if (bodyStyles.overflow === 'hidden') {
    issues.push('❌ Body has overflow: hidden')
  }
  
  // Check html overflow  
  if (htmlStyles.overflow === 'hidden') {
    issues.push('❌ HTML has overflow: hidden')
  }
  
  // Check for fixed heights
  if (bodyStyles.height !== 'auto' && !bodyStyles.height.includes('auto')) {
    issues.push(`❌ Body has fixed height: ${bodyStyles.height}`)
  }
  
  // Check viewport dimensions
  const viewportHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  console.log('📏 Dimensions:', {
    viewportHeight,
    documentHeight,
    scrollable: documentHeight > viewportHeight
  })
  
  // Check for suspicious elements
  const suspiciousElements = document.querySelectorAll('[style*="overflow: hidden"]')
  if (suspiciousElements.length > 0) {
    issues.push(`❌ Found ${suspiciousElements.length} elements with overflow: hidden`)
    suspiciousElements.forEach((el, index) => {
      console.log(`Element ${index + 1}:`, el)
    })
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious scroll issues detected')
  } else {
    console.warn('🚨 Potential scroll issues found:')
    issues.forEach(issue => console.warn(issue))
  }
  
  console.groupEnd()
  
  return {
    hasIssues: issues.length > 0,
    issues,
    bodyOverflow: bodyStyles.overflow,
    htmlOverflow: htmlStyles.overflow,
    viewportHeight,
    documentHeight,
    isScrollable: documentHeight > viewportHeight
  }
}

/**
 * Auto-fix common scroll issues
 */
export function autoFixScrollIssues() {
  console.log('🔧 AUTO-FIX: Attempting to fix scroll issues...')
  
  const diagnosis = diagnoseScrollIssues()
  
  if (!diagnosis.hasIssues) {
    console.log('✅ No issues found, no fixes needed')
    return false
  }
  
  let fixesApplied = 0
  
  // Fix body overflow
  if (diagnosis.bodyOverflow === 'hidden') {
    document.body.style.overflow = ''
    fixesApplied++
    console.log('🔧 Fixed body overflow: hidden')
  }
  
  // Fix html overflow
  if (diagnosis.htmlOverflow === 'hidden') {
    document.documentElement.style.overflow = ''
    fixesApplied++
    console.log('🔧 Fixed html overflow: hidden')
  }
  
  // Remove overflow: hidden from suspicious elements
  const hiddenElements = document.querySelectorAll('[style*="overflow: hidden"]')
  hiddenElements.forEach((el, index) => {
    // Only fix if not a known modal/popup element
    if (!el.classList.contains('modal') && 
        !el.classList.contains('popup') && 
        !el.classList.contains('overlay')) {
      el.style.overflow = ''
      fixesApplied++
      console.log(`🔧 Fixed element ${index + 1} overflow`)
    }
  })
  
  console.log(`✅ Applied ${fixesApplied} fixes`)
  
  // Re-diagnose to confirm fixes
  setTimeout(() => {
    const afterDiagnosis = diagnoseScrollIssues()
    if (!afterDiagnosis.hasIssues) {
      console.log('🎉 All scroll issues resolved!')
    } else {
      console.warn('⚠️ Some issues may remain, try emergencyRestoreScroll()')
    }
  }, 100)
  
  return fixesApplied > 0
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.__emergencyRestoreScroll = emergencyRestoreScroll
  window.__diagnoseScrollIssues = diagnoseScrollIssues
  window.__autoFixScrollIssues = autoFixScrollIssues
  
  // Auto-run diagnostic on load in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      console.log('🔍 Running automatic scroll diagnostic...')
      const diagnosis = diagnoseScrollIssues()
      if (diagnosis.hasIssues) {
        console.warn('🚨 Scroll issues detected! Run __autoFixScrollIssues() to attempt fixes')
      }
    }, 2000)
  }
}