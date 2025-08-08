import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

function ScrollytellingSection({ 
  children, 
  id, 
  index, 
  setActiveSection, 
  theme = 'light',
  fullHeight = false 
}) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  })

  useEffect(() => {
    if (inView) {
      setActiveSection(index)
    }
  }, [inView, index, setActiveSection])

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`scrolly-section scrolly-section--${theme} ${fullHeight ? 'scrolly-section--full' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="scrolly-section-inner">
        {children}
      </div>
    </motion.section>
  )
}

export default ScrollytellingSection