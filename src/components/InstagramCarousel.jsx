import React, { useState, useEffect } from 'react';
import '../styles/components/InstagramCarousel.css';

const InstagramCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const images = [
    {
      src: `${import.meta.env.BASE_URL}insta_scotpilie_wx.png`,
      title: "Instagram post by Scot Pilié",
      alt: "Instagram post by meteorologist Scot Pilié discussing heat-related health impacts",
      creator: "SP",
      profileImage: `${import.meta.env.BASE_URL}scotpilie_wx.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG6BgVAxhij/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_farmernick.png`,
      title: "Instagram post by Nick Cutsumpas",
      alt: "Instagram post by Nick Cutsumpas about climate adaptation strategies",
      creator: "NC",
      profileImage: `${import.meta.env.BASE_URL}farmernick.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG5o77lAYV4/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_eyeinspired.png`,
      title: "Instagram post by Kelly Edelman",
      alt: "Instagram post by Kelly Edelman on heat safety and prevention",
      creator: "KE",
      profileImage: `${import.meta.env.BASE_URL}eyeinspired.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG8WJFNuxwm/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}insta_becomingdrdevore.png`,
      title: "Instagram post by Sydney DeVore",
      alt: "Instagram post by Dr. Sydney DeVore on heat-related health risks",
      creator: "SD",
      profileImage: `${import.meta.env.BASE_URL}becomingdrdevore.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG_myvfBnLC/"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <div className="instagram-section">
      <div className="section-content">
        <div className="text-content">
          <div className="header_callout">Handoff Content: Instagram Videos</div>
          <p>
            The four climate-related Instagram videos used in the handoff condition were commissioned and distributed by Action for the Climate Emergency (ACE), a youth-led U.S. climate-advocacy nonprofit. These short-form Instagram reels featured content creators discussing heat-related health impacts and climate adaptation strategies as part of ACE's #DangerDome impact campaign, which was specifically designed to:
          </p>
          <ul>
            <li>
              Amplify Grey’s Anatomy’s Season 21 “heat‑dome” storyline for viewers who had just watched the episode;
            </li>
            <li>
              Translate the drama into clear climate‑science take‑aways about extreme heat, health risks, and community preparedness; and
            </li>
            <li>
              Test whether this supplemental, creator‑driven content could deepen knowledge and concern in tandem with the show’s narrative.
            </li>
          </ul>
        </div>

        <div className="carousel-content">
          <div className="profile-circles">
            {images.map((image, index) => (
              <button
                key={index}
                className={`profile-circle ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${image.creator}'s post`}
                type="button"
              >
                <div className="profile-inner">
                  {image.profileImage ? (
                    <img
                      src={image.profileImage}
                      alt={`Profile of ${image.creator}`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span style={{ display: 'none' }}>{image.creator}</span>
                </div>
                {isAutoPlaying && index === currentSlide && (
                  <div className="progress-ring">
                    <svg width="54" height="54">
                      <circle cx="27" cy="27" r="25" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="carousel-container">
            <button
              className="carousel-nav prev"
              onClick={prevSlide}
              aria-label="Previous image"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="carousel-track">
              <div
                className="carousel-slides"
                style={{ transform: `translateY(-${currentSlide * 25}%)` }}
              >
                {images.map((image, index) => (
                  <div key={index} className="carousel-slide">
                    <a
                      href={image.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${image.title} on Instagram`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        title={image.title}
                        loading={index === currentSlide ? "eager" : "lazy"}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="carousel-nav next"
              onClick={nextSlide}
              aria-label="Next image"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramCarousel;
