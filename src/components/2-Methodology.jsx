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

      <p>
        The four climate-related Instagram videos used in the handoff condition featured content creators discussing heat-related health impacts and climate adaptation strategies:
      </p>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}insta_scotpilie_wx.html`}
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Instagram post by Scot Pilié"
          />
        </div>
        <div style={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}insta_farmernick.html`}
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Instagram post by Nick Cutsumpas"
          />
        </div>
        <div style={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}insta_eyeinspired.html`}
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Instagram post by Kelly Edelman"
          />
        </div>
        <div style={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}insta_becomingdrdevore.html`}
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Instagram post by Sydney DeVore"
          />
        </div>
      </div>

      <h3>
        Timeline and Measures
      </h3>
      <ul>
        <li>
          <strong>Wave 1 (N = 4,830):</strong> Baseline survey administered 7-12 days prior to viewing, assessing demographics, media habits, and key outcome variables (when applicable).
        </li>
        <li>
          <strong>Wave 2 (N = 3,575):</strong> Participants completed the viewing assignment and then responded to a post-exposure survey assessing perceived heat risk, health system impacts, climate beliefs, policy preferences, and behavioral intentions.
        </li>
        <li>
          <strong>Wave 3 (N = 3XXX):</strong> A follow-up survey, administered 15-20 days post-viewing, assessed the durability of effects.
        </li>
      </ul>
      
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
