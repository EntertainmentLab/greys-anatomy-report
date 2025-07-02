import React, { useState } from 'react';
import './TimelineInfographic.css';

const TimelineInfographic = () => {
  const [activeWave, setActiveWave] = useState(null);

  const waves = [
    {
      id: 1,
      title: "Baseline",
      subtitle: "Wave 1",
      date: "7-12 days before viewing",
      participants: 4830,
      participantsLabel: "N = 4,830",
      icon: "📋",
      color: "#2563eb",
      lightColor: "#dbeafe",
      details: "Assessed demographics, media habits, and key outcome variables"
    },
    {
      id: 2,
      title: "Post-Viewing", 
      subtitle: "Wave 2",
      date: "Viewing day + post-survey",
      participants: 3575,
      participantsLabel: "N = 3,575",
      icon: "📺",
      color: "#dc2626",
      lightColor: "#fee2e2",
      details: "Watched the episode, and answered post-viewing assessment"
    },
    {
      id: 3,
      title: "Follow-up",
      subtitle: "Wave 3", 
      date: "15-20 days post-viewing",
      participants: 3219,
      participantsLabel: "N = 3,219",
      icon: "📊",
      color: "#059669",
      lightColor: "#d1fae5",
      details: "Assessed durability of effects"
    }
  ];

  const maxParticipants = Math.max(...waves.map(w => w.participants));

  return (
    <div className="timeline-infographic">
      <div className="timeline-header">
        <div className="header_callout">Study Timeline & Data Collection</div>
      </div>

      {/* Horizontal Timeline */}
      <div className="timeline-track">
        <div className="timeline-progress-bar">
          {waves.map((wave, index) => (
            <div key={wave.id} className="timeline-checkpoint">
              <div 
                className="checkpoint-marker"
                style={{ backgroundColor: wave.color }}
              >
                <span className="checkpoint-number">{wave.id}</span>
              </div>
              {index < waves.length - 1 && (
                <div className="progress-line"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wave Cards */}
      <div className="waves-container">
        {waves.map((wave) => (
          <div 
            key={wave.id}
            className={`wave-card ${activeWave === wave.id ? 'active' : ''}`}
          >
            {/* Main Card Content */}
            <div className="wave-card-header">
              <div className="wave-icon-container" style={{ backgroundColor: wave.lightColor }}>
                <span className="wave-icon" style={{ color: wave.color }}>{wave.icon}</span>
              </div>
              
              <div className="wave-title-section">
                <h4 className="wave-title" style={{ color: wave.color }}>{wave.title}</h4>
                <span className="wave-subtitle">{wave.subtitle}</span>
              </div>
            </div>

            {/* Combined Details and Date Box */}
            <div className="wave-details-static">
              <div className="details-box" style={{ borderColor: wave.color }}>
                <p className="wave-date">{wave.date}</p>
                <span className="details-text">{wave.details}</span>
              </div>
            </div>

            {/* Simplified Participant Count */}
            <div className="participants-section">
              <span className="participants-count" style={{ color: wave.color }}>
                {wave.participantsLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineInfographic;