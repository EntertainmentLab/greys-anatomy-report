import React from 'react'
import { motion } from 'framer-motion'

function ScrollytellingProgress({ activeSection, totalSections }) {
  const progress = (activeSection / totalSections) * 100

  return (
    <div className="scrolly-progress">
      <motion.div 
        className="scrolly-progress-bar"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <div className="scrolly-progress-dots">
        {Array.from({ length: totalSections }, (_, i) => (
          <motion.div
            key={i}
            className="progress-dot"
            animate={{
              scale: i <= activeSection ? 1 : 0.6,
              opacity: i <= activeSection ? 1 : 0.3
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}

export default ScrollytellingProgress