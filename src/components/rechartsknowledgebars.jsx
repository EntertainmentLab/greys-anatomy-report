import React, { useState, useEffect, useRef } from 'react';

const HeatwaveKnowledgeChart = () => {
  const [selectedCondition, setSelectedCondition] = useState('labor');
  const [animatedWidths, setAnimatedWidths] = useState({
    control: [0, 0],
    treatment: [0, 0],
    handoff: [0, 0]
  });
  const animationRef = useRef(null);

  const data = {
    violent: {
      control: [27, 36],
      treatment: [42, 47],
      handoff: [43, 45]
    },
    labor: {
      control: [32, 39],
      treatment: [60, 58],
      handoff: [65, 61]
    },
    organ: {
      control: [53, 56],
      treatment: [69, 64],
      handoff: [71, 66]
    },
    heart: {
      control: [60, 65],
      treatment: [72, 73],
      handoff: [76, 74]
    }
  };

  const colors = {
    control: '#e9c4a4',
    treatment: '#9fb699',
    handoff: '#628064'
  };

  const conditionLabels = {
    labor: 'Premature Labor',
    heart: 'Heart Attacks',
    organ: 'Organ Failure',
    violent: 'Violent Crime'
  };

  const getCurrentData = () => {
    return data[selectedCondition];
  };

  const getImprovement = (treatment, control) => {
    return treatment - control;
  };

  // Smooth animation using requestAnimationFrame
  useEffect(() => {
    const targetData = getCurrentData();
    const maxValue = 80;
    
    // First, immediately reset to 0
    setAnimatedWidths({
      control: [0, 0],
      treatment: [0, 0],
      handoff: [0, 0]
    });

    const animateSequence = () => {
      // Phase 1: Control bars
      setTimeout(() => {
        animateToTarget('control', [
          (targetData.control[0] / maxValue) * 100,
          (targetData.control[1] / maxValue) * 100
        ], 600);
      }, 150);

      // Phase 2: Treatment bars
      setTimeout(() => {
        animateToTarget('treatment', [
          (targetData.treatment[0] / maxValue) * 100,
          (targetData.treatment[1] / maxValue) * 100
        ], 600);
      }, 400);

      // Phase 3: Handoff bars
      setTimeout(() => {
        animateToTarget('handoff', [
          (targetData.handoff[0] / maxValue) * 100,
          (targetData.handoff[1] / maxValue) * 100
        ], 600);
      }, 650);
    };

    // Small delay to ensure reset happens first
    setTimeout(animateSequence, 50);
  }, [selectedCondition]);

  const animateToTarget = (barType, targetWidths, duration) => {
    const startTime = performance.now();
    // Always start from 0 to ensure smooth animation
    const startWidths = [0, 0];

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smoother easing function
      const easeProgress = progress * progress * (3 - 2 * progress); // smoothstep
      
      const newWidths = [
        startWidths[0] + (targetWidths[0] - startWidths[0]) * easeProgress,
        startWidths[1] + (targetWidths[1] - startWidths[1]) * easeProgress
      ];

      setAnimatedWidths(prev => ({
        ...prev,
        [barType]: newWidths
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const BarRow = ({ label, value, color, improvement, animatedWidth, isAnimating }) => {
    const showImprovement = improvement > 0 && animatedWidth > 15;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{
          minWidth: '80px',
          textAlign: 'right',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          {label}
        </div>
        <div style={{
          flex: 1,
          height: '40px',
          backgroundColor: '#f3f4f6',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'visible' // Changed to visible so floating label can appear outside
        }}>
          <div 
            style={{
              height: '100%',
              borderRadius: '20px',
              width: `${animatedWidth}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '12px',
              position: 'relative',
              transition: 'none',
              overflow: 'hidden'
            }}
          >
            <span style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              opacity: animatedWidth > 5 ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              {value}%
            </span>
          </div>
          
          {/* Floating improvement badge - positioned outside the bar */}
          {improvement > 0 && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#fafafa',
              color: '#6b7280',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              opacity: showImprovement ? 1 : 0,
              transform: showImprovement ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(8px)',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: showImprovement ? '0.1s' : '0s',
              boxShadow: '0 4px 12px rgba(107, 114, 128, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '2px solid #6b7280',
              zIndex: 10
            }}>
              +{improvement}pp
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentData = getCurrentData();

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    }}>
      {/* Condition Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(conditionLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCondition(key)}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedCondition === key ? colors.handoff : '#f3f4f6',
              color: selectedCondition === key ? 'white' : '#374151',
              boxShadow: selectedCondition === key ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
              transform: selectedCondition === key ? 'translateY(-2px)' : 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (selectedCondition !== key) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCondition !== key) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: colors.control
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Control Group
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: colors.treatment
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Treatment Group
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: colors.handoff
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Treatment + Handoff
          </span>
        </div>
      </div>

      {/* Chart Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
        gap: '32px'
      }}>
        {/* Immediate Results */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #6b7280'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📺 Immediately After Viewing
          </h3>
          <div>
            <BarRow 
              label="Control" 
              value={currentData.control[0]} 
              color={colors.control}
              improvement={0}
              animatedWidth={animatedWidths.control[0]}
            />
            <BarRow 
              label="Treatment" 
              value={currentData.treatment[0]} 
              color={colors.treatment}
              improvement={getImprovement(currentData.treatment[0], currentData.control[0])}
              animatedWidth={animatedWidths.treatment[0]}
            />
            <BarRow 
              label="+ Handoff" 
              value={currentData.handoff[0]} 
              color={colors.handoff}
              improvement={getImprovement(currentData.handoff[0], currentData.control[0])}
              animatedWidth={animatedWidths.handoff[0]}
            />
          </div>
        </div>

        {/* 15 Days Later Results */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #6b7280'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📅 15 Days Later
          </h3>
          <div>
            <BarRow 
              label="Control" 
              value={currentData.control[1]} 
              color={colors.control}
              improvement={0}
              animatedWidth={animatedWidths.control[1]}
            />
            <BarRow 
              label="Treatment" 
              value={currentData.treatment[1]} 
              color={colors.treatment}
              improvement={getImprovement(currentData.treatment[1], currentData.control[1])}
              animatedWidth={animatedWidths.treatment[1]}
            />
            <BarRow 
              label="+ Handoff" 
              value={currentData.handoff[1]} 
              color={colors.handoff}
              improvement={getImprovement(currentData.handoff[1], currentData.control[1])}
              animatedWidth={animatedWidths.handoff[1]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatwaveKnowledgeChart;