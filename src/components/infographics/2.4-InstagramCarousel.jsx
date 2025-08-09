import React, { useState, useEffect } from 'react';
// CSS imported via main.css

const InstagramCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const images = [
    {
      src: `${import.meta.env.BASE_URL}images/insta_scotpilie_wx.png`,
      title: "Instagram post by Scot Pilié",
      alt: "Instagram post by meteorologist Scot Pilié discussing heat-related health impacts",
      creator: "SP",
      profileImage: `${import.meta.env.BASE_URL}images/scotpilie_wx.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG6BgVAxhij/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}images/insta_farmernick.png`,
      title: "Instagram post by Nick Cutsumpas",
      alt: "Instagram post by Nick Cutsumpas about climate adaptation strategies",
      creator: "NC",
      profileImage: `${import.meta.env.BASE_URL}images/farmernick.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG5o77lAYV4/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}images/insta_eyeinspired.png`,
      title: "Instagram post by Kelly Edelman",
      alt: "Instagram post by Kelly Edelman on heat safety and prevention",
      creator: "KE",
      profileImage: `${import.meta.env.BASE_URL}images/eyeinspired.jpg`,
      instagramUrl: "https://www.instagram.com/reel/DG8WJFNuxwm/?utm_source=ig_web_button_share_sheet"
    },
    {
      src: `${import.meta.env.BASE_URL}images/insta_becomingdrdevore.png`,
      title: "Instagram post by Sydney DeVore",
      alt: "Instagram post by Dr. Sydney DeVore on heat-related health risks",
      creator: "SD",
      profileImage: `${import.meta.env.BASE_URL}images/becomingdrdevore.jpg`,
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
          <p><b>The social media videos were produced by the following Instagram creators:</b></p>
              <ul>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG8WJFNuxwm/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@eyeinspired</a></strong>: Kelly Edelman posts bold, mixed-media portraits with vivid colors and occasional art-tutorials—popular among her millions of followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG_myvfBnLC/" target="_blank" rel="noopener noreferrer">@becomingdrdevore</a></strong>: Syd shares transparent pre-med and med-school journey content, MCAT tips, and application advice for aspiring medical students
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG6BgVAxhij/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@scotpilie_wx</a></strong>: New Orleans meteorologist Scot Pilié blends weather updates, personal lifestyle and foodie moments to engage his ~56K followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG5o77lAYV4/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@farmernick</a></strong>: Nick Cutsumpas uses his platform to coach urban gardening, sustainability, and plant-care through tutorials and environmental activism
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
                    <svg className="progress-ring-svg">
                      <circle className="progress-ring-circle" />
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
                      className="instagram-link"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        title={image.title}
                        loading={index === currentSlide ? "eager" : "lazy"}
                      />
                      <div className="instagram-overlay">
                        <svg className="instagram-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="white"/>
                        </svg>
                        <span className="instagram-text">View on Instagram</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="carousel-instruction">
              <span>Click images to view Instagram videos</span>
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
