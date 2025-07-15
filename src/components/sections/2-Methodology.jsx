import InstagramCarousel from '../infographics/2.4-InstagramCarousel';
import TimelineInfographic from '../infographics/2.5-TimelineInfographic';
import EpisodePreview from '../infographics/2.2-EpisodePreview';
import ExperimentalConditionsInfographic from '../infographics/2.3-ExperimentalConditionsInfographic';
import InlineEpisodePreview from '../ui/InlineEpisodePreview';
import { useState } from 'react';
// CSS imported via main.css

function Methodology() {
  const [showEpisodePreview, setShowEpisodePreview] = useState(false);
  const [showNightMovesPreview, setShowNightMovesPreview] = useState(false);

  return (
    <section className="report-section">
      <h2>
        Methodology
      </h2>
      <p>
        We employed a three-arm, longitudinal randomized controlled design across three waves of data collection. Participants (N = 4,830) were quota-sampled to match the demographic profile of Grey's Anatomy Season 21 viewers on age, sex, race/ethnicity, income, and region. Data were collected via Cloud Research Connect online survey platform, and participants were compensated at market rates increasing across waves to minimize attrition. Attrition was high between baseline and the viewing assignment, with 3,454 participants completing the viewing assignment and 3,204 responding to the post-exposure survey.
      </p>

      <h3>
        Experimental Conditions
      </h3>
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

      <div className="inline-episodes-container">
        <InlineEpisodePreview episode="night" />
        <InlineEpisodePreview episode="hot" />
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

      <ExperimentalConditionsInfographic
        onShowNightMovesPreview={() => setShowNightMovesPreview(true)}
        onShowEpisodePreview={() => setShowEpisodePreview(true)}
      />



      <InstagramCarousel />

      <h3>
        Timeline and Measures
      </h3>
      <p>
        We employed a longitudinal design to assess both immediate and sustained effects of the viewing experience. Participants completed surveys at three time points: a baseline assessment prior to viewing, an immediate post-viewing survey, and a follow-up survey approximately two to three weeks later to examine whether any observed effects persisted over time.
      </p>

      <TimelineInfographic />

      <p>
        We assessed outcomes using established and previously validated measures from climate and risk communication research. Participants responded to multi-question scales that captured key factors such as perceived threat of heat waves, knowledge of heat-related health risks, confidence in taking protective actions, support for relevant policy measures, and beliefs about climate change’s relevance to daily life. See <a href={`${import.meta.env.BASE_URL}html/survey-instrument.html`} target="_blank" rel="noopener noreferrer">full survey instrument</a>.
      </p>
      <p>
        Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode were excluded from analysis. Analyses were <a href="https://osf.io/uv9x3" target="_blank" rel="noopener noreferrer">preregistered</a> and conducted according to a hierarchical model structure, with appropriate corrections for multiple comparisons.
      </p>
      <p>
        This study contributes to a growing body of work assessing the narrative mechanisms through which entertainment can shift public norms and attitudes related to climate change, particularly in areas – such as extreme heat – where awareness remains low despite increasing risk.
      </p>
    </section>
  )
}

export default Methodology
