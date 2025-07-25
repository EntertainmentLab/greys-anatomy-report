import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Banner = () => {
  const bannerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!bannerRef.current) return;

    const banner = d3.select(bannerRef.current);
    const progress = Math.min(scrollY / (bannerHeight * 0.8), 1);

    // Animate banner opacity and transform (removed scale)
    banner
      .style('opacity', 1 - progress * 0.7)
      .style('transform', `translateY(${progress * -50}px)`);

  }, [scrollY, bannerHeight]);

  // Improved sticky header logic with better threshold
  const threshold = bannerHeight * 0.5; // Lower threshold for testing
  const isSticky = scrollY > threshold;
  

  return (
    <>
      {/* Main Banner */}
      <div ref={bannerRef} className="banner-container">
        <div className="banner-background">
          <img 
            src={`${import.meta.env.BASE_URL}images/greys-anatomy-banner.png`}
            alt="Grey's Anatomy Cast"
            className="banner-image"
          />
          <div className="banner-overlay" />
        </div>
        
        <div className="banner-content">
          <a href="https://www.rare.org" className="rare-logo-container">
            <img 
              src={`${import.meta.env.BASE_URL}images/rare-logo.png`}
              alt="Rare Organization" 
              className="rare-logo"
            />
          </a>
        </div>
      </div>

      {/* Unified Sticky Header with TOC */}
      <div className={`unified-sticky-header ${isSticky ? 'visible' : ''}`}>
        <div className="sticky-header-content">
          <a href="https://www.rare.org" className="sticky-rare-logo-container">
            <img 
              src={`${import.meta.env.BASE_URL}images/rare-logo.png`}
              alt="Rare Organization" 
              className="sticky-rare-logo"
            />
          </a>
        </div>
      </div>
    </>
  );
};

export default Banner;

