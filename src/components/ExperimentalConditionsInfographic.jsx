import './ExperimentalConditionsInfographic.css';

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
          <div className="episode-description">No climate content</div>
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
          <div className="episode-description">Heat wave episode</div>
        </div>
      </div>
      
      <div className="condition-group">
        <div className="condition-header">
          <div className="condition-number">1,073</div>
          <div className="condition-label">Heat Wave + Handoff</div>
        </div>
        <div className="condition-content">
          <button 
            className="episode-title-button"
            onClick={onShowEpisodePreview}
          >
            "Drop it Like it's Hot"
          </button>
          <div className="episode-description">+ Instagram videos</div>
        </div>
      </div>
    </div>
  );
}

export default ExperimentalConditionsInfographic;
