function Methodology({ isEditMode }) {
  return (
    <section className="report-section">
      <h2 contentEditable={isEditMode} suppressContentEditableWarning={true}>
        Methodology
      </h2>
      <p contentEditable={isEditMode} suppressContentEditableWarning={true}>
        We employed a three-arm, longitudinal randomized controlled design across three waves of data collection. Participants (N = 4,830) were quota-sampled to match the demographic profile of Grey's Anatomy Season 21 viewers on age, sex, race/ethnicity, income, and region. Data were collected via Cloud Research Connect online survey platform, and participants were compensated at market rates increasing across waves to minimize attrition.
      </p>
      
      <h3 contentEditable={isEditMode} suppressContentEditableWarning={true}>
        Experimental Conditions
      </h3>
      <p contentEditable={isEditMode} suppressContentEditableWarning={true}>
        Participants were randomly assigned to one of three groups:
      </p>
      <ul>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Control Group:</strong> Viewed Season 21, Episode 6 ("Night Moves")—a narrative episode with no reference to extreme heat or climate.
        </li>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Treatment Group:</strong> Viewed Season 21, Episode 8 ("Drop it Like it's Hot"), in which a severe heatwave disrupts hospital operations and patient care.
        </li>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Hand-Off Group:</strong> Viewed the same episode as the Treatment group, followed by one of four climate-related Instagram videos developed to contextualize the episode's content within broader climate-health dynamics.
        </li>
      </ul>

      <h3 contentEditable={isEditMode} suppressContentEditableWarning={true}>
        Timeline and Measures
      </h3>
      <ul>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Wave 1 (N = 4,830):</strong> Baseline survey administered 7-12 days prior to viewing, assessing demographics, media habits, and key outcome variables (when applicable).
        </li>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Wave 2 (N = 3,575):</strong> Participants completed the viewing assignment and then responded to a post-exposure survey assessing perceived heat risk, health system impacts, climate beliefs, policy preferences, and behavioral intentions.
        </li>
        <li contentEditable={isEditMode} suppressContentEditableWarning={true}>
          <strong>Wave 3 (N = 3XXX):</strong> A follow-up survey, administered 15-20 days post-viewing, assessed the durability of effects.
        </li>
      </ul>
      
      <p contentEditable={isEditMode} suppressContentEditableWarning={true}>
        All outcome variables were derived from established measures or adapted from prior work on climate and risk communication. Multi-item batteries captured constructs including heatwave threat perception, knowledge of heat-related health risks, confidence in protective action, support for policy interventions, and beliefs about climate change's relevance to daily life. See full survey instrument.
      </p>
      <p contentEditable={isEditMode} suppressContentEditableWarning={true}>
        Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode (based on telemetry data) were excluded from analysis. Analyses were preregistered and conducted according to a hierarchical model structure, with appropriate corrections for multiple comparisons.
      </p>
      <p contentEditable={isEditMode} suppressContentEditableWarning={true}>
        This study contributes to a growing body of work assessing the narrative mechanisms through which entertainment media can shift public norms and attitudes related to climate change, particularly in areas—such as extreme heat—where awareness remains low despite increasing risk.
      </p>
    </section>
  )
}

export default Methodology
