import './InlineEpisodePreview.css';

function InlineEpisodePreview({ episode }) {
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

  return (
    <div className="inline-episode-preview">
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
  );
}

export default InlineEpisodePreview;