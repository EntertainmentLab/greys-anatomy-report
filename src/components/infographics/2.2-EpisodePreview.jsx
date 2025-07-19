import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../utils/scrollLock';
// CSS imported via main.css

const EpisodePreview = ({ isOpen, onClose, episode }) => {
  // Use safe scroll locking utility
  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const episodeData = {
    hot: {
      title: "Drop it Like it's Hot",
      image: "images/season21ep8_thumbnail.png",
      description: "In the midst of a deadly heat wave, the team at Grey Sloan struggles to keep up with an overwhelming amount of patients; Amelia and Winston face a challenging surgery; Jo and Lucas run an errand for the hospital."
    },
    night: {
      title: "Night Moves",
      image: "images/season21ep6_thumbnail.jpg",
      description: "Teddy and Owen plan a date night that gets derailed in more ways than one; Jo struggles to do it all at home; Mika adds more to her plate to make up for taking time off to be with her sister; Levi is faced with a monumental decision."
    }
  };

  const currentEpisode = episodeData[episode] || episodeData.hot;

  if (!isOpen) return null;

  return createPortal(
    <div className="episode-preview-overlay" onClick={onClose}>
      <div className="episode-preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="episode-content">
          <div className="episode-thumbnail">
            <img 
              src={`${import.meta.env.BASE_URL}${currentEpisode.image}`}
              alt={`Grey's Anatomy Season 21 Episode - ${currentEpisode.title}`}
            />
          </div>
          
          <div className="episode-info">
            <h3>{currentEpisode.title}</h3>
            <p className="episode-meta">Season 21, Episode {episode === 'night' ? '6' : '8'} • Grey's Anatomy</p>
            <p className="episode-description">
              {currentEpisode.description}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EpisodePreview;

