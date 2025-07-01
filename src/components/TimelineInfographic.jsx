import React, { useState } from 'react';
import './TimelineInfographic.css';

const TimelineInfographic = () => {
  const [activeWave, setActiveWave] = useState(null);

  const waves = [
    {
      id: 1,
      title: "Wave 1",
      date: "7-12 days before viewing",
      participants: "N = 4,830",
      icon: "📋",
      color: "#005BBB",
      details: "Baseline survey administered 7-12 days prior to viewing, assessing demographics, media habits, and key outcome variables (when applicable)."
    },
    {
      id: 2,
      title: "Wave 2",
      date: "Viewing day + immediate post-survey",
      participants: "N = 3,575",
      icon: "📺",
      color: "#16a34a",
      details: "Participants completed the viewing assignment and then responded to a post-exposure survey assessing perceived heat risk, health system impacts, climate beliefs, policy preferences, and behavioral intentions."
    },
    {
      id: 3,
      title: "Wave 3",
      date: "15-20 days post-viewing",
      participants: "N = 3XXX",
      icon: "📊",
      color: "#2563eb",
      details: "A follow-up survey, administered 15-20 days post-viewing, assessed the durability of effects."
    }
  ];

  return (
    <div className="timeline-infographic">
      <div className="timeline-header">
        <h3>Study Timeline & Data Collection Waves</h3>
        <p>Three-wave longitudinal design tracking participant responses over time</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        
        {waves.map((wave, index) => (
          <div 
            key={wave.id}
            className={`timeline-wave ${activeWave === wave.id ? 'active' : ''}`}
            onClick={() => setActiveWave(activeWave === wave.id ? null : wave.id)}
          >
            <div className="wave-marker" style={{ backgroundColor: wave.color }}>
              <span className="wave-icon">{wave.icon}</span>
              <div className="wave-number">{wave.id}</div>
            </div>
            
            <div className="wave-content">
              <div className="wave-header">
                <h4 style={{ color: wave.color }}>{wave.title}</h4>
                <div className="wave-meta">
                  <span className="wave-date">{wave.date}</span>
                  <span className="wave-participants" style={{ color: wave.color }}>
                    {wave.participants}
                  </span>
                </div>
              </div>
              
              {activeWave === wave.id && (
                <div className="wave-details">
                  <p>{wave.details}</p>
                </div>
              )}
              
              <button 
                className="wave-toggle"
                style={{ borderColor: wave.color, color: wave.color }}
              >
                {activeWave === wave.id ? 'Show Less' : 'Show Details'}
              </button>
            </div>
            
            {index < waves.length - 1 && (
              <div className="timeline-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineInfographic;