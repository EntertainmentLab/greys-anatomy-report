import React, { useState, useEffect } from 'react';
import './InstagramCarousel.css';

const InstagramCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const videos = [
    {
      src: `${import.meta.env.BASE_URL}insta_scotpilie_wx.html`,
      title: "Instagram post by Scot Pilié"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_farmernick.html`,
      title: "Instagram post by Nick Cutsumpas"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_eyeinspired.html`,
      title: "Instagram post by Kelly Edelman"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_becomingdrdevore.html`,
      title: "Instagram post by Sydney DeVore"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % videos.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, videos.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % videos.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <div className="instagram-section">
      <div className="section-content">
        <div className="text-content">
          <p>
            The four climate-related Instagram videos used in the handoff condition featured content creators discussing heat-related health impacts and climate adaptation strategies. These videos were developed in partnership with <a href="https://www.acecomms.org/" target="_blank" rel="noopener noreferrer"><strong>ACE (ecoAmerica)</strong></a>, a research and communications organization that uses data-driven insights to shift American attitudes and behaviors on climate change and environmental issues.
          </p>
          <p>
            Each video was designed to seamlessly connect the fictional narrative of Grey's Anatomy with real-world climate science and health implications, helping viewers understand how extreme heat events depicted in entertainment reflect genuine public health challenges facing communities across the United States.
          </p>
        </div>

        <div className="carousel-content">
          <div className="carousel-container">
            <button className="carousel-nav prev" onClick={prevSlide} aria-label="Previous video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="carousel-track">
              <div 
                className="carousel-slides"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {videos.map((video, index) => (
                  <div key={index} className="carousel-slide">
                    <iframe 
                      src={video.src}
                      width="100%" 
                      height="750" 
                      frameBorder="0"
                      title={video.title}
                      loading={index === currentSlide ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button className="carousel-nav next" onClick={nextSlide} aria-label="Next video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="carousel-indicators">
            {videos.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to video ${index + 1}`}
              >
                <span className="indicator-dot"></span>
                {isAutoPlaying && index === currentSlide && (
                  <div className="progress-ring">
                    <svg width="24" height="24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramCarousel;
