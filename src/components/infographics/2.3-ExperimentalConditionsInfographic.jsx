// CSS imported via main.css

function ExperimentalConditionsInfographic({ onShowNightMovesPreview, onShowEpisodePreview }) {
  return (
    <div className="experimental-conditions-infographic">
      <div className="condition-group">
        <div className="condition-header">
          <div className="condition-number">1,040</div>
          <div className="condition-label">Control Group</div>
        </div>
        <div className="condition-content">
          <button 
            className="episode-title-button"
            onClick={onShowNightMovesPreview}
          >
            "Night Moves"
          </button>
          <div className="episode-description"><p>Episode unrelated to climate or severe weather</p></div>
        </div>
      </div>
      
      <div className="condition-group">
        <div className="condition-header">
          <div className="condition-number">1,091</div>
          <div className="condition-label">Heat Wave Group</div>
        </div>
        <div className="condition-content">
          <button 
            className="episode-title-button"
            onClick={onShowEpisodePreview}
          >
            "Drop it Like it's Hot"
          </button>
          <div className="episode-description"><p>Heat wave episode only</p></div>
        </div>
      </div>
      
      <div className="condition-group">
        <div className="condition-header">
          <div className="condition-number">1,073</div>
          <div className="condition-label">Multiplatform Group</div>
        </div>
        <div className="condition-content">
          <button 
            className="episode-title-button"
            onClick={onShowEpisodePreview}
          >
            "Drop it Like it's Hot"
          </button>
          <div className="episode-description"><p>Heat wave episode<br />+ Instagram video</p></div>
        </div>
      </div>
    </div>
  );
}

export default ExperimentalConditionsInfographic;
