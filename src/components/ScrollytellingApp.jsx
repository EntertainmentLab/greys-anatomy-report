import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ScrollytellingSection from './scrollytelling/ScrollytellingSection'
import ScrollytellingHero from './scrollytelling/ScrollytellingHero'
import ScrollytellingProgress from './scrollytelling/ScrollytellingProgress'

// Import existing chart components
import HeatwaveCompositeChart from './charts/HeatwaveCompositeChart'
import AMEChart1 from './charts/3.1-AMEChart1'
import AMEChart2 from './charts/3.2-AMEChart2'
import AMEChart3 from './charts/3.3-AMEChart3'
import KnowledgeAccuracyChart from './charts/3.4-KnowledgeAccuracyChart'
import PolicySupportChart from './charts/3.5-PolicySupportChart'
import ClimateTemporalChart from './charts/3.6-ClimateTemporalChart'

// Import CSS
import '../styles/scrollytelling.css'

function ScrollytellingApp() {
  const [activeSection, setActiveSection] = useState(0)
  
  return (
    <div className="scrolly-container">
      <ScrollytellingProgress activeSection={activeSection} totalSections={10} />
      
      {/* Hero Section */}
      <ScrollytellingHero />
      
      {/* Section 1: The Challenge */}
      <ScrollytellingSection
        id="challenge"
        index={1}
        setActiveSection={setActiveSection}
        theme="dark"
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            Can a TV Show Save Lives?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text"
          >
            As extreme heat becomes deadlier each year, we tested whether one episode 
            of Grey's Anatomy could shift how Americans think about heat waves 
            and climate change.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-stat"
          >
            <span className="stat-number">2,300+</span>
            <span className="stat-label">Americans heat-related deaths annually</span>
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 2: The Episode */}
      <ScrollytellingSection
        id="episode"
        index={2}
        setActiveSection={setActiveSection}
        theme="light"
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            "Drop It Like It's Hot"
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text"
          >
            In Season 21, Grey Sloan Memorial Hospital faces a record-breaking heat wave. 
            Power outages. Overwhelmed emergency services. Life-or-death triage decisions.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-episode-preview"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/season21ep8_thumbnail.png`} 
              alt="Grey's Anatomy heat wave episode"
              className="episode-image"
            />
            <p className="episode-caption">
              The episode never mentions climate change explicitly—but the message is clear.
            </p>
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 3: The Study Design */}
      <ScrollytellingSection
        id="study"
        index={3}
        setActiveSection={setActiveSection}
        theme="dark"
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            The Experiment
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="scrolly-study-design"
          >
            <div className="study-group">
              <div className="group-icon control">👥</div>
              <h3>Control Group</h3>
              <p>Watched a different episode</p>
            </div>
            
            <div className="study-group">
              <div className="group-icon treatment">📺</div>
              <h3>Treatment Group</h3>
              <p>Watched the heat wave episode</p>
            </div>
            
            <div className="study-group">
              <div className="group-icon handoff">📺+📱</div>
              <h3>Multiplatform Group</h3>
              <p>Episode + social media videos</p>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="scrolly-text-center"
          >
            <strong>2,893 participants</strong> • 3 waves of measurement • 15 days of tracking
          </motion.p>
        </div>
      </ScrollytellingSection>

      {/* Section 4: Main Finding with Chart */}
      <ScrollytellingSection
        id="main-finding"
        index={4}
        setActiveSection={setActiveSection}
        theme="light"
        fullHeight={true}
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            The Impact Was Immediate
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text"
          >
            Viewers showed significant increases in heat wave awareness and concern—
            effects that persisted even two weeks later.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-chart-container"
          >
            <HeatwaveCompositeChart />
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 5: Perception Changes */}
      <ScrollytellingSection
        id="perception"
        index={5}
        setActiveSection={setActiveSection}
        theme="dark"
        fullHeight={true}
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            Shifting Perceptions of Risk
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="scrolly-chart-container"
          >
            <AMEChart1 />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="scrolly-text-center"
          >
            Viewers became more aware of their personal vulnerability to extreme heat.
          </motion.p>
        </div>
      </ScrollytellingSection>

      {/* Section 6: Knowledge Gains */}
      <ScrollytellingSection
        id="knowledge"
        index={6}
        setActiveSection={setActiveSection}
        theme="light"
        fullHeight={true}
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            Learning Through Drama
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text"
          >
            The episode taught viewers about specific health risks—
            knowledge that could save lives during real heat waves.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-chart-container"
          >
            <KnowledgeAccuracyChart />
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 7: Policy Support */}
      <ScrollytellingSection
        id="policy"
        index={7}
        setActiveSection={setActiveSection}
        theme="dark"
        fullHeight={true}
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            From Awareness to Action
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="scrolly-chart-container"
          >
            <PolicySupportChart />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="scrolly-text-center"
          >
            Support for heat-adaptive policies increased, especially among Republicans.
          </motion.p>
        </div>
      </ScrollytellingSection>

      {/* Section 8: Climate Connection */}
      <ScrollytellingSection
        id="climate"
        index={8}
        setActiveSection={setActiveSection}
        theme="light"
        fullHeight={true}
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            Making Climate Personal
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text"
          >
            When combined with social media follow-up, viewers saw climate change 
            as more immediate and personally relevant.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-chart-container"
          >
            <ClimateTemporalChart />
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 9: Real Stories */}
      <ScrollytellingSection
        id="stories"
        index={9}
        setActiveSection={setActiveSection}
        theme="dark"
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            In Their Own Words
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="scrolly-quotes"
          >
            <blockquote className="viewer-quote">
              <p>
                "It makes you realize, 'Hey, I could very well be in that situation, 
                and I shouldn't play around with it and always be prepared.'"
              </p>
              <cite>— Study Participant</cite>
            </blockquote>
            
            <blockquote className="viewer-quote">
              <p>
                "The show does the world a service by incorporating 
                real-life national issues into the storyline."
              </p>
              <cite>— Study Participant</cite>
            </blockquote>
            
            <blockquote className="viewer-quote">
              <p>
                "I now know to quickly cool down my overheated two-year-old 
                by placing him in a cold bath—an insight I credit to what I saw on screen."
              </p>
              <cite>— Mother of Two</cite>
            </blockquote>
          </motion.div>
        </div>
      </ScrollytellingSection>

      {/* Section 10: Conclusion */}
      <ScrollytellingSection
        id="conclusion"
        index={10}
        setActiveSection={setActiveSection}
        theme="gradient"
      >
        <div className="scrolly-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="scrolly-title"
          >
            Entertainment as Education
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="scrolly-text-large"
          >
            As the climate crisis deepens, integrating accurate, emotionally-resonant 
            stories into popular entertainment may be one of our most powerful tools 
            for life-saving public awareness and action.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="scrolly-cta"
          >
            <a href="/" className="btn-back-to-full">
              View Full Report →
            </a>
          </motion.div>
        </div>
      </ScrollytellingSection>
    </div>
  )
}

export default ScrollytellingApp