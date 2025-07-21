import InstagramCarousel from '../infographics/2.4-InstagramCarousel';
import TimelineInfographic from '../infographics/2.5-TimelineInfographic';
import EpisodePreview from '../infographics/2.2-EpisodePreview';
import ExperimentalConditionsInfographic from '../infographics/2.3-ExperimentalConditionsInfographic';
import InlineEpisodePreview from '../ui/InlineEpisodePreview';
import { useState, useEffect } from 'react';
// CSS imported via main.css

function Methodology({ expandAllDetails = false }) {
  const [showEpisodePreview, setShowEpisodePreview] = useState(false);
  const [showNightMovesPreview, setShowNightMovesPreview] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});

  // Expand all details when expandAllDetails prop is true
  useEffect(() => {
    if (expandAllDetails) {
      setExpandedDetails({
        'participants': true,
        'experimental-conditions': true,
        'instagram-videos': true,
        'timeline-measures': true
      });
    }
  }, [expandAllDetails]);

  const toggleDetails = (detailId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [detailId]: !prev[detailId]
    }));
  };

  return (
    <section className="report-section">
      <h2>
        Methodology
      </h2>

      <div className="methodology-content">
        <div className="methodology-section">
          <h3>Overview</h3>
          <p>
            The study recruited ~5000 participants whose demographic characteristics were matched using Nielsen data to resemble viewers of Grey's Anatomy Season 21. Participants were randomly assigned to a Control Group; a Heat Wave Episode Group; and a Multiplatform Group: 
            <ul>
              <li>
                <b>Heat Wave Episode Group:</b> watched Season 21, Episode 8 (“Drop It Like It’s Hot”), in which a severe heat wave disrupts hospital operations and patient care.
              </li>
              <li>
                <b>Multiplatform Group:</b> watched the same episode as the Heat Wave group, followed by social media content tying the episode content to climate change. This allowed us to study the joint effect of viewing content along with complementary social media impact campaigns.
              </li>
              <li>
                <b>Control Group:</b> watched Season 21, Episode 6 (“Night Moves”), which includes no mention of heatwaves.
              </li>
            </ul>
            To track the impact of viewing over time, we measured audiences at three different points: 
            <ul>
              <li>Baseline (7-10 days prior to viewing) [N=4830]</li>
              <li>Immediately after watching the show [N=3575]</li>
              <li>15-20 days after watching the show [N=3219]</li>
            </ul>
            At each point, participants completed a survey measuring perceptions of heat waves, knowledge of heat-related health risks, confidence in taking protective actions, support for relevant policy measures, and beliefs about climate change’s relevance to daily life.
          </p>
        </div>
<div className="methodology-section">
          <h3>Participants</h3>
          <div className="expandable-details">
            <div className="details-summary">
              We employed a three-arm, longitudinal randomized controlled design across three waves of data collection. At Wave 1, participants (N = 4,830) were quota-sampled using Nielsen data to match the demographic profile of Grey's Anatomy Season 21 viewers on age, sex, race/ethnicity, income, and region.
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['participants'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('participants')}
            >
              {expandedDetails['participants'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['participants'] ? 'expanded' : ''}`}>
              <p>Given the large sample size, towards the end of recruitment, we used Connect's "relax quotas" feature which allowed participants to enter if they met most (but not all) of the recruitment quota categories.</p>
              <p>Data were collected via Cloud Research Connect online survey platform, and participants were compensated at above market rates, which increased across waves to minimize attrition. Attrition was high between baseline and the viewing assignment (~30%), with 3,454 participants returning to view the episode. This high rate of attrition is likely due to the survey length, which required participants to watch a 40-min episode and then complete an 8-10 minute survey. We saw much lower attrition (~7%) between Wave 2 and Wave 3, with 3,204 out of 3,454 returning to complete the final post-exposure survey.</p>
            </div>
          </div>
        </div>
        <div className="methodology-section">
          <h3>Experimental Conditions</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <strong>Three randomized groups:</strong> Control (non-climate episode), Heat Wave (climate episode), and Multiplatform (episode + social media).
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['experimental-conditions'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('experimental-conditions')}
            >
              {expandedDetails['experimental-conditions'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['experimental-conditions'] ? 'expanded' : ''}`}>
              <p>
                Participants were randomly assigned to one of three groups:
              </p>
              <ul>
                <li>
                  <strong>Control Group</strong> aka Non-Climate or Weather-Related Episode<strong> (N = 1,040):</strong> Viewed Season 21, Episode 6 (<button
                    className="episode-preview-trigger"
                    onClick={() => setShowNightMovesPreview(true)}
                  >
                    "Night Moves"
                  </button>)—a narrative episode with no reference to extreme heat.
                </li>
                <li>
                  <strong>Heat Wave Group (N = 1,091):</strong> Viewed Season 21, Episode 8 (<button
                    className="episode-preview-trigger"
                    onClick={() => setShowEpisodePreview(true)}
                  >
                    "Drop it Like it's Hot"
                  </button>), in which a severe heat wave disrupts hospital operations and patient care.
                </li>
                <li>
                  <strong>Multiplatform Group</strong> aka Heat Wave Episode + Social Media <strong>(N = 1,073):</strong> Viewed the same episode as the Heat Wave group, followed by one of four climate-related social media videos developed to contextualize the episode's content within broader climate-health dynamics.
                </li>
              </ul>

              {/* <div className="inline-episodes-container">
                <InlineEpisodePreview episode="night" />
                <InlineEpisodePreview episode="hot" />
              </div> */}
            </div>
          </div>

          <ExperimentalConditionsInfographic
            onShowNightMovesPreview={() => setShowNightMovesPreview(true)}
            onShowEpisodePreview={() => setShowEpisodePreview(true)}
          />
        </div>

        <div className="methodology-section">
          <h3>Instagram Videos</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <strong>Four climate-related Instagram videos</strong> were used in the Multiplatform Group condition to contextualize the episode's content.
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['instagram-videos'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('instagram-videos')}
            >
              {expandedDetails['instagram-videos'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['instagram-videos'] ? 'expanded' : ''}`}>
              <p>
                The four climate-related social media videos used in the Heat Wave + Social Media condition were commissioned and distributed by Action for the Climate Emergency (ACE), a youth-led U.S. climate-advocacy nonprofit. 
              </p>
              <p>The videos were created by the following Instagram creators:</p>
              <ul>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG8WJFNuxwm/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@eyeinspired</a></strong>: Kelly Edelman posts bold, mixed-media portraits with vivid colors and occasional art-tutorials—popular among her millions of followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG_myvfBnLC/" target="_blank" rel="noopener noreferrer">@becomingdrdevore</a></strong>: Syd shares transparent pre-med and med-school journey content, MCAT tips, and application advice for aspiring medical students
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG6BgVAxhij/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@scotpilie_wx</a></strong>: New Orleans meteorologist Scot Pilié blends weather updates, personal lifestyle and foodie moments to engage his community of ~56K followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG5o77lAYV4/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@farmernick</a></strong>: Nick Cutsumpas uses his platform to coach urban gardening, sustainability, and plant-care through hands-on tutorials and environmental activism
                </li>
              </ul>
            </div>
          </div>
          
          <InstagramCarousel />
        </div>

        <div className="methodology-section">
          <h3>Timeline and Measures</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <strong>Longitudinal design across three time points:</strong> baseline, immediate post-viewing, and follow-up survey ~2-3 weeks later to assess sustained effects.
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['timeline-measures'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('timeline-measures')}
            >
              {expandedDetails['timeline-measures'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['timeline-measures'] ? 'expanded' : ''}`}>
              <p>
                We employed a longitudinal design to assess both immediate and sustained effects of the viewing experience. Participants completed surveys at three time points: a baseline assessment prior to viewing, an immediate post-viewing survey, and a follow-up survey approximately two to three weeks later to examine whether any observed effects persisted over time.
              </p>

              <p>
                We assessed outcomes using established and previously validated measures from climate and risk communication research. Participants responded to multi-question scales that captured key factors such as perceived threat of heat waves, knowledge of heat-related health risks, confidence in taking protective actions, support for relevant policy measures, and beliefs about climate change's relevance to daily life. See <a href={`${import.meta.env.BASE_URL}html/survey-instrument.html`} target="_blank" rel="noopener noreferrer">full survey instrument</a>.
              </p>
              <p>
                Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode were excluded from analysis. Analyses were <a href="https://osf.io/uv9x3" target="_blank" rel="noopener noreferrer">preregistered</a> and conducted according to a hierarchical model structure, with appropriate corrections for multiple comparisons.
              </p>
              <p>
                This study contributes to a growing body of work assessing the narrative mechanisms through which entertainment can shift public norms and attitudes related to climate change, particularly in areas – such as extreme heat – where awareness remains low despite increasing risk.
              </p>
            </div>
          </div>

          <TimelineInfographic />
        </div>
      </div>

      <EpisodePreview
        isOpen={showEpisodePreview}
        onClose={() => setShowEpisodePreview(false)}
        episode="hot"
      />

      <EpisodePreview
        isOpen={showNightMovesPreview}
        onClose={() => setShowNightMovesPreview(false)}
        episode="night"
      />
    </section>
  )
}

export default Methodology
