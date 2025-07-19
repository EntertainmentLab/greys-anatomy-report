/**
 * Scroll Lock Utility
 * 
 * Provides safe, race-condition-free body scroll locking for modals and popups.
 * Handles multiple components trying to control scroll simultaneously.
 */

import { useEffect } from 'react'

let lockCount = 0
let originalStyle = ''
let originalOverflow = ''

/**
 * Lock body scroll - can be called multiple times safely
 * @param {boolean} force - Force lock even if already locked
 */
export function lockBodyScroll(force = false) {
  if (lockCount === 0 || force) {
    // Store original styles only on first lock
    originalStyle = document.body.getAttribute('style') || ''
    originalOverflow = document.body.style.overflow
    
    // Apply scroll lock
    document.body.style.overflow = 'hidden'
    
    // Prevent scrollbar jump by adding padding
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }
  
  lockCount++
  
  // Debug logging
  console.debug(`lockBodyScroll: count=${lockCount}, overflow=${document.body.style.overflow}`)
}

/**
 * Unlock body scroll - only unlocks when all locks are released
 */
export function unlockBodyScroll() {
  if (lockCount > 0) {
    lockCount--
  }
  
  // Only restore scroll when all locks are released
  if (lockCount === 0) {
    // Restore original styles
    if (originalStyle) {
      document.body.setAttribute('style', originalStyle)
    } else {
      document.body.removeAttribute('style')
    }
    
    // Reset stored values
    originalStyle = ''
    originalOverflow = ''
  }
  
  // Debug logging
  console.debug(`unlockBodyScroll: count=${lockCount}, overflow=${document.body.style.overflow}`)
}

/**
 * Force unlock all scroll locks (emergency escape hatch)
 */
export function forceUnlockBodyScroll() {
  lockCount = 0
  
  // Restore original styles
  if (originalStyle) {
    document.body.setAttribute('style', originalStyle)
  } else {
    document.body.removeAttribute('style')
  }
  
  // Reset stored values
  originalStyle = ''
  originalOverflow = ''
  
  console.debug('forceUnlockBodyScroll: force unlocked, count reset to 0')
}

/**
 * Get current lock status
 * @returns {Object} Lock status information
 */
export function getScrollLockStatus() {
  return {
    isLocked: lockCount > 0,
    lockCount,
    currentOverflow: document.body.style.overflow,
    originalStyle,
    originalOverflow
  }
}

/**
 * React hook for scroll locking
 * @param {boolean} shouldLock - Whether scroll should be locked
 * @param {Object} options - Configuration options
 */
export function useScrollLock(shouldLock, options = {}) {
  const { 
    enabled = true,
    restoreOnUnmount = true 
  } = options

  useEffect(() => {
    if (!enabled) return

    if (shouldLock) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }

    // Cleanup on unmount
    return () => {
      if (restoreOnUnmount && shouldLock) {
        unlockBodyScroll()
      }
    }
  }, [shouldLock, enabled, restoreOnUnmount])

  useEffect(() => {
    // Emergency cleanup on unmount
    return () => {
      if (restoreOnUnmount) {
        unlockBodyScroll()
      }
    }
  }, [restoreOnUnmount])
}

/**
 * Debug utility to check for stuck scroll locks
 */
export function debugScrollLock() {
  const status = getScrollLockStatus()
  console.table({
    'Is Locked': status.isLocked,
    'Lock Count': status.lockCount,
    'Current Overflow': status.currentOverflow,
    'Original Style': status.originalStyle,
    'Original Overflow': status.originalOverflow,
    'Body Style Attribute': document.body.getAttribute('style'),
    'Computed Overflow': window.getComputedStyle(document.body).overflow
  })
  
  return status
}

// Emergency reset function for development
if (typeof window !== 'undefined') {
  window.__debugScrollLock = debugScrollLock
  window.__forceUnlockScroll = forceUnlockBodyScroll
}