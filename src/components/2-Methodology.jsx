import InstagramCarousel from './InstagramCarousel';
import TimelineInfographic from './TimelineInfographic';

function Methodology() {
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
          <strong>Control Group (N = 1,040):</strong> Viewed Season 21, Episode 6 (<a href="https://www.imdb.com/title/tt33528524/" target="_blank" rel="noopener noreferrer">"Night Moves"</a>)—a narrative episode with no reference to extreme heat or climate.
        </li>
        <li>
          <strong>Heatwave Group (N = 1,091):</strong> Viewed Season 21, Episode 8 (<a href="https://www.imdb.com/title/tt33528529/" target="_blank" rel="noopener noreferrer">"Drop it Like it's Hot"</a>), in which a severe heatwave disrupts hospital operations and patient care.
        </li>
        <li>
          <strong>Heatwave + Handoff Group (N = 1,073):</strong> Viewed the same episode as the Heatwave group, followed by one of four climate-related Instagram videos developed to contextualize the episode's content within broader climate-health dynamics.
        </li>
      </ul>

      <InstagramCarousel />

      <h3>
        Timeline and Measures
      </h3>
      
      <TimelineInfographic />

      <p>
        All outcome variables were derived from established measures or adapted from prior work on climate and risk communication. Multi-item batteries captured constructs including heatwave threat perception, knowledge of heat-related health risks, confidence in protective action, support for policy interventions, and beliefs about climate change's relevance to daily life. See <a href={`${import.meta.env.BASE_URL}survey-instrument.html`} target="_blank" rel="noopener noreferrer">full survey instrument</a>.
      </p>
      <p>
        Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode (based on telemetry data) were excluded from analysis. Analyses were <a href="https://osf.io/uv9x3" target="_blank" rel="noopener noreferrer">preregistered</a> and conducted according to a hierarchical model structure, with appropriate corrections for multiple comparisons.
      </p>
      <p>
        This study contributes to a growing body of work assessing the narrative mechanisms through which entertainment media can shift public norms and attitudes related to climate change, particularly in areas—such as extreme heat—where awareness remains low despite increasing risk.
      </p>
    </section>
  )
}

export default Methodology
      </p>
      <p>
        Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode (based on telemetry data) were excluded from analysis. Analyses were <a href="https://osf.io/uv9x3" target="_blank" rel="noopener noreferrer">preregistered</a> and conducted according to a hierarchical model structure, with appropriate corrections for multiple comparisons.
      </p>
      <p>
        This study contributes to a growing body of work assessing the narrative mechanisms through which entertainment media can shift public norms and attitudes related to climate change, particularly in areas—such as extreme heat—where awareness remains low despite increasing risk.
      </p>
    </section>
  )
}

export default Methodology

