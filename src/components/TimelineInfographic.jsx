import React, { useState } from 'react';
import './TimelineInfographic.css';

const TimelineInfographic = () => {
  const [activeWave, setActiveWave] = useState(null);

  const waves = [
    {
      id: 1,
      title: "Wave 1: Baseline",
      date: "7-12 days before viewing",
      participants: "N = 4,830",
      description: "Baseline survey assessing demographics, media habits, and key outcome variables",
      icon: "📋",
      color: "#005BBB",
      details: [
        "Quota-sampled participants",
        "Demographics collection",
        "Media consumption habits",
        "Baseline climate beliefs",
        "Pre-exposure measurements"
      ]
    },
    {
      id: 2,
      title: "Wave 2: Viewing & Post-Exposure",
      date: "Viewing day + immediate post-survey",
      participants: "N = 3,575",
      description: "Participants viewed assigned content and completed post-exposure survey",
      icon: "📺",
      color: "#16a34a",
      details: [
        "Random assignment to conditions",
        "Episode viewing (with telemetry)",
        "Instagram video handoffs (treatment group)",
        "Immediate post-exposure survey",
        "Risk perception measurements"
      ]
    },
    {
      id: 3,
      title: "Wave 3: Follow-up",
      date: "15-20 days post-viewing",
      participants: "N = 3,204",
      description: "Follow-up survey assessing durability of effects",
      icon: "📊",
      color: "#2563eb",
      details: [
        "Delayed effects measurement",
        "Attitude durability assessment",
        "Behavioral intention tracking",
        "Long-term impact evaluation",
        "Final outcome measures"
      ]
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
              
              <p className="wave-description">{wave.description}</p>
              
              {activeWave === wave.id && (
                <div className="wave-details">
                  <h5>Key Activities:</h5>
                  <ul>
                    {wave.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
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

      <div className="timeline-summary">
        <div className="summary-stat">
          <div className="stat-number">4,830</div>
          <div className="stat-label">Initial Participants</div>
        </div>
        <div className="summary-stat">
          <div className="stat-number">66%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="summary-stat">
          <div className="stat-number">~3 weeks</div>
          <div className="stat-label">Total Duration</div>
        </div>
      </div>
    </div>
  );
};

export default TimelineInfographic;
