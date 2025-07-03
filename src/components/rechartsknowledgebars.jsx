import React, { useState, useEffect, useRef } from 'react';

const HeatwaveKnowledgeChart = () => {
  const [selectedCondition, setSelectedCondition] = useState('labor');
  const [animatedWidths, setAnimatedWidths] = useState({
    control: [0, 0],
    treatment: [0, 0],
    handoff: [0, 0]
  });
  const [isAnimating, setIsAnimating] = useState(false);
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
    control: {
      primary: '#f0c4a0',
      secondary: '#e8b894',
      gradient: 'linear-gradient(135deg, #f0c4a0 0%, #e8b894 100%)',
      shadow: 'rgba(240, 196, 160, 0.3)'
    },
    treatment: {
      primary: '#a8c4a2',
      secondary: '#9bb896',
      gradient: 'linear-gradient(135deg, #a8c4a2 0%, #9bb896 100%)',
      shadow: 'rgba(168, 196, 162, 0.3)'
    },
    handoff: {
      primary: '#5a7c47',
      secondary: '#4a6b3a',
      gradient: 'linear-gradient(135deg, #5a7c47 0%, #4a6b3a 100%)',
      shadow: 'rgba(90, 124, 71, 0.3)'
    }
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

  // Enhanced animation with spring physics
  useEffect(() => {
    const targetData = getCurrentData();
    const maxValue = 80;
    setIsAnimating(true);
    
    // First, immediately reset to 0
    setAnimatedWidths({
      control: [0, 0],
      treatment: [0, 0],
      handoff: [0, 0]
    });

    const animateSequence = () => {
      // Staggered animation with enhanced timing
      const staggerDelay = 200;
      const baseDuration = 800;

      // Phase 1: Control bars (baseline)
      setTimeout(() => {
        animateToTarget('control', [
          (targetData.control[0] / maxValue) * 100,
          (targetData.control[1] / maxValue) * 100
        ], baseDuration);
      }, 200);

      // Phase 2: Treatment bars (with slight delay)
      setTimeout(() => {
        animateToTarget('treatment', [
          (targetData.treatment[0] / maxValue) * 100,
          (targetData.treatment[1] / maxValue) * 100
        ], baseDuration);
      }, 200 + staggerDelay);

      // Phase 3: Handoff bars (final with emphasis)
      setTimeout(() => {
        animateToTarget('handoff', [
          (targetData.handoff[0] / maxValue) * 100,
          (targetData.handoff[1] / maxValue) * 100
        ], baseDuration, () => setIsAnimating(false));
      }, 200 + staggerDelay * 2);
    };

    // Small delay to ensure reset happens first
    setTimeout(animateSequence, 100);
  }, [selectedCondition]);

  const animateToTarget = (barType, targetWidths, duration, onComplete) => {
    const startTime = performance.now();
    const startWidths = [0, 0];

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Enhanced spring-like easing with overshoot
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
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
      } else if (onComplete) {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  };

  const BarRow = ({ label, value, colorScheme, improvement, animatedWidth, barType }) => {
    const showImprovement = improvement > 0 && animatedWidth > 15;
    
    return (
      <div style={{
        position: 'relative',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Enhanced label */}
          <div style={{
            minWidth: '90px',
            textAlign: 'right',
            fontSize: '14px',
            fontWeight: animatedWidth > 0 ? '600' : '500',
            color: animatedWidth > 0 ? '#1f2937' : '#6b7280',
            transition: 'all 0.3s ease'
          }}>
            <div>{label}</div>
            {barType === 'handoff' && (
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                fontWeight: '400'
              }}>
                + Videos
              </div>
            )}
          </div>
          
          {/* Enhanced bar container */}
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            {/* Background track */}
            <div style={{
              height: '48px',
              background: 'linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'visible',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(229, 231, 235, 0.5)'
            }}>
              
              {/* Animated progress bar */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${animatedWidth}%`,
                  background: colorScheme.gradient,
                  borderRadius: '12px',
                  boxShadow: `0 4px 20px ${colorScheme.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'box-shadow 0.3s ease',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = `0 6px 25px ${colorScheme.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = `0 4px 20px ${colorScheme.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
              >
                {/* Inner glow effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'linear-gradient(to top, transparent, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2))'
                }} />
                
                {/* Shimmer effect during animation */}
                {isAnimating && (
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      opacity: 0.6,
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                )}
                
                {/* Value label */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '16px'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    opacity: animatedWidth > 8 ? 1 : 0,
                    transform: `scale(${animatedWidth > 8 ? 1 : 0.8})`,
                    transition: 'all 0.3s ease'
                  }}>
                    {value}%
                  </span>
                </div>
              </div>
              
              {/* Improvement badge */}
              {improvement > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-8px',
                    zIndex: 10,
                    opacity: showImprovement ? 1 : 0,
                    transform: showImprovement 
                      ? 'scale(1) translateY(0) rotate(0deg)' 
                      : 'scale(0.5) translateY(10px) rotate(-5deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <div style={{
                    background: 'white',
                    border: '2px solid #10b981',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <span style={{
                        color: '#059669',
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }}>
                        +{improvement}
                      </span>
                      <span style={{
                        color: '#10b981',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        pp
                      </span>
                    </div>
                    {/* Arrow */}
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid #10b981'
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentData = getCurrentData();
  const currentCondition = conditionLabels[selectedCondition];

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px'
    }}>
      {/* Enhanced header section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <div style={{ position: 'relative' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Heat Wave Knowledge Impact
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 16px auto'
          }}>
            Explore how the Grey's Anatomy heat wave episode influenced viewer knowledge about{' '}
            <span style={{
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {currentCondition.toLowerCase()}
            </span>
          </p>
          {/* Decorative gradient line */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '96px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: '9999px'
          }} />
        </div>
        
        {/* Enhanced condition selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'nowrap',
          marginTop: '32px'
        }}>
          {Object.entries(conditionLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCondition(key)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                transform: selectedCondition === key ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0)',
                background: selectedCondition === key 
                  ? 'linear-gradient(135deg, #3b82f6, #10b981)' 
                  : 'white',
                color: selectedCondition === key ? 'white' : '#374151',
                boxShadow: selectedCondition === key 
                  ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: selectedCondition === key ? 'none' : '1px solid #e5e7eb',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedCondition !== key) {
                  e.target.style.transform = 'scale(1.05) translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 20px -3px rgba(0, 0, 0, 0.12), 0 6px 8px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCondition !== key) {
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced chart grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
        gap: '32px'
      }}>
        {/* Immediate Results */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(135deg, white, #f9fafb)',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: 'radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #10b981 0%, transparent 50%)'
            }} />
            
            {/* Header */}
            <div style={{
              position: 'relative',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Immediate Impact
                </h3>
              </div>
              <p style={{
                color: '#6b7280',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                Knowledge accuracy right after watching the episode
              </p>
            </div>
            
            {/* Enhanced bars */}
            <div>
              <BarRow 
                label="Control" 
                value={currentData.control[0]} 
                colorScheme={colors.control}
                improvement={0}
                animatedWidth={animatedWidths.control[0]}
                barType="control"
              />
              <BarRow 
                label="Heat Wave" 
                value={currentData.treatment[0]} 
                colorScheme={colors.treatment}
                improvement={getImprovement(currentData.treatment[0], currentData.control[0])}
                animatedWidth={animatedWidths.treatment[0]}
                barType="treatment"
              />
              <BarRow 
                label="Handoff" 
                value={currentData.handoff[0]} 
                colorScheme={colors.handoff}
                improvement={getImprovement(currentData.handoff[0], currentData.control[0])}
                animatedWidth={animatedWidths.handoff[0]}
                barType="handoff"
              />
            </div>
          </div>
        </div>

        {/* 15 Days Later Results */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(135deg, white, #f9fafb)',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: 'radial-gradient(circle at 20% 80%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)'
            }} />
            
            {/* Header */}
            <div style={{
              position: 'relative',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Lasting Effect
                </h3>
              </div>
              <p style={{
                color: '#6b7280',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                Knowledge accuracy 15 days after viewing
              </p>
            </div>
            
            {/* Enhanced bars */}
            <div>
              <BarRow 
                label="Control" 
                value={currentData.control[1]} 
                colorScheme={colors.control}
                improvement={0}
                animatedWidth={animatedWidths.control[1]}
                barType="control"
              />
              <BarRow 
                label="Heat Wave" 
                value={currentData.treatment[1]} 
                colorScheme={colors.treatment}
                improvement={getImprovement(currentData.treatment[1], currentData.control[1])}
                animatedWidth={animatedWidths.treatment[1]}
                barType="treatment"
              />
              <BarRow 
                label="Handoff" 
                value={currentData.handoff[1]} 
                colorScheme={colors.handoff}
                improvement={getImprovement(currentData.handoff[1], currentData.control[1])}
                animatedWidth={animatedWidths.handoff[1]}
                barType="handoff"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for shimmer animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  );
};

export default HeatwaveKnowledgeChart;