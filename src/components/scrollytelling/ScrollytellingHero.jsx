import React from 'react'
import { motion } from 'framer-motion'

function ScrollytellingHero() {
  return (
    <section className="scrolly-hero">
      <div className="scrolly-hero-background">
        <div className="hero-gradient"></div>
      </div>
      
      <div className="scrolly-hero-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="hero-title">
            When Television
            <br />
            <span className="hero-title-highlight">Saves Lives</span>
          </h1>
          
          <p className="hero-subtitle">
            How one Grey's Anatomy episode changed 
            the way Americans think about extreme heat
          </p>
          
          <div className="hero-meta">
            <span>Rare Entertainment Lab</span>
            <span className="meta-separator">•</span>
            <span>2024 Study</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>Scroll to explore</span>
          <motion.div 
            className="scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ScrollytellingHero